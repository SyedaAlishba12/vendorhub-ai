from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.RFQ import RFQ
from models.RFQVendor import RFQVendor
from models.vendors import Vendor


class VendorDashboardService:

    # =========================================================
    # GET VENDOR BY USER ID
    # =========================================================

    @staticmethod
    async def get_vendor_by_user_id(
        db: AsyncSession,
        user_id: int
    ):
        result = await db.execute(
            select(Vendor).where(
                Vendor.user_id == user_id
            )
        )

        vendor = result.scalar_one_or_none()

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor not found"
            )

        return vendor

    # =========================================================
    # GET VENDOR RFQS
    # =========================================================

    @staticmethod
    async def get_vendor_rfqs(
        db: AsyncSession,
        user_id: int
    ):
        # Find vendor profile
        vendor = await VendorDashboardService.get_vendor_by_user_id(
            db,
            user_id
        )

        # Get RFQs assigned to this vendor
        result = await db.execute(
            select(RFQ, RFQVendor)
            .join(
                RFQVendor,
                RFQVendor.rfq_id == RFQ.id
            )
            .where(
                RFQVendor.vendor_id == vendor.id
            )
            .order_by(
                RFQ.created_at.desc()
            )
        )

        rows = result.all()

        rfqs = []

        for rfq, assignment in rows:
            rfqs.append({
                "id": rfq.id,
                "rfq_ref": rfq.rfq_ref,
                "product_name": rfq.product_name,
                "category": rfq.category,
                "quantity": rfq.quantity,
                "unit": rfq.unit,
                "material": rfq.material,
                "budget": rfq.budget,
                "delivery_date": rfq.delivery_date,
                "payment_terms": rfq.payment_terms,
                "shipping_method": rfq.shipping_method,
                "description": rfq.description,
                "status": rfq.status.value
                    if hasattr(rfq.status, "value")
                    else str(rfq.status),
                "created_at": rfq.created_at,

                # Vendor-specific assignment information
                "vendor_status": assignment.status,
                "sent_at": assignment.sent_at,
                "responded_at": assignment.responded_at,
            })

        return rfqs