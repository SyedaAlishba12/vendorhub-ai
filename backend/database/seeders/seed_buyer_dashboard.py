from datetime import datetime

import asyncio
import bcrypt

from sqlalchemy import select

from database.connection import AsyncSessionLocal

from models.user import User
from models.Buyer import Buyer, Dashboard
from models.RFQ import RFQ, RFQStatus


async def seed_buyer_dashboard():
    """Seed a test buyer with dashboard and sample RFQs."""

    async with AsyncSessionLocal() as db:

        result = await db.execute(
            select(User).where(
                User.email == "buyer@demo.com"
            )
        )

        existing = result.scalar_one_or_none()

        if existing:
            print("⚠️ Buyer already exists, skipping...")
            return

        # -------------------------
        # Create User
        # -------------------------

        password = bcrypt.hashpw(
            b"password123",
            bcrypt.gensalt()
        ).decode("utf-8")

        user = User(
            name="Demo Buyer",
            email="buyer@demo.com",
            hashed_password=password,
            role="buyer",
            is_active=True
        )

        db.add(user)

        await db.flush()

        # -------------------------
        # Create Buyer
        # -------------------------

        buyer = Buyer(
            user_id=user.id,
            company_name="Demo Company",
            industry="Electronics",
            country="Pakistan"
        )

        db.add(buyer)

        await db.flush()

        # -------------------------
        # Create Dashboard
        # -------------------------

        dashboard = Dashboard(
            buyer_id=buyer.id
        )

        db.add(dashboard)

        # -------------------------
        # Create Sample RFQs
        # -------------------------

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


if __name__ == "__main__":
    asyncio.run(seed_buyer_dashboard())