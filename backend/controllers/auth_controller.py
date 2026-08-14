from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from models.user import User
from schemas.auth import UserSignup
from models.Buyer import Buyer
from models.vendors import Vendor

from services.auth import (
    hash_password,
    verify_password,
    create_access_token,
)

from services.email_verification import (
    generate_verification_token,
    get_verification_token_expiry,
)

from services.email_service import (
    send_verification_email,
)
from services.email_verification import (
    generate_verification_token,
    get_verification_token_expiry,
    generate_password_reset_token,
    get_password_reset_token_expiry,
)

from services.email_service import (
    send_verification_email,
    send_password_reset_email,
)


async def get_user_by_email(
    db: AsyncSession,
    email: str,
):
    result = await db.execute(
        select(User).where(User.email == email)
    )

    return result.scalars().first()


async def get_user_by_id(
    db: AsyncSession,
    user_id: int,
):
    result = await db.execute(
        select(User).where(User.id == user_id)
    )

    return result.scalars().first()


async def signup_user(db: AsyncSession, data: UserSignup):
    existing = await get_user_by_email(db, data.email)

    if existing:
        raise ValueError(
            "An account with this email already exists."
        )

    # Generate verification token
    verification_token = generate_verification_token()

    # Create user
    new_user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,

        email_verified=False,
        verification_token=verification_token,
        verification_token_expires_at=get_verification_token_expiry(),
    )

    db.add(new_user)

    # Generate the user ID before creating the profile
    await db.flush()

    # =========================================================
    # CREATE BUYER PROFILE
    # =========================================================

    if data.role.lower() == "buyer":

        buyer = Buyer(
            user_id=new_user.id,
            company_name=f"{new_user.name}'s Company",
            company_size=None,
            industry="General",
            country="Pakistan",
            total_spending=0.0,
        )

        db.add(buyer)

    # =========================================================
    # CREATE VENDOR PROFILE
    # =========================================================

    elif data.role.lower() == "vendor":

        vendor = Vendor(
            user_id=new_user.id,
            company_name=f"{new_user.name}'s Company",
            business_description=None,
            country="Pakistan",
            industry="General",
            certification=None,
            production_capacity=None,
            export_countries=None,
            contact_email=new_user.email,
            contact_phone=None,
            languages=None,
            rating=0.0,
            response_time_hours=None,
            is_verified=False,
            is_hidden=False,
            is_featured=False,
        )

        db.add(vendor)

    # =========================================================
    # COMMIT USER + PROFILE
    # =========================================================

    await db.commit()

    await db.refresh(new_user)

    # Send verification email
    print(
        f"📧 Sending verification email to {new_user.email}..."
    )

    await send_verification_email(
        to_email=new_user.email,
        verification_token=verification_token,
    )

    print("✅ Verification email sent successfully.")

    return new_user

async def resend_verification_email(
    db: AsyncSession,
    email: str,
):
    user = await get_user_by_email(db, email)

    if not user:
        raise ValueError(
            "No account found with this email."
        )

    if user.email_verified:
        raise ValueError(
            "This email is already verified."
        )

    # Generate a fresh token
    verification_token = generate_verification_token()

    user.verification_token = verification_token
    user.verification_token_expires_at = (
        get_verification_token_expiry()
    )

    await db.commit()

    # Send new email
    await send_verification_email(
        to_email=user.email,
        verification_token=verification_token,
    )

    return True

async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str,
):
    user = await get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(
        password,
        user.hashed_password
    ):
        return None

    if not user.is_active:
        return None

    if not user.email_verified:
        raise ValueError(
            "Please verify your email before logging in."
        )

    return user

def build_token_for_user(
    user: User,
) -> str:

    return create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
    )
async def request_password_reset(
    db: AsyncSession,
    email: str,
):
    user = await get_user_by_email(db, email)

    if not user:
        return True

    reset_token = generate_password_reset_token()

    user.password_reset_token = reset_token
    user.password_reset_token_expires_at = (
        get_password_reset_token_expiry()
    )

    await db.commit()

    await send_password_reset_email(
        to_email=user.email,
        reset_token=reset_token,
    )

    return True
async def reset_password(
    db: AsyncSession,
    token: str,
    new_password: str,
):
    result = await db.execute(
        select(User).where(
            User.password_reset_token == token
        )
    )

    user = result.scalars().first()

    if not user:
        raise ValueError(
            "Invalid or expired password reset link."
        )

    if (
        not user.password_reset_token_expires_at
        or user.password_reset_token_expires_at
        < datetime.now(timezone.utc)
    ):
        raise ValueError(
            "Invalid or expired password reset link."
        )

    user.hashed_password = hash_password(
        new_password
    )

    user.password_reset_token = None
    user.password_reset_token_expires_at = None

    await db.commit()

    return True
# ============================================================
# PROFILE
# ============================================================

async def update_user_profile(
    db: AsyncSession,
    user: User,
    name: str | None = None,
    email: str | None = None,
    phone: str | None = None,
):
    # Re-fetch user in the current DB session
    result = await db.execute(
        select(User).where(User.id == user.id)
    )

    user = result.scalars().first()

    if not user:
        raise ValueError("User not found.")

    if name is not None:
        name = name.strip()

        if len(name) < 2:
            raise ValueError(
                "Name must be at least 2 characters long."
            )

        user.name = name

    if email is not None:
        email = email.strip().lower()

        if email != user.email.lower():

            existing = await get_user_by_email(
                db,
                email
            )

            if existing and existing.id != user.id:
                raise ValueError(
                    "An account with this email already exists."
                )

            user.email = email

            # Email change requires re-verification
            user.email_verified = False

            user.verification_token = (
                generate_verification_token()
            )

            user.verification_token_expires_at = (
                get_verification_token_expiry()
            )

    if phone is not None:
        phone = phone.strip()

        user.phone = phone or None

    await db.commit()

    await db.refresh(user)

    return user
# ============================================================
# CHANGE PASSWORD
# ============================================================

async def change_user_password(
    db: AsyncSession,
    user: User,
    current_password: str,
    new_password: str,
):
    # Re-fetch user using the current DB session
    result = await db.execute(
        select(User).where(User.id == user.id)
    )

    user = result.scalars().first()

    if not user:
        raise ValueError("User not found.")

    # Verify current password
    if not verify_password(
        current_password,
        user.hashed_password,
    ):
        raise ValueError(
            "Current password is incorrect."
        )

    # Make sure new password is different
    if current_password == new_password:
        raise ValueError(
            "New password must be different from your current password."
        )

    # Password length validation
    if len(new_password) < 8:
        raise ValueError(
            "New password must be at least 8 characters long."
        )

    # Hash and save new password
    user.hashed_password = hash_password(
        new_password
    )

    await db.commit()

    return True
# ============================================================
# DEACTIVATE ACCOUNT
# ============================================================

async def deactivate_user(
    db: AsyncSession,
    user: User,
    password: str,
):
    if not verify_password(
        password,
        user.hashed_password,
    ):
        raise ValueError(
            "Incorrect password."
        )

    user.is_active = False

    await db.commit()

    return True


# ============================================================
# DELETE ACCOUNT
# ============================================================

async def delete_user(
    db: AsyncSession,
    user: User,
    password: str,
):
    # Re-fetch the user using the current DB session
    result = await db.execute(
        select(User).where(User.id == user.id)
    )

    user = result.scalars().first()

    if not user:
        raise ValueError(
            "User not found."
        )

    # Verify password
    if not verify_password(
        password,
        user.hashed_password,
    ):
        raise ValueError(
            "Incorrect password."
        )

    # Delete account
    await db.delete(user)

    await db.commit()

    return True