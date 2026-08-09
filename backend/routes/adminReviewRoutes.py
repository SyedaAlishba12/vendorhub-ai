from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from controllers.adminReviewController import AdminReviewController

router = APIRouter(prefix="/api/admin", tags=["Admin Moderation & Reports"])

@router.get("/reviews/reported")
async def get_reported_reviews(db: AsyncSession = Depends(get_db)):
    return await AdminReviewController.get_reported_reviews(db)

@router.put("/reviews/{review_id}/moderate")
async def moderate_review(review_id: str, action: str, admin_notes: str = "", db: AsyncSession = Depends(get_db)):
    return await AdminReviewController.moderate_review(db, review_id, action, admin_notes)

@router.get("/reviews/moderation-history")
async def get_moderation_history(db: AsyncSession = Depends(get_db)):
    return await AdminReviewController.get_moderation_history(db)

@router.get("/reports/orders")
async def get_order_reports(db: AsyncSession = Depends(get_db)):
    return await AdminReviewController.get_order_reports(db)

@router.get("/reports/export")  # 👈 Added PDF Export Endpoint
async def export_pdf_report(db: AsyncSession = Depends(get_db)):
    return await AdminReviewController.export_pdf_report(db)

@router.get("/disputes")
async def get_disputes(db: AsyncSession = Depends(get_db)):
    return await AdminReviewController.get_disputes(db)