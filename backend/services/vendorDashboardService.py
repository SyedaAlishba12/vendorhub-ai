from datetime import datetime
from dateutil.relativedelta import relativedelta

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.RFQ import RFQ
from models.RFQVendor import RFQVendor
from models.vendors import Vendor
from models.Order import Order
from models.Review import ReviewDB
from models.Rating import RatingDB


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
                "status": (
                    rfq.status.value
                    if hasattr(rfq.status, "value")
                    else str(rfq.status)
                ),
                "created_at": rfq.created_at,

                # Vendor-specific assignment information
                "vendor_status": assignment.status,
                "sent_at": assignment.sent_at,
                "responded_at": assignment.responded_at,
            })

        return rfqs

       # =========================================================
    # GET VENDOR ANALYTICS
    # =========================================================

    @staticmethod
    async def get_vendor_analytics(
        db: AsyncSession,
        user_id: int
    ):

        # -----------------------------------------------------
        # Find logged-in vendor
        # -----------------------------------------------------

        vendor = await VendorDashboardService.get_vendor_by_user_id(
            db,
            user_id
        )

        vendor_id = vendor.id

        # -----------------------------------------------------
        # RFQ ANALYTICS
        # -----------------------------------------------------

        result = await db.execute(
            select(func.count())
            .select_from(RFQVendor)
            .where(
                RFQVendor.vendor_id == vendor_id
            )
        )

        total_rfqs = result.scalar() or 0


        # -----------------------------------------------------
        # Responded RFQs
        # -----------------------------------------------------

        result = await db.execute(
            select(func.count())
            .select_from(RFQVendor)
            .where(
                RFQVendor.vendor_id == vendor_id,
                RFQVendor.responded_at.is_not(None)
            )
        )

        responded_rfqs = result.scalar() or 0


        # -----------------------------------------------------
        # Response Rate
        # -----------------------------------------------------

        if total_rfqs > 0:
            response_rate = (
                responded_rfqs / total_rfqs
            ) * 100
        else:
            response_rate = 0


        # -----------------------------------------------------
        # RFQ STATUS COUNTS
        # -----------------------------------------------------

        result = await db.execute(
            select(
                RFQVendor.status,
                func.count(RFQVendor.id)
            )
            .where(
                RFQVendor.vendor_id == vendor_id
            )
            .group_by(
                RFQVendor.status
            )
        )

        status_rows = result.all()

        rfq_status = {}

        for status, count in status_rows:
            rfq_status[str(status).upper()] = count


        # -----------------------------------------------------
        # ORDER ANALYTICS
        # -----------------------------------------------------

        # Order.vendor_id is String
        vendor_id_str = str(vendor_id)

        result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(
                Order.vendor_id == vendor_id_str
            )
        )

        total_orders = result.scalar() or 0


        # -----------------------------------------------------
        # TOTAL REVENUE
        # -----------------------------------------------------

        result = await db.execute(
            select(
                func.coalesce(
                    func.sum(Order.total_amount),
                    0.0
                )
            )
            .where(
                Order.vendor_id == vendor_id_str
            )
        )

        total_revenue = result.scalar() or 0.0


        # -----------------------------------------------------
        # AVERAGE ORDER VALUE
        # -----------------------------------------------------

        if total_orders > 0:
            average_order_value = (
                float(total_revenue) / total_orders
            )
        else:
            average_order_value = 0.0


        # -----------------------------------------------------
        # REVIEW ANALYTICS
        # -----------------------------------------------------

        # Review.vendor_id is String
        result = await db.execute(
            select(func.count())
            .select_from(ReviewDB)
            .where(
                ReviewDB.vendor_id == vendor_id_str
            )
        )

        total_reviews = result.scalar() or 0


        # -----------------------------------------------------
        # AVERAGE RATING
        # -----------------------------------------------------

        result = await db.execute(
            select(
                func.coalesce(
                    func.avg(RatingDB.overall_rating),
                    0.0
                )
            )
            .join(
                ReviewDB,
                ReviewDB.id == RatingDB.review_id
            )
            .where(
                ReviewDB.vendor_id == vendor_id_str
            )
        )

        average_rating = result.scalar() or 0.0


        # -----------------------------------------------------
        # RATING BREAKDOWN
        # -----------------------------------------------------

        rating_fields = {
            "overall": RatingDB.overall_rating,
            "product": RatingDB.product_rating,
            "communication": RatingDB.communication_rating,
            "delivery": RatingDB.delivery_rating,
            "quality": RatingDB.quality_rating,
            "service": RatingDB.service_rating,
        }

        rating_breakdown = {}

        for name, field in rating_fields.items():

            result = await db.execute(
                select(
                    func.coalesce(
                        func.avg(field),
                        0.0
                    )
                )
                .join(
                    ReviewDB,
                    ReviewDB.id == RatingDB.review_id
                )
                .where(
                    ReviewDB.vendor_id == vendor_id_str
                )
            )

            rating_breakdown[name] = round(
                float(result.scalar() or 0),
                2
            )


        # -----------------------------------------------------
        # FINAL RESPONSE
        # -----------------------------------------------------

        return {
            "vendor": {
                "id": vendor.id,
                "company_name": vendor.company_name,
            },

            "rfqs": {
                "total": total_rfqs,
                "responded": responded_rfqs,
                "response_rate": round(
                    response_rate,
                    2
                ),
                "status": rfq_status,
            },

            "orders": {
                "total": total_orders,
                "revenue": round(
                    float(total_revenue),
                    2
                ),
                "average_order_value": round(
                    average_order_value,
                    2
                ),
            },

            "reviews": {
                "total": total_reviews,
                "average_rating": round(
                    float(average_rating),
                    2
                ),
                "rating_breakdown": rating_breakdown,
            }
        }