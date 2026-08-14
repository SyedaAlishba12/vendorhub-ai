import asyncio

from database.connection import AsyncSessionLocal
from controllers.auth_controller import signup_user
from schemas.auth import UserSignup


async def test():
    async with AsyncSessionLocal() as db:

        data = UserSignup(
            name="Email Verification Test",
            email="verification_test@example.com",
            password="TestPassword123!",
            role="buyer",
        )

        try:
            user = await signup_user(
                db,
                data,
            )

            print("✅ User created")
            print("ID:", user.id)
            print("Email:", user.email)
            print(
                "Email verified:",
                user.email_verified
            )
            print(
                "Verification token:",
                user.verification_token
            )
            print(
                "Token expiry:",
                user.verification_token_expires_at
            )

        except ValueError as e:
            print("⚠️", e)


if __name__ == "__main__":
    asyncio.run(test())