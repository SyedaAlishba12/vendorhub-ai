"""
controllers/fraudController.py — Business logic for Admin Fraud Monitoring.

Tables queried (all on shared Neon DB, database/base.py Base):
    risk_reports   — RiskReport model (your module)
    conversations  — Conversation model (your module)
    messages       — Message model (your module)

Tables deliberately NOT touched:
    Order, Review, ReviewReport, Invoice, Shipment, Rating
    (Zainab's connection.py Base — not yet on shared DB)

Score convention (same as riskController):
    HIGHER score = SAFER / LOWER RISK.
    score of 0   = maximum risk.
    score of 100 = completely safe.

Functions
---------
get_flagged_vendors()        — vendors matching any high-risk criterion,
                               latest report per vendor, sorted riskiest first.
get_score_deterioration()    — vendors whose latest score dropped ≥15 pts
                               versus their immediately prior report.
get_messaging_anomalies()    — top senders by volume + conversations with
                               high soft-delete ratio.
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


# ---------------------------------------------------------------------------
# Thresholds (named constants so the admin can tune them later)
# ---------------------------------------------------------------------------

SCORE_CRITICAL_THRESHOLD   = 40   # overall_risk_score < this → flagged
MULTI_FLAG_THRESHOLD       = 2    # ≥ this many fraud_indicators → flagged
DETERIORATION_MIN_DROP     = 15   # score drop ≥ this → deterioration alert
HIGH_DELETE_RATIO_THRESHOLD = 0.25  # ≥25 % soft-deleted messages in a convo
TOP_SENDERS_LIMIT          = 10   # how many top-volume senders to return


# ---------------------------------------------------------------------------
# 1. get_flagged_vendors
# ---------------------------------------------------------------------------

async def get_flagged_vendors(db: AsyncSession) -> dict:
    """
    Return the latest risk report for every vendor that meets at least one
    of the following criteria (OR logic — any criterion flags the vendor):

        (a) overall_risk_score < SCORE_CRITICAL_THRESHOLD  (score < 40)
        (b) array_length(fraud_indicators, 1) >= MULTI_FLAG_THRESHOLD  (≥2 flags)
        (c) certification_status IN ('expired', 'unverified')

    Results are sorted by overall_risk_score ASC (riskiest first).

    The query uses a LATERAL / DISTINCT ON pattern to get exactly one
    (the most recent) report per vendor_id before applying the filters,
    so a vendor is counted once regardless of how many reports exist.

    Returns
    -------
    {
        "flagged_vendors": [ { ...report fields + "flag_reasons": [...] } ],
        "summary": {
            "total_flagged":        int,
            "critical_score_count": int,   # score < 40
            "multi_flag_count":     int,   # ≥2 fraud_indicators
            "bad_cert_count":       int,   # expired or unverified
        }
    }
    """

    rows = await db.execute(text("""
        WITH latest AS (
            -- One row per vendor_id: the most recent report only
            SELECT DISTINCT ON (vendor_id)
                id,
                vendor_id,
                overall_risk_score,
                financial_risk_score,
                delivery_risk_score,
                fraud_indicators,
                certification_status,
                business_age_years,
                ai_recommendation,
                ai_used,
                created_at
            FROM  risk_reports
            ORDER BY vendor_id, created_at DESC
        )
        SELECT
            id::text,
            vendor_id::text,
            overall_risk_score,
            financial_risk_score,
            delivery_risk_score,
            fraud_indicators,
            certification_status,
            business_age_years,
            ai_recommendation,
            ai_used,
            created_at,
            -- flag_reasons: which criteria this vendor triggered
            ARRAY_REMOVE(ARRAY[
                CASE WHEN overall_risk_score < :score_thresh
                     THEN 'critical_score' END,
                CASE WHEN array_length(fraud_indicators, 1) >= :flag_thresh
                     THEN 'multiple_fraud_flags' END,
                CASE WHEN certification_status IN ('expired', 'unverified')
                     THEN 'bad_certification' END
            ], NULL)  AS flag_reasons
        FROM latest
        WHERE
            overall_risk_score < :score_thresh
            OR array_length(fraud_indicators, 1) >= :flag_thresh
            OR certification_status IN ('expired', 'unverified')
        ORDER BY overall_risk_score ASC;
    """), {
        "score_thresh": SCORE_CRITICAL_THRESHOLD,
        "flag_thresh":  MULTI_FLAG_THRESHOLD,
    })

    vendors = []
    total_flagged      = 0
    critical_score     = 0
    multi_flag         = 0
    bad_cert           = 0

    for r in rows.fetchall():
        indicators = r[5] or []
        flag_reasons = list(r[11]) if r[11] else []
        vendors.append({
            "id":                   r[0],
            "vendor_id":            r[1],
            "overall_risk_score":   r[2],
            "financial_risk_score": r[3],
            "delivery_risk_score":  r[4],
            "fraud_indicators":     indicators,
            "certification_status": r[6],
            "business_age_years":   r[7],
            "ai_recommendation":    r[8],
            "ai_used":              bool(r[9]),
            "last_assessed_at":     r[10].isoformat() if r[10] else None,
            "flag_reasons":         flag_reasons,
        })
        total_flagged += 1
        if r[2] < SCORE_CRITICAL_THRESHOLD:
            critical_score += 1
        if r[5] and len(r[5]) >= MULTI_FLAG_THRESHOLD:
            multi_flag += 1
        if r[6] in ("expired", "unverified"):
            bad_cert += 1

    return {
        "flagged_vendors": vendors,
        "summary": {
            "total_flagged":        total_flagged,
            "critical_score_count": critical_score,
            "multi_flag_count":     multi_flag,
            "bad_cert_count":       bad_cert,
        },
        "thresholds": {
            "score_threshold":    SCORE_CRITICAL_THRESHOLD,
            "multi_flag_min":     MULTI_FLAG_THRESHOLD,
            "bad_cert_statuses":  ["expired", "unverified"],
        },
    }


# ---------------------------------------------------------------------------
# 2. get_score_deterioration
# ---------------------------------------------------------------------------

async def get_score_deterioration(db: AsyncSession) -> dict:
    """
    Return vendors whose latest overall_risk_score has dropped by at least
    DETERIORATION_MIN_DROP points compared to their immediately prior report.

    Uses a window function (LAG) to compare each report with the previous
    one for the same vendor, then selects only the latest-pair where the
    drop crosses the threshold.

    Returns
    -------
    {
        "deteriorated_vendors": [
            {
                "vendor_id":          str,
                "latest_score":       int,
                "prior_score":        int,
                "score_drop":         int,        # always positive
                "latest_assessed_at": str (ISO),
                "prior_assessed_at":  str (ISO),
                "latest_fraud_flags": list[str],
                "certification_status": str,
            }
        ],
        "summary": {
            "total_deteriorated": int,
            "min_drop_threshold": int,
            "avg_drop":           float,          # average drop across results
        }
    }
    """

    rows = await db.execute(text("""
        WITH ranked AS (
            SELECT
                vendor_id,
                overall_risk_score,
                fraud_indicators,
                certification_status,
                created_at,
                LAG(overall_risk_score) OVER (
                    PARTITION BY vendor_id
                    ORDER BY created_at ASC
                ) AS prior_score,
                LAG(created_at) OVER (
                    PARTITION BY vendor_id
                    ORDER BY created_at ASC
                ) AS prior_assessed_at,
                ROW_NUMBER() OVER (
                    PARTITION BY vendor_id
                    ORDER BY created_at DESC
                ) AS rn
            FROM risk_reports
        )
        SELECT
            vendor_id::text,
            overall_risk_score                  AS latest_score,
            prior_score,
            (prior_score - overall_risk_score)  AS score_drop,
            created_at                          AS latest_assessed_at,
            prior_assessed_at,
            fraud_indicators,
            certification_status
        FROM ranked
        WHERE
            rn = 1
            AND prior_score IS NOT NULL
            AND (prior_score - overall_risk_score) >= :min_drop
        ORDER BY score_drop DESC;
    """), {"min_drop": DETERIORATION_MIN_DROP})

    results  = []
    total    = 0
    drop_sum = 0

    for r in rows.fetchall():
        drop = int(r[3])
        results.append({
            "vendor_id":            r[0],
            "latest_score":         int(r[1]),
            "prior_score":          int(r[2]),
            "score_drop":           drop,
            "latest_assessed_at":   r[4].isoformat() if r[4] else None,
            "prior_assessed_at":    r[5].isoformat() if r[5] else None,
            "latest_fraud_flags":   list(r[6] or []),
            "certification_status": r[7],
        })
        total    += 1
        drop_sum += drop

    avg_drop = round(drop_sum / total, 1) if total else 0.0

    return {
        "deteriorated_vendors": results,
        "summary": {
            "total_deteriorated": total,
            "min_drop_threshold": DETERIORATION_MIN_DROP,
            "avg_drop":           avg_drop,
        },
    }


# ---------------------------------------------------------------------------
# 3. get_messaging_anomalies
# ---------------------------------------------------------------------------

async def get_messaging_anomalies(db: AsyncSession) -> dict:
    """
    Surface two messaging-derived fraud signals from the messages and
    conversations tables:

    (a) Top senders by message volume (potential spam / bot activity).
        Returns the TOP_SENDERS_LIMIT senders with the highest non-deleted
        message count, along with their attachment ratio.

    (b) Conversations with a high soft-delete ratio (potential evidence
        scrubbing). Returns conversations where ≥ HIGH_DELETE_RATIO_THRESHOLD
        of all messages have been soft-deleted.

    NOTE on participant_ids: conversations.participant_ids is a PostgreSQL
    ARRAY — cross-conversation participant aggregation is possible but
    requires array scans rather than an indexed join.  We avoid full-array
    aggregation here to stay query-efficient; per-conversation stats
    (message counts, delete ratio) use the normalised messages.conversation_id
    FK instead.

    Returns
    -------
    {
        "top_senders": [
            {
                "sender_id":        str,
                "total_messages":   int,
                "attachment_count": int,   # image + document + voice
                "text_count":       int,
                "attachment_ratio": float, # 0.0–1.0
            }
        ],
        "high_delete_conversations": [
            {
                "conversation_id":   str,
                "total_messages":    int,
                "deleted_messages":  int,
                "delete_ratio":      float,
                "last_message_at":   str | null,
            }
        ],
        "summary": {
            "total_conversations":              int,
            "conversations_with_high_delete":   int,
            "delete_ratio_threshold":           float,
            "top_senders_limit":                int,
        }
    }
    """

    # -- (a) Top senders by volume ------------------------------------------
    sender_rows = await db.execute(text("""
        SELECT
            sender_id::text,
            COUNT(*)                                            AS total_messages,
            COUNT(*) FILTER (WHERE message_type IN ('image','document','voice'))
                                                                AS attachment_count,
            COUNT(*) FILTER (WHERE message_type = 'text')       AS text_count
        FROM  messages
        WHERE is_deleted = false
        GROUP BY sender_id
        ORDER BY total_messages DESC
        LIMIT :limit;
    """), {"limit": TOP_SENDERS_LIMIT})

    top_senders = []
    for r in sender_rows.fetchall():
        total = int(r[1])
        attach = int(r[2])
        top_senders.append({
            "sender_id":        r[0],
            "total_messages":   total,
            "attachment_count": attach,
            "text_count":       int(r[3]),
            "attachment_ratio": round(attach / total, 3) if total else 0.0,
        })

    # -- (b) High soft-delete ratio conversations ----------------------------
    delete_rows = await db.execute(text("""
        SELECT
            conversation_id::text,
            COUNT(*)                                        AS total_messages,
            COUNT(*) FILTER (WHERE is_deleted = true)      AS deleted_messages,
            ROUND(
                COUNT(*) FILTER (WHERE is_deleted = true)::numeric
                / NULLIF(COUNT(*), 0),
                3
            )                                               AS delete_ratio
        FROM  messages
        GROUP BY conversation_id
        HAVING
            COUNT(*) > 0
            AND (
                COUNT(*) FILTER (WHERE is_deleted = true)::numeric
                / NULLIF(COUNT(*), 0)
            ) >= :threshold
        ORDER BY delete_ratio DESC;
    """), {"threshold": HIGH_DELETE_RATIO_THRESHOLD})

    high_delete = []
    for r in delete_rows.fetchall():
        # Fetch last_message_at from the conversations table for context
        high_delete.append({
            "conversation_id":  r[0],
            "total_messages":   int(r[1]),
            "deleted_messages": int(r[2]),
            "delete_ratio":     float(r[3]) if r[3] else 0.0,
        })

    # Enrich with last_message_at from conversations where available
    if high_delete:
        conv_ids = [c["conversation_id"] for c in high_delete]
        # Use ANY with a text cast to avoid parameter-count issues
        conv_id_list = ", ".join(f"'{cid}'" for cid in conv_ids)
        last_msg_rows = await db.execute(text(f"""
            SELECT id::text, last_message_at
            FROM conversations
            WHERE id::text IN ({conv_id_list});
        """))
        last_msg_map = {
            r[0]: r[1].isoformat() if r[1] else None
            for r in last_msg_rows.fetchall()
        }
        for c in high_delete:
            c["last_message_at"] = last_msg_map.get(c["conversation_id"])

    # -- Summary counts -------------------------------------------------------
    total_convos_row = await db.execute(text("SELECT COUNT(*) FROM conversations;"))
    total_convos = int(total_convos_row.scalar() or 0)

    return {
        "top_senders":                top_senders,
        "high_delete_conversations":  high_delete,
        "summary": {
            "total_conversations":            total_convos,
            "conversations_with_high_delete": len(high_delete),
            "delete_ratio_threshold":         HIGH_DELETE_RATIO_THRESHOLD,
            "top_senders_limit":              TOP_SENDERS_LIMIT,
        },
    }
