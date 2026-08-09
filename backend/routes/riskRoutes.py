"""
routes/riskRoutes.py — FastAPI APIRouter for the AI Risk Analysis module.

Response envelope (same as messageRoutes):
    { "success": true,  "data": <payload> }    on success
    { "success": false, "message": "<text>" }  on error (via HTTPException)

Endpoints:
    POST   /api/risk/analyze              → run risk assessment, persist, return report
    GET    /api/risk/history              → paginated report history (?vendorId=, ?limit=, ?offset=)
    GET    /api/risk/{vendor_id}          → most-recent report for a vendor

IMPORTANT: /history must be declared BEFORE /{vendor_id} in the router so that
FastAPI does not try to match the literal string "history" as a vendor UUID.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from common.deps import get_current_user_id
from controllers.riskController import (
    analyze_vendor,
    get_latest_report,
    get_report_history,
)
from database.session import get_db

router = APIRouter(prefix="/api/risk", tags=["Risk Analysis"])


# ---------------------------------------------------------------------------
# Response envelope helpers
# ---------------------------------------------------------------------------

def _ok(data: object, status_code: int = 200) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"success": True, "data": data})


# ---------------------------------------------------------------------------
# Pydantic request schema
# ---------------------------------------------------------------------------

class AnalyzeVendorRequest(BaseModel):
    """Request body for POST /api/risk/analyze."""

    vendorId: str = Field(
        ...,
        description="UUID of the vendor to assess.",
        examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
    )
    # Vendor data — accepted directly in v1.
    # Slot a real vendor DB lookup here when the Vendor module is built.
    certificationStatus: str = Field(
        default="unverified",
        description="One of: verified, pending, expired, unverified.",
    )
    businessAgeYears: Optional[int] = Field(
        default=None,
        ge=0,
        description="How many years the vendor has been operating.",
    )
    annualRevenueUsd: Optional[float] = Field(
        default=None,
        ge=0,
        description="Annual revenue in USD (used for financial risk scoring).",
    )
    onTimeDeliveryRate: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Historical on-time delivery rate (0.0 – 1.0).",
    )
    complaintRate: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Historical complaint rate (0.0 – 1.0, lower = better).",
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post(
    "/analyze",
    summary="Analyze vendor risk",
    response_description="AI-generated risk report with scores and recommendation.",
    status_code=status.HTTP_201_CREATED,
)
async def route_analyze_vendor(
    body: AnalyzeVendorRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **POST /api/risk/analyze**

    Runs the risk scoring engine for a vendor and generates an AI recommendation
    via the Gemini API (with a rule-based fallback if the AI is unavailable).

    Creates a new history entry each time — does not overwrite existing reports.

    **Score convention**: HIGHER = SAFER (100 = safest, 0 = highest risk).

    **Response includes** `ai_used: bool` so callers can tell whether the
    recommendation came from Gemini or the rule-based fallback.
    """
    data = await analyze_vendor(
        db=db,
        vendor_id=body.vendorId,
        certification_status=body.certificationStatus,
        business_age_years=body.businessAgeYears,
        annual_revenue_usd=body.annualRevenueUsd,
        on_time_delivery_rate=body.onTimeDeliveryRate,
        complaint_rate=body.complaintRate,
    )
    return _ok(data, status_code=status.HTTP_201_CREATED)


@router.get(
    "/history",
    summary="Get risk report history for a vendor",
    response_description="Paginated list of past risk reports, newest first.",
    status_code=200,
)
async def route_get_history(
    vendorId: str = Query(..., description="UUID of the vendor."),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    _current_user: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **GET /api/risk/history?vendorId=&limit=&offset=**

    Returns all past risk reports for a vendor, sorted newest first.
    Use `offset` + `limit` for pagination.
    """
    data = await get_report_history(db, vendorId, limit, offset)
    return _ok(data)


@router.get(
    "/{vendor_id}",
    summary="Get most recent risk report for a vendor",
    response_description="The latest risk report, or 404 if none exist.",
    status_code=200,
)
async def route_get_latest(
    vendor_id: str,
    db: AsyncSession = Depends(get_db),
    _current_user: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **GET /api/risk/{vendorId}**

    Returns the most recent risk report for the given vendor.
    Returns HTTP 404 if no reports exist yet — call POST /api/risk/analyze first.
    """
    report = await get_latest_report(db, vendor_id)
    if not report:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": f"No risk reports found for vendor '{vendor_id}'. "
                           "Call POST /api/risk/analyze to generate one.",
            },
        )
    return _ok(report)
