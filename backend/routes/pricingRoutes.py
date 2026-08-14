from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from controllers.pricingController import PricingController
from common.middleware.authMiddleware import get_current_user


router = APIRouter(prefix="/api", tags=["Pricing"])


@router.get("/plans")
async def get_plans(
    db: AsyncSession = Depends(get_db)
):
    return await PricingController.get_plans(db)


@router.get("/subscription")
async def get_subscription(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await PricingController.get_subscription(
        db,
        current_user.id
    )


@router.post("/subscription")
async def create_subscription(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await PricingController.create_subscription(
        db,
        current_user.id,
        plan_id
    )


@router.put("/subscription")
async def update_subscription(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await PricingController.create_subscription(
        db,
        current_user.id,
        plan_id
    )


@router.delete("/subscription")
async def cancel_subscription(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await PricingController.cancel_subscription(
        db,
        current_user.id
    )


@router.get("/billing/history")
async def get_billing_history(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await PricingController.get_billing_history(
        db,
        current_user.id
    )