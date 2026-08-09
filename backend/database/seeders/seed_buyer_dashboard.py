
from database.connection import AsyncSessionLocal
from models.Buyer import Buyer, Dashboard
from models.User import User, UserRole
from models.RFQ import RFQ, RFQStatus

from sqlalchemy import select
from datetime import datetime
import bcrypt


async def seed_buyer_dashboard():
    """Seed a test buyer with dashboard and sample RFQs"""

    async with AsyncSessionLocal() as db:

        # Check if buyer already exists to avoid duplicates
        result = await db.execute(
            select(User).where(User.email == "buyer@demo.com")
        )

        existing = result.scalar_one_or_none()

        if existing:
            print("⚠️ Buyer already exists, skipping...")
            return

        # Create user
        user = User(
            email="buyer@demo.com",
            username="demobuyer",
           password_hash=bcrypt.hashpw(
    b"password123",
    bcrypt.gensalt()
).decode("utf-8"),
            full_name="Demo Buyer",
            role=UserRole.BUYER,
            is_verified=True,
            is_active=True
        )

        db.add(user)
        await db.flush()

        # Create buyer profile
        buyer = Buyer(
            user_id=user.id,
            company_name="Demo Company",
            industry="Electronics",
            country="Pakistan"
        )

        db.add(buyer)
        await db.flush()

        # Create dashboard
        dashboard = Dashboard(
            buyer_id=buyer.id
        )

        db.add(dashboard)

        # Create sample RFQs
        for i in range(3):
            rfq = RFQ(
                buyer_id=buyer.id,
                rfq_ref=f"RFQ-{1000 + i}",
                product_name=f"Test Product {i + 1}",
                category="Electronics",
                quantity=100,
                unit="pcs",
                delivery_date=datetime.utcnow(),
                payment_terms="Net 30",
                shipping_method="Sea Freight",
                status=(
                    RFQStatus.QUOTED
                    if i < 2
                    else RFQStatus.DRAFT
                )
            )

            db.add(rfq)

        await db.commit()

        print("✅ Buyer dashboard & RFQs seeded!")

