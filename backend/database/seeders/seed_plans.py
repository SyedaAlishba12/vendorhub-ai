import asyncio
from database.connection import AsyncSessionLocal
from models.PricingPlan import PricingPlan

async def seed():
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        from sqlalchemy import select
        existing = await db.execute(select(PricingPlan).limit(1))
        if existing.scalar_one_or_none():
            print("Plans already seeded, skipping.")
            return

        plans = [
            PricingPlan(name="Free", slug="free", description="Basic access", price=0, max_rfqs=5, max_saved_vendors=10, ai_recommendations=False, priority_support=False, advanced_analytics=False, api_access=False, order=1),
            PricingPlan(name="Pro", slug="pro", description="For growing businesses", price=29, max_rfqs=100, max_saved_vendors=50, ai_recommendations=True, priority_support=True, advanced_analytics=False, api_access=False, order=2),
            PricingPlan(name="Business", slug="business", description="For serious teams", price=99, max_rfqs=1000, max_saved_vendors=200, ai_recommendations=True, priority_support=True, advanced_analytics=True, api_access=True, order=3),
            PricingPlan(name="Enterprise", slug="enterprise", description="Custom solutions", price=999, max_rfqs=-1, max_saved_vendors=-1, ai_recommendations=True, priority_support=True, advanced_analytics=True, api_access=True, order=4),
        ]
        db.add_all(plans)
        await db.commit()
        print("✅ Pricing plans seeded.")

asyncio.run(seed())