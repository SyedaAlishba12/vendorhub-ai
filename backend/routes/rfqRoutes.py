from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from controllers.rfqController import RFQController
from schemas.rfqSchemas import RFQCreate, RFQUpdate
from common.middleware.authMiddleware import get_current_user

router = APIRouter(prefix="/api/rfq", tags=["RFQ"])


@router.post("/generate-ai")
async def generate_ai_rfq(
    body: dict,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    description = body.get("description", "")
    return await RFQController.generate_ai_rfq(db, user_id, description)


@router.post("/")
async def create_rfq(
    rfq_data: RFQCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    return await RFQController.create_rfq(db, user_id, rfq_data)


@router.get("/")
async def get_rfqs(
    status: str = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    return await RFQController.get_rfqs(db, user_id, status)


# ⚠️ Place this BEFORE the dynamic /{rfq_id} route!
@router.post("/{rfq_id}/attachments")
async def upload_attachment(
    rfq_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    return await RFQController.upload_attachment(db, user_id, rfq_id, file)


@router.get("/{rfq_id}")
async def get_rfq(
    rfq_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    return await RFQController.get_rfq(db, user_id, rfq_id)


@router.put("/{rfq_id}")
async def update_rfq(
    rfq_id: int,
    rfq_data: RFQUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    return await RFQController.update_rfq(db, user_id, rfq_id, rfq_data)


@router.delete("/{rfq_id}")
async def delete_rfq(
    rfq_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    return await RFQController.delete_rfq(db, user_id, rfq_id)


@router.post("/{rfq_id}/send")
async def send_rfq(
    rfq_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    return await RFQController.send_rfq(db, user_id, rfq_id)


@router.post("/{rfq_id}/export-pdf")
async def export_rfq_pdf(
    rfq_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    return await RFQController.export_rfq_pdf(db, user_id, rfq_id)