import asyncio
import bcrypt
from database.connection import AsyncSessionLocal
from models.Buyer import Buyer, Dashboard
from models.User import User, UserRole
from models.RFQ import RFQ, RFQStatus
from datetime import datetime

async def fix_buyer():
    async with AsyncSessionLocal() as db:
        # 1. Ensure user with id=1 exists
        user = await db.get(User, 1)
        if not user:
            password_hash = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()
            user = User(
                id=1,
                email="buyer@demo.com",
                username="demobuyer",
                password_hash=password_hash,
                full_name="Demo Buyer",
                role=UserRole.BUYER,
                is_verified=True,
                is_active=True
            )
            db.add(user)
            await db.flush()
            print("✅ Created user with id=1")

        # 2. Ensure buyer linked to user_id=1
        from sqlalchemy import select
        result = await db.execute(select(Buyer).where(Buyer.user_id == 1))
        buyer = result.scalar_one_or_none()
        if not buyer:
            buyer = Buyer(
                user_id=1,
                company_name="Demo Company",
                industry="Electronics",
                country="Pakistan"
            )
            db.add(buyer)
            await db.flush()
            print("✅ Created buyer with user_id=1")

        # 3. Ensure dashboard exists
        result = await db.execute(select(Dashboard).where(Dashboard.buyer_id == buyer.id))
        dashboard = result.scalar_one_or_none()
        if not dashboard:
            dashboard = Dashboard(buyer_id=buyer.id)
            db.add(dashboard)
            print("✅ Created dashboard")

        # 4. Ensure some RFQs exist
        result = await db.execute(select(RFQ).where(RFQ.buyer_id == buyer.id))
        if not result.scalars().first():
            for i in range(3):
                rfq = RFQ(
                    buyer_id=buyer.id,
                    rfq_ref=f"RFQ-{1000+i}",
                    product_name=f"Test Product {i+1}",
                    category="Electronics",
                    quantity=100,
                    unit="pcs",
                    delivery_date=datetime.utcnow(),
                    payment_terms="Net 30",
                    shipping_method="Sea Freight",
                    status=RFQStatus.QUOTED if i < 2 else RFQStatus.DRAFT
                )
                db.add(rfq)
            print("✅ Created 3 sample RFQs")

        await db.commit()
        print("🎉 All done! Buyer with user_id=1 is ready.")

asyncio.run(fix_buyer())