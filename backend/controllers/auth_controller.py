from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from schemas.auth import UserSignup
from services.auth import hash_password, verify_password, create_access_token


async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def signup_user(db: AsyncSession, data: UserSignup):
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise ValueError("An account with this email already exists.")

    new_user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def authenticate_user(db: AsyncSession, email: str, password: str):
    user = await get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user


def build_token_for_user(user: User) -> str:
    return create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
