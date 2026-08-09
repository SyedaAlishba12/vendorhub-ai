"""
controllers/riskController.py — Business logic for the AI Risk Analysis module.

Score convention: HIGHER = SAFER (100 = safest, 0 = highest risk).

Architecture:
  1. compute_scores()       — Rule-based scoring engine (pure Python, no I/O).
  2. generate_ai_recommendation() — Calls Gemini API; falls back to rule-based text.
  3. analyze_vendor()       — Orchestrates: score → AI → persist → return.
  4. get_latest_report()    — Fetch most-recent report for a vendor.
  5. get_report_history()   — Paginated history for a vendor.
"""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.RiskReport import CertificationStatus, RiskReport

# ---------------------------------------------------------------------------
# Score convention constant (documented here for cross-module imports)
# ---------------------------------------------------------------------------
SCORE_MAX = 100   # safest
SCORE_MIN = 0     # riskiest

# ---------------------------------------------------------------------------
# V1 scoring weights (must sum to 1.0)
# ---------------------------------------------------------------------------
WEIGHT_FINANCIAL = 0.50
WEIGHT_DELIVERY  = 0.50

# ---------------------------------------------------------------------------
# Gemini AI client — lazy-initialised on first call
# Uses the new google.genai SDK (replaces deprecated google.generativeai)
# ---------------------------------------------------------------------------
_gemini_client = None
_gemini_model = None  # kept for backwards-compat with tests that reset it

def _get_gemini_client():
    """
    Initialise the Gemini async client once and cache it.
    Returns None if the API key is missing or the library isn't installed
    (which will trigger the rule-based fallback).
    """
    global _gemini_client, _gemini_model
    # Allow the test suite to force a re-init by setting _gemini_model = None
    if _gemini_client is not None and _gemini_model is not None:
        return _gemini_client

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None

    try:
        from google import genai  # noqa: PLC0415  (google-genai package)
        _gemini_client = genai.Client(api_key=api_key)
        _gemini_model = True  # sentinel so tests can reset via _gemini_model = None
        return _gemini_client
    except Exception:
        return None

# ---------------------------------------------------------------------------
# Serialisation
# ---------------------------------------------------------------------------

def _report_to_dict(report: RiskReport) -> dict:
    return {
        "id":                   str(report.id),
        "vendor_id":            str(report.vendor_id),
        "financial_risk_score": report.financial_risk_score,
        "delivery_risk_score":  report.delivery_risk_score,
        "overall_risk_score":   report.overall_risk_score,
        "fraud_indicators":     report.fraud_indicators or [],
        "certification_status": report.certification_status,
        "business_age_years":   report.business_age_years,
        "ai_recommendation":    report.ai_recommendation,
        "created_at":           report.created_at.isoformat() if report.created_at else None,
        "updated_at":           report.updated_at.isoformat() if report.updated_at else None,
    }

# ---------------------------------------------------------------------------
# 1. Rule-based scoring engine
# ---------------------------------------------------------------------------

def compute_scores(
    business_age_years: Optional[int],
    certification_status: str,
    annual_revenue_usd: Optional[float],
    on_time_delivery_rate: Optional[float],  # 0.0 – 1.0
    complaint_rate: Optional[float],          # 0.0 – 1.0 (lower = better)
) -> dict:
    """
    Compute financial_risk_score, delivery_risk_score, fraud_indicators,
    and overall_risk_score from vendor attributes.

    All inputs are optional so the engine degrades gracefully when a vendor
    module hasn't been built yet — missing values fall back to conservative
    (lower-trust) defaults.

    Returns a dict with keys matching the RiskReport columns.

    Score convention: HIGHER = SAFER  (100 = safest, 0 = riskiest).
    """
    fraud_flags: list[str] = []

    # ------------------------------------------------------------------
    # Financial risk score  (max 100)
    # Factors: business age, annual revenue
    # ------------------------------------------------------------------
    financial_score = 50  # neutral starting point

    # Business age contribution (max ±30 pts)
    age = business_age_years if business_age_years is not None else 0
    if age < 0.5:
        # Extremely new — high risk
        financial_score -= 30
        fraud_flags.append("business_age_under_6_months")
    elif age < 1:
        financial_score -= 20
        fraud_flags.append("business_age_under_1_year")
    elif age < 2:
        financial_score -= 10
    elif age < 5:
        financial_score += 5
    elif age >= 5:
        # Established vendor
        financial_score += 30

    # Revenue contribution (max ±20 pts)
    if annual_revenue_usd is not None:
        if annual_revenue_usd < 50_000:
            financial_score -= 20
            fraud_flags.append("very_low_annual_revenue")
        elif annual_revenue_usd < 250_000:
            financial_score -= 10
        elif annual_revenue_usd >= 1_000_000:
            financial_score += 20
        else:
            financial_score += 5

    financial_score = max(SCORE_MIN, min(SCORE_MAX, financial_score))

    # ------------------------------------------------------------------
    # Delivery risk score  (max 100)
    # Factors: certification status, on-time delivery rate, complaint rate
    # ------------------------------------------------------------------
    delivery_score = 60  # neutral-positive starting point

    cert = certification_status.lower() if certification_status else "unverified"
    if cert == CertificationStatus.verified.value:
        delivery_score += 20
    elif cert == CertificationStatus.pending.value:
        delivery_score += 5
    elif cert == CertificationStatus.expired.value:
        delivery_score -= 15
        fraud_flags.append("certification_expired")
    else:  # unverified
        delivery_score -= 20
        fraud_flags.append("no_certifications_on_file")

    if on_time_delivery_rate is not None:
        if on_time_delivery_rate < 0.70:
            delivery_score -= 25
            fraud_flags.append("low_on_time_delivery_rate")
        elif on_time_delivery_rate < 0.85:
            delivery_score -= 10
        elif on_time_delivery_rate >= 0.95:
            delivery_score += 20
        else:
            delivery_score += 5

    if complaint_rate is not None:
        if complaint_rate > 0.20:
            delivery_score -= 20
            fraud_flags.append("high_complaint_rate")
        elif complaint_rate > 0.10:
            delivery_score -= 10
        elif complaint_rate < 0.03:
            delivery_score += 10

    delivery_score = max(SCORE_MIN, min(SCORE_MAX, delivery_score))

    # ------------------------------------------------------------------
    # Overall score  (weighted average — see module header for weights)
    # ------------------------------------------------------------------
    overall = int(
        round(
            WEIGHT_FINANCIAL * financial_score
            + WEIGHT_DELIVERY * delivery_score
        )
    )
    overall = max(SCORE_MIN, min(SCORE_MAX, overall))

    return {
        "financial_risk_score": financial_score,
        "delivery_risk_score":  delivery_score,
        "overall_risk_score":   overall,
        "fraud_indicators":     list(set(fraud_flags)),  # deduplicate
    }

# ---------------------------------------------------------------------------
# 2. AI recommendation (Gemini, with rule-based fallback)
# ---------------------------------------------------------------------------

def _rule_based_recommendation(overall_score: int, fraud_flags: list[str]) -> str:
    """
    Deterministic fallback recommendation when the AI API is unavailable.
    Used as both the primary fallback and as context for the AI prompt.
    """
    if overall_score >= 80:
        tier = "Low Risk"
        action = "Safe to engage. Proceed with standard procurement checks."
    elif overall_score >= 60:
        tier = "Moderate Risk"
        action = "Proceed with caution. Conduct additional due diligence before committing to large orders."
    elif overall_score >= 40:
        tier = "High Risk"
        action = "Significant concerns identified. Require documentation and references before engagement."
    else:
        tier = "Critical Risk"
        action = "Do not engage without thorough vetting. Multiple risk factors detected."

    flags_text = ""
    if fraud_flags:
        readable = [f.replace("_", " ") for f in fraud_flags]
        flags_text = f" Key concerns: {', '.join(readable)}."

    return f"[{tier}] Overall score: {overall_score}/100.{flags_text} {action}"


async def generate_ai_recommendation(
    vendor_id: str,
    financial_score: int,
    delivery_score: int,
    overall_score: int,
    fraud_flags: list[str],
    certification_status: str,
    business_age_years: Optional[int],
) -> tuple[str, bool]:
    """
    Generate a human-readable risk recommendation using the Gemini API.

    Returns:
        (recommendation_text: str, used_ai: bool)
        used_ai=False means the rule-based fallback was used.

    Fallback triggers:
      - GEMINI_API_KEY not set
      - google-generativeai not installed
      - Any API error (network, quota, safety filter, etc.)
    """
    client = _get_gemini_client()
    if client is None:
        return _rule_based_recommendation(overall_score, fraud_flags), False

    flags_str = (
        ", ".join(f.replace("_", " ") for f in fraud_flags)
        if fraud_flags
        else "none"
    )

    prompt = f"""You are a procurement risk analyst for VendorHub AI, a B2B sourcing platform.
A vendor has been assessed with the following risk scores (scale: 0-100, HIGHER = SAFER):

- Financial risk score:  {financial_score}/100
- Delivery risk score:   {delivery_score}/100
- Overall risk score:    {overall_score}/100
- Certification status:  {certification_status}
- Business age:          {business_age_years if business_age_years is not None else "unknown"} years
- Risk flags detected:   {flags_str}

Write a concise, professional risk summary (3-5 sentences) for a procurement manager.
Include:
1. A risk tier label (Low Risk / Moderate Risk / High Risk / Critical Risk) based on the overall score.
2. The most important factors driving the assessment.
3. A clear recommended action (e.g. "Safe to engage", "Proceed with caution", "Do not engage without further vetting").

Be direct and specific. Do not use bullet points. Write in plain prose."""

    try:
        response = await client.aio.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
        )
        text = (response.text or "").strip()
        if not text:
            raise ValueError("Empty response from Gemini")
        return text, True
    except Exception as exc:
        # Log the failure but never surface it to the caller as an error.
        print(f"[riskController] Gemini API call failed ({type(exc).__name__}: {exc}). Using fallback.")
        return _rule_based_recommendation(overall_score, fraud_flags), False

# ---------------------------------------------------------------------------
# 3. Orchestrator — POST /api/risk/analyze
# ---------------------------------------------------------------------------

async def analyze_vendor(
    db: AsyncSession,
    vendor_id: str,
    # Vendor data — accepted directly in v1; replace with DB lookup when
    # the Vendor module is built.
    certification_status: str = "unverified",
    business_age_years: Optional[int] = None,
    annual_revenue_usd: Optional[float] = None,
    on_time_delivery_rate: Optional[float] = None,
    complaint_rate: Optional[float] = None,
) -> dict:
    """
    Run a full risk assessment for a vendor and persist the result.

    Calling this multiple times for the same vendor creates a new history
    entry each time — reports are never overwritten.
    """
    # Validate vendor_id
    try:
        vendor_uuid = uuid.UUID(vendor_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{vendor_id}' is not a valid UUID.",
        )

    # Normalise certification_status
    valid_statuses = {s.value for s in CertificationStatus}
    cert_status = certification_status.lower() if certification_status else "unverified"
    if cert_status not in valid_statuses:
        cert_status = "unverified"

    # Clamp optional rates to [0, 1]
    if on_time_delivery_rate is not None:
        on_time_delivery_rate = max(0.0, min(1.0, on_time_delivery_rate))
    if complaint_rate is not None:
        complaint_rate = max(0.0, min(1.0, complaint_rate))

    # Step 1: Rule-based scoring
    scores = compute_scores(
        business_age_years=business_age_years,
        certification_status=cert_status,
        annual_revenue_usd=annual_revenue_usd,
        on_time_delivery_rate=on_time_delivery_rate,
        complaint_rate=complaint_rate,
    )

    # Step 2: AI recommendation (with fallback)
    recommendation, used_ai = await generate_ai_recommendation(
        vendor_id=vendor_id,
        financial_score=scores["financial_risk_score"],
        delivery_score=scores["delivery_risk_score"],
        overall_score=scores["overall_risk_score"],
        fraud_flags=scores["fraud_indicators"],
        certification_status=cert_status,
        business_age_years=business_age_years,
    )

    # Step 3: Persist
    report = RiskReport(
        vendor_id=vendor_uuid,
        financial_risk_score=scores["financial_risk_score"],
        delivery_risk_score=scores["delivery_risk_score"],
        overall_risk_score=scores["overall_risk_score"],
        fraud_indicators=scores["fraud_indicators"],
        certification_status=cert_status,
        business_age_years=business_age_years,
        ai_recommendation=recommendation,
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)

    result = _report_to_dict(report)
    result["ai_used"] = used_ai  # expose to callers so tests can verify
    return result

# ---------------------------------------------------------------------------
# 4. GET /api/risk/{vendorId} — most-recent report
# ---------------------------------------------------------------------------

async def get_latest_report(db: AsyncSession, vendor_id: str) -> Optional[dict]:
    """
    Return the most recent RiskReport for a vendor, or None if none exist.
    """
    try:
        vendor_uuid = uuid.UUID(vendor_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{vendor_id}' is not a valid UUID.",
        )

    stmt = (
        select(RiskReport)
        .where(RiskReport.vendor_id == vendor_uuid)
        .order_by(RiskReport.created_at.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    return _report_to_dict(report) if report else None

# ---------------------------------------------------------------------------
# 5. GET /api/risk/history — paginated history
# ---------------------------------------------------------------------------

async def get_report_history(
    db: AsyncSession,
    vendor_id: str,
    limit: int = 20,
    offset: int = 0,
) -> dict:
    """
    Return paginated risk report history for a vendor, newest first.
    """
    try:
        vendor_uuid = uuid.UUID(vendor_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{vendor_id}' is not a valid UUID.",
        )

    stmt = (
        select(RiskReport)
        .where(RiskReport.vendor_id == vendor_uuid)
        .order_by(RiskReport.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    reports = result.scalars().all()

    return {
        "vendor_id": vendor_id,
        "reports":   [_report_to_dict(r) for r in reports],
        "count":     len(reports),
        "limit":     limit,
        "offset":    offset,
    }
