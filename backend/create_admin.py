import asyncio

from sqlalchemy import select

from database.connection import AsyncSessionLocal
from models.user import User
from models.vendors import Vendor
from models.RFQVendor import RFQVendor

from services.auth import hash_password


ADMIN_NAME = "Admin"
ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "Admin12345"


async def create_admin():
    async with AsyncSessionLocal() as db:

        # Check if admin already exists
        result = await db.execute(
            select(User).where(
                User.email == ADMIN_EMAIL
            )
        )

        existing_user = result.scalars().first()

        if existing_user:
            print("Admin account already exists.")
            print(f"Email: {existing_user.email}")
            print(f"Role: {existing_user.role}")
            print(f"Email verified: {existing_user.email_verified}")
            print(f"Active: {existing_user.is_active}")
            return

        # Create admin
        admin = User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            hashed_password=hash_password(ADMIN_PASSWORD),
            role="admin",
            email_verified=True,
            verification_token=None,
            verification_token_expires_at=None,
            is_active=True,
        )

        db.add(admin)

        await db.commit()
        await db.refresh(admin)

        print("===================================")
        print("Admin account created successfully!")
        print("===================================")
        print(f"ID: {admin.id}")
        print(f"Name: {admin.name}")
        print(f"Email: {admin.email}")
        print(f"Role: {admin.role}")
        print(f"Email verified: {admin.email_verified}")
        print(f"Active: {admin.is_active}")
        print("===================================")


if __name__ == "__main__":
    asyncio.run(create_admin())