from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from database.connection import get_db
from controllers.rfqController import RFQController
from schemas.rfqSchemas import RFQCreate, RFQUpdate
from common.middleware.authMiddleware import get_current_user


router = APIRouter(
    prefix="/api/rfq",
    tags=["RFQ"]
)


# =========================
# Request Schemas
# =========================

class SendRFQRequest(BaseModel):
    vendor_id: int


# =========================
# AI RFQ Generation
# =========================

@router.post("/generate-ai")
async def generate_ai_rfq(
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    description = body.get("description", "")

    return await RFQController.generate_ai_rfq(
        db,
        current_user.id,
        description
    )


# =========================
# Create RFQ
# =========================

@router.post("/")
async def create_rfq(
    rfq_data: RFQCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await RFQController.create_rfq(
        db,
        current_user.id,
        rfq_data
    )


# =========================
# Get All RFQs
# =========================

@router.get("/")
async def get_rfqs(
    status: str = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await RFQController.get_rfqs(
        db,
        current_user.id,
        status
    )


# =========================
# Upload RFQ Attachment
# =========================

@router.post("/{rfq_id}/attachments")
async def upload_attachment(
    rfq_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await RFQController.upload_attachment(
        db,
        current_user.id,
        rfq_id,
        file
    )

@router.get("/vendor/my-rfqs")
async def get_vendor_rfqs(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await RFQController.get_vendor_rfqs(
        db,
        current_user.id
    )

# =========================
# Get Single RFQ
# =========================

@router.get("/{rfq_id}")
async def get_rfq(
    rfq_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await RFQController.get_rfq(
        db,
        current_user.id,
        rfq_id
    )


# =========================
# Update RFQ
# =========================

@router.put("/{rfq_id}")
async def update_rfq(
    rfq_id: int,
    rfq_data: RFQUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await RFQController.update_rfq(
        db,
        current_user.id,
        rfq_id,
        rfq_data
    )


# =========================
# Delete RFQ
# =========================

@router.delete("/{rfq_id}")
async def delete_rfq(
    rfq_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await RFQController.delete_rfq(
        db,
        current_user.id,
        rfq_id
    )


# =========================
# Send RFQ to Vendor
# =========================

@router.post("/{rfq_id}/send")
async def send_rfq(
    rfq_id: int,
    request: SendRFQRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await RFQController.send_rfq(
        db,
        current_user.id,
        rfq_id,
        request.vendor_id
    )


# =========================
# Export RFQ PDF
# =========================

@router.post("/{rfq_id}/export-pdf")
async def export_rfq_pdf(
    rfq_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await RFQController.export_rfq_pdf(
        db,
        current_user.id,
        rfq_id
    )

