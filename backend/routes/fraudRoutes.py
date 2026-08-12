"""
routes/fraudRoutes.py — FastAPI APIRouter for Admin Fraud Monitoring.

Response envelope (same as riskRoutes / messageRoutes):
    { "success": true,  "data": <payload> }    on success
    { "success": false, "message": "<text>" }  on error (via HTTPException)

Endpoints
---------
GET /api/fraud/flagged-vendors
    Vendors with score < 40 OR ≥2 fraud_indicators OR expired/unverified cert.
    Returns latest report per vendor, sorted riskiest first, plus KPI summary.

GET /api/fraud/deterioration
    Vendors whose latest overall_risk_score dropped ≥15 pts vs. prior report.
    Returns paired latest/prior scores and the absolute drop, sorted by drop DESC.

GET /api/fraud/messaging-anomalies
    Top senders by volume + conversations with high soft-delete ratio.
    Derived entirely from the messages + conversations tables.

GET /api/fraud/flag-frequency
    Re-exposes the fraud_flag_frequency slice from get_risk_analytics() so
    the frontend can fetch it without calling the heavier /api/risk/analytics
    endpoint.  No recomputation — just a thin wrapper.

NOTE: All four endpoints query only risk_reports, messages, and conversations
(database/base.py Base, confirmed on shared Neon DB).  No dependency on
Zainab's Order/Review/Rating/Shipment tables (connection.py Base).
"""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from common.deps import get_current_user_id
from controllers.fraudController import (
    get_flagged_vendors,
    get_score_deterioration,
    get_messaging_anomalies,
)
from controllers.riskController import get_risk_analytics
from database.session import get_db

router = APIRouter(prefix="/api/fraud", tags=["Fraud Monitoring"])


# ---------------------------------------------------------------------------
# Response envelope helper (same pattern as riskRoutes)
# ---------------------------------------------------------------------------

def _ok(data: object, status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "data": data},
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get(
    "/flagged-vendors",
    summary="List vendors that match high-risk fraud criteria",
    response_description=(
        "Latest risk report per flagged vendor, sorted by overall_risk_score ASC "
        "(riskiest first), plus KPI summary counts."
    ),
    status_code=200,
)
async def route_flagged_vendors(
    db: AsyncSession = Depends(get_db),
    _current_user: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **GET /api/fraud/flagged-vendors**

    Returns every vendor whose most-recent risk report satisfies at least one
    of the following criteria (OR logic):

    - `overall_risk_score < 40` (Critical / High risk tier)
    - `array_length(fraud_indicators, 1) >= 2` (multiple simultaneous flags)
    - `certification_status IN ('expired', 'unverified')`

    Each result row includes a `flag_reasons` array naming which criteria
    were triggered, so the frontend can show per-vendor callout badges.

    Sourced from: **risk_reports only**.
    """
    data = await get_flagged_vendors(db)
    return _ok(data)


@router.get(
    "/deterioration",
    summary="Vendors with a significant score drop since their prior report",
    response_description=(
        "Vendors whose latest overall_risk_score dropped ≥15 pts vs. "
        "their immediately prior report, sorted by drop DESC."
    ),
    status_code=200,
)
async def route_score_deterioration(
    db: AsyncSession = Depends(get_db),
    _current_user: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **GET /api/fraud/deterioration**

    Uses a LAG window function to pair each vendor's latest report with their
    prior report, then filters to pairs where the score drop is ≥ 15 points.

    A vendor appears here even if their current score is still "safe" (e.g.
    dropped from 90 → 70) — the signal is the *trend*, not just the absolute
    value.  Combine with /flagged-vendors for vendors that are both trending
    down AND already in a critical tier.

    Sourced from: **risk_reports only**.
    """
    data = await get_score_deterioration(db)
    return _ok(data)


@router.get(
    "/messaging-anomalies",
    summary="Messaging-layer fraud signals: volume spikes and evidence scrubbing",
    response_description=(
        "Top senders by message volume (bot/spam candidates) + "
        "conversations with high soft-delete ratio (evidence scrubbing)."
    ),
    status_code=200,
)
async def route_messaging_anomalies(
    db: AsyncSession = Depends(get_db),
    _current_user: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **GET /api/fraud/messaging-anomalies**

    Two signals derived from the `messages` and `conversations` tables:

    1. **Top senders by volume** — users who have sent the most non-deleted
       messages platform-wide.  High volume relative to peers may indicate
       automated or spam behaviour.  Includes `attachment_ratio` for context.

    2. **High soft-delete ratio conversations** — conversations where ≥25 % of
       messages have been soft-deleted.  Unusual deletion patterns can indicate
       evidence scrubbing before a dispute.

    Sourced from: **messages + conversations only**.
    """
    data = await get_messaging_anomalies(db)
    return _ok(data)


@router.get(
    "/flag-frequency",
    summary="Fraud flag frequency across all vendors (thin wrapper over risk analytics)",
    response_description=(
        "Occurrences per flag string across all risk_reports, sorted descending."
    ),
    status_code=200,
)
async def route_flag_frequency(
    db: AsyncSession = Depends(get_db),
    _current_user: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **GET /api/fraud/flag-frequency**

    Re-exposes `fraud_flag_frequency` from the existing `get_risk_analytics()`
    function — no recomputation, same SQL, just a narrower endpoint so the
    Fraud Dashboard doesn't need to fetch the full /api/risk/analytics payload
    (which includes chart data the fraud page doesn't use).

    Sourced from: **risk_reports only**.
    """
    analytics = await get_risk_analytics(db)
    return _ok({
        "fraud_flag_frequency": analytics["fraud_flag_frequency"],
        "cert_status_breakdown": analytics["cert_status_breakdown"],
    })
