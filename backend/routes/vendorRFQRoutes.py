from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from controllers.vendorDashboardController import (
    VendorDashboardController
)
from common.middleware.authMiddleware import get_current_user


router = APIRouter(
    prefix="/api/vendor/dashboard",
    tags=["Vendor Dashboard"]
)


@router.get("/rfqs")
async def get_vendor_rfqs(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return await VendorDashboardController.get_vendor_rfqs(
            db,
            current_user.id
        )

    except HTTPException:
        raise

    except Exception as e:
        print(f"Vendor dashboard RFQ route error: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to fetch vendor RFQs"
        )