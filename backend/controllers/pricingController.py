from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from services.pricingService import PricingService
from schemas.pricingSchemas import PricingPlanCreate, PricingPlanUpdate

class PricingController:

    @staticmethod
    async def get_plans(db: AsyncSession):
        plans = await PricingService.get_plans(db)
        return [{
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "description": p.description,
            "price": p.price,
            "annual_price": p.annual_price,
            "max_rfqs": p.max_rfqs,
            "max_saved_vendors": p.max_saved_vendors,
            "ai_recommendations": p.ai_recommendations,
            "priority_support": p.priority_support,
            "advanced_analytics": p.advanced_analytics,
            "api_access": p.api_access,
            "is_active": p.is_active,
            "order": p.order,
        } for p in plans]

    @staticmethod
    async def create_plan(db: AsyncSession, data: PricingPlanCreate):
        return await PricingService.create_plan(db, data)

    @staticmethod
    async def update_plan(db: AsyncSession, plan_id: int, data: PricingPlanUpdate):
        return await PricingService.update_plan(db, plan_id, data)

    @staticmethod
    async def delete_plan(db: AsyncSession, plan_id: int):
        return await PricingService.delete_plan(db, plan_id)

    @staticmethod
    async def get_subscription(db: AsyncSession, user_id: int):
        sub = await PricingService.get_subscription(db, user_id)
        return {
            "id": sub.id,
            "user_id": sub.user_id,
            "plan_id": sub.plan_id,
            "status": sub.status,
            "start_date": sub.start_date,
            "end_date": sub.end_date,
            "renewal_date": sub.renewal_date,
            "is_trial": sub.is_trial,
            "trial_ends_at": sub.trial_ends_at,
            "plan": {
                "id": sub.plan.id,
                "name": sub.plan.name,
                "slug": sub.plan.slug,
                "price": sub.plan.price,
                "max_rfqs": sub.plan.max_rfqs,
                "max_saved_vendors": sub.plan.max_saved_vendors,
            } if sub.plan else None,
        }

    @staticmethod
    async def create_subscription(db: AsyncSession, user_id: int, plan_id: int):
        sub = await PricingService.create_or_update_subscription(db, user_id, plan_id)
        return {"message": "Subscription updated", "subscription_id": sub.id, "status": sub.status}

    @staticmethod
    async def cancel_subscription(db: AsyncSession, user_id: int):
        sub = await PricingService.cancel_subscription(db, user_id)
        return {"message": "Subscription cancelled", "subscription_id": sub.id}

    @staticmethod
    async def get_billing_history(db: AsyncSession, user_id: int):
        history = await PricingService.get_billing_history(db, user_id)
        return [{
            "id": item.id,
            "subscription_id": item.subscription_id,
            "amount": item.amount,
            "currency": item.currency,
            "status": item.status,
            "payment_method": item.payment_method,
            "billing_date": item.billing_date,
            "description": item.description,
        } for item in history]