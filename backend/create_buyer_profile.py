import asyncio

from sqlalchemy import select

from database.connection import AsyncSessionLocal
from models.user import User
from models.Buyer import Buyer


async def create_buyer_profile():

    async with AsyncSessionLocal() as db:

        # Get user ID 7
        result = await db.execute(
            select(User).where(User.id == 7)
        )

        user = result.scalar_one_or_none()

        if not user:
            print("❌ User with ID 7 does not exist.")
            return

        # Check if buyer profile already exists
        result = await db.execute(
            select(Buyer).where(
                Buyer.user_id == user.id
            )
        )

        buyer = result.scalar_one_or_none()

        if buyer:
            print(
                f"✅ Buyer profile already exists. "
                f"Buyer ID: {buyer.id}"
            )
            return

        # Create buyer profile
        buyer = Buyer(
            user_id=user.id,
            company_name="My Company",
            company_size="Small",
            industry="General",
            country="Pakistan",
            total_spending=0.0
        )

        db.add(buyer)

        await db.commit()
        await db.refresh(buyer)

        print(
            f"✅ Buyer profile created successfully!"
        )
        print(
            f"User ID: {user.id}"
        )
        print(
            f"Buyer ID: {buyer.id}"
        )


if __name__ == "__main__":
    asyncio.run(create_buyer_profile())