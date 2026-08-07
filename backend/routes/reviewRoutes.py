from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any

# Correct import matching database/connection.py structure
from database.connection import get_db
from controllers.reviewController import ReviewController

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.get("")
async def get_reviews(
    vendor_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await ReviewController.get_reviews(db, vendor_id, search)

@router.post("")
async def create_review(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    return await ReviewController.create_review(db, payload)

@router.put("/{review_id}")
async def update_review(
    review_id: str,
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    return await ReviewController.update_review(db, review_id, payload)

@router.post("/{review_id}/helpful")
async def toggle_helpful(
    review_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await ReviewController.toggle_helpful(db, review_id)

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await ReviewController.delete_review(db, review_id)

@router.get("/statistics")
async def get_statistics(
    vendor_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await ReviewController.get_statistics(db, vendor_id)

@router.post("/{review_id}/report")
async def report_review(
    review_id: str,
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    reported_by = payload.get("reported_by", "BUY-001")
    reason = payload.get("reason", "No reason provided")
    return await ReviewController.report_review(db, review_id, reported_by, reason)