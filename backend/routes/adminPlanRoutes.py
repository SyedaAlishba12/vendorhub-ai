from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database.connection import get_db
from controllers.pricingController import PricingController
from schemas.pricingSchemas import PricingPlanCreate, PricingPlanUpdate
from models.User import User
from models.Vendor import Vendor
from models.Order import Order
from models.Subscription import Subscription
from models.BillingHistory import BillingHistory
from models.PricingPlan import PricingPlan
from common.middleware.authMiddleware import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/overview")
async def get_admin_overview(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar()
    total_vendors = (await db.execute(select(func.count()).select_from(Vendor))).scalar()
    total_orders = (await db.execute(select(func.count()).select_from(Order))).scalar()
    total_revenue = (await db.execute(select(func.coalesce(func.sum(Order.total_amount), 0.0)))).scalar()
    return {
        "total_users": total_users,
        "total_vendors": total_vendors,
        "total_orders": total_orders,
        "total_revenue": total_revenue
    }

@router.get("/plans")
async def get_admin_plans(db: AsyncSession = Depends(get_db), user_id: int = Depends(get_current_user)):
    return await PricingController.get_plans(db)

@router.post("/plans")
async def create_plan(data: PricingPlanCreate, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_current_user)):
    return await PricingController.create_plan(db, data)

@router.put("/plans/{plan_id}")
async def update_plan(plan_id: int, data: PricingPlanUpdate, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_current_user)):
    return await PricingController.update_plan(db, plan_id, data)

@router.delete("/plans/{plan_id}")
async def delete_plan(plan_id: int, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_current_user)):
    return await PricingController.delete_plan(db, plan_id)

@router.get("/subscribers")
async def get_subscribers(db: AsyncSession = Depends(get_db), user_id: int = Depends(get_current_user)):
    result = await db.execute(select(Subscription).order_by(Subscription.created_at.desc()))
    subs = result.scalars().all()
    return [{
        "id": s.id,
        "user_email": s.user.email if s.user else None,
        "plan_name": s.plan.name if s.plan else None,
        "status": s.status,
        "start_date": s.start_date,
        "renewal_date": s.renewal_date,
    } for s in subs]

@router.get("/revenue/subscriptions")
async def get_subscription_revenue(db: AsyncSession = Depends(get_db), user_id: int = Depends(get_current_user)):
    total = (await db.execute(
        select(func.coalesce(func.sum(BillingHistory.amount), 0.0))
        .where(BillingHistory.status == "success")
    )).scalar()
    return {"total_revenue_from_subscriptions": total}