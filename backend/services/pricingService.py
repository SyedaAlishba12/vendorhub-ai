from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from models.PricingPlan import PricingPlan
from models.Subscription import Subscription
from models.BillingHistory import BillingHistory
from schemas.pricingSchemas import PricingPlanCreate, PricingPlanUpdate
from fastapi import HTTPException

class PricingService:

    @staticmethod
    async def get_plans(db: AsyncSession):
        result = await db.execute(
            select(PricingPlan).where(PricingPlan.is_active == True).order_by(PricingPlan.order)
        )
        return result.scalars().all()

    @staticmethod
    async def create_plan(db: AsyncSession, data: PricingPlanCreate):
        plan = PricingPlan(**data.dict())
        db.add(plan)
        await db.commit()
        await db.refresh(plan)
        return plan

    @staticmethod
    async def update_plan(db: AsyncSession, plan_id: int, data: PricingPlanUpdate):
        plan = await db.get(PricingPlan, plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        for key, value in data.dict(exclude_unset=True).items():
            setattr(plan, key, value)
        await db.commit()
        await db.refresh(plan)
        return plan

    @staticmethod
    async def delete_plan(db: AsyncSession, plan_id: int):
        plan = await db.get(PricingPlan, plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        plan.is_active = False
        await db.commit()
        return {"message": "Plan deleted"}

    @staticmethod
    async def get_subscription(db: AsyncSession, user_id: int):
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == user_id).limit(1)
        )
        sub = result.scalar_one_or_none()
        if not sub:
            # Create free plan default
            result = await db.execute(
                select(PricingPlan).where(PricingPlan.slug == "free")
            )
            free = result.scalar_one_or_none()
            if not free:
                raise HTTPException(status_code=404, detail="Free plan not found")
            sub = Subscription(user_id=user_id, plan_id=free.id, status="active")
            db.add(sub)
            await db.commit()
            await db.refresh(sub)
        return sub

    @staticmethod
    async def create_or_update_subscription(db: AsyncSession, user_id: int, plan_id: int):
        sub = await PricingService.get_subscription(db, user_id)
        sub.plan_id = plan_id
        sub.status = "active"
        await db.commit()
        await db.refresh(sub)
        return sub

    @staticmethod
    async def cancel_subscription(db: AsyncSession, user_id: int):
        sub = await PricingService.get_subscription(db, user_id)
        if sub.status == "cancelled":
            raise HTTPException(status_code=400, detail="Already cancelled")
        sub.status = "cancelled"
        await db.commit()
        await db.refresh(sub)
        return sub

    @staticmethod
    async def get_billing_history(db: AsyncSession, user_id: int):
        result = await db.execute(
            select(BillingHistory)
            .join(Subscription)
            .where(Subscription.user_id == user_id)
            .order_by(BillingHistory.billing_date.desc())
        )
        return result.scalars().all()