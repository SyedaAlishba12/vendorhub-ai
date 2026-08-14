from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from services.vendorDashboardService import VendorDashboardService


class VendorDashboardController:

    # =========================================================
    # GET VENDOR RFQS
    # =========================================================

    @staticmethod
    async def get_vendor_rfqs(
        db: AsyncSession,
        user_id: int
    ):
        try:
            return await VendorDashboardService.get_vendor_rfqs(
                db,
                user_id
            )

        except HTTPException:
            raise

        except Exception as e:
            print(f"Vendor RFQ dashboard error: {e}")

            raise HTTPException(
                status_code=500,
                detail="Failed to fetch vendor RFQs"
            )


    # =========================================================
    # GET VENDOR ANALYTICS
    # =========================================================

    @staticmethod
    async def get_vendor_analytics(
        db: AsyncSession,
        user_id: int
    ):
        try:
            return await VendorDashboardService.get_vendor_analytics(
                db,
                user_id
            )

        except HTTPException:
            raise

        except Exception as e:
            print(f"Vendor analytics error: {e}")

            raise HTTPException(
                status_code=500,
                detail="Failed to fetch vendor analytics"
            )