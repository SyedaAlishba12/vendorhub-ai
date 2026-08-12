import asyncio

from sqlalchemy import select

from database.connection import AsyncSessionLocal
from models.PricingPlan import PricingPlan

PLANS = [
    {
        "name": "Free",
        "slug": "free",
        "description": "Basic access for getting started.",
        "price": 0,
        "annual_price": 0,
        "max_rfqs": 5,
        "max_saved_vendors": 10,
        "ai_recommendations": False,
        "priority_support": False,
        "advanced_analytics": False,
        "api_access": False,
        "is_active": True,
        "order": 1,
    },
    {
        "name": "Pro",
        "slug": "pro",
        "description": "For growing businesses with advanced needs.",
        "price": 29,
        "annual_price": 290,
        "max_rfqs": 50,
        "max_saved_vendors": 100,
        "ai_recommendations": True,
        "priority_support": False,
        "advanced_analytics": True,
        "api_access": False,
        "is_active": True,
        "order": 2,
    },
    {
        "name": "Business",
        "slug": "business",
        "description": "Advanced features for established businesses.",
        "price": 79,
        "annual_price": 790,
        "max_rfqs": 200,
        "max_saved_vendors": 500,
        "ai_recommendations": True,
        "priority_support": True,
        "advanced_analytics": True,
        "api_access": True,
        "is_active": True,
        "order": 3,
    },
    {
        "name": "Enterprise",
        "slug": "enterprise",
        "description": "Unlimited capabilities for large organizations.",
        "price": 199,
        "annual_price": 1990,
        "max_rfqs": -1,
        "max_saved_vendors": -1,
        "ai_recommendations": True,
        "priority_support": True,
        "advanced_analytics": True,
        "api_access": True,
        "is_active": True,
        "order": 4,
    },
]


async def main():
    async with AsyncSessionLocal() as db:

        for plan_data in PLANS:
            result = await db.execute(
                select(PricingPlan).where(
                    PricingPlan.slug == plan_data["slug"]
                )
            )

            existing_plan = result.scalar_one_or_none()

            if existing_plan:
                print(f"Already exists: {plan_data['name']}")
                continue

            plan = PricingPlan(**plan_data)

            db.add(plan)

            print(f"Adding: {plan_data['name']}")

        await db.commit()

    print("\nPricing plans setup complete.")


if __name__ == "__main__":
    asyncio.run(main())