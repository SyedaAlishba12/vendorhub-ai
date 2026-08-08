from fastapi import APIRouter, Response, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from database.connection import get_db
from models.Order import Order
from services.pdfService import PDFService

router = APIRouter(prefix="/api/pdf", tags=["Shared PDF Service"])

class PDFGenerateRequest(BaseModel):
    title: str
    content: List[str]

#####################################
#####################################

# General endpoint for Syeda, Fatima, and Taha
@router.post("/generate")
def generate_custom_pdf(payload: PDFGenerateRequest):
    try:
        pdf_bytes = PDFService.generate_pdf(payload.title, payload.content)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={payload.title.lower().replace(' ', '_')}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Dedicated Invoice Endpoint for Zainab (Module 12)
@router.get("/invoice/{order_id}")
async def get_order_invoice_pdf(order_id: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(Order)
            .filter(Order.id == order_id)
            .options(selectinload(Order.items))
        )
        order = result.scalars().first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Format DB data for PDF Service
        formatted_items = []
        if order.items:
            for item in order.items:
                formatted_items.append({
                    "description": item.product_name,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "total": item.quantity * item.unit_price
                })
        else:
            formatted_items.append({
                "description": "Standard Order Item",
                "quantity": 1,
                "unit_price": order.total_amount,
                "total": order.total_amount
            })

        invoice_payload = {
            "invoice_number": f"INV-{order.id}",
            "order_id": order.id,
            "date": str(order.created_at)[:10] if order.created_at else "N/A",
            "items": formatted_items,
            "total_amount": order.total_amount
        }

        pdf_bytes = PDFService.generate_invoice_pdf(invoice_payload)

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Invoice_{order.id}.pdf"}
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))