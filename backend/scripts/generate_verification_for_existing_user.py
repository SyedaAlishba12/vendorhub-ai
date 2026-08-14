import asyncio

from sqlalchemy import select

from database.connection import AsyncSessionLocal
from models.user import User
from services.email_verification import (
    generate_verification_token,
    get_verification_token_expiry,
)


EMAIL = "syedaalishbakhatoon@gmail.com"


async def generate_token():
    async with AsyncSessionLocal() as db:

        result = await db.execute(
            select(User).where(User.email == EMAIL)
        )

        user = result.scalar_one_or_none()

        if not user:
            print("❌ User not found.")
            return

        user.email_verified = False
        user.verification_token = (
            generate_verification_token()
        )
        user.verification_token_expires_at = (
            get_verification_token_expiry()
        )

        await db.commit()
        await db.refresh(user)

        print("✅ Verification token generated.")
        print("Email:", user.email)
        print("Token:", user.verification_token)
        print(
            "Expires:",
            user.verification_token_expires_at,
        )


if __name__ == "__main__":
    asyncio.run(generate_token())