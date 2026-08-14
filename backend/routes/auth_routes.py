from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from common.middleware.authMiddleware import get_current_user

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import AsyncSessionLocal

from models.user import User

from schemas.auth import (
    UserSignup,
    UserLogin,
    UserResponse,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ProfileUpdateRequest,
    ChangePasswordRequest,
    AccountPasswordRequest,
)

from controllers import auth_controller
from services.auth import (
    get_user_id_from_token,
)

from services.auth import decode_access_token

from services.email_verification import (
    generate_verification_token,
    get_verification_token_expiry,
)
from controllers.auth_controller import (
    resend_verification_email,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# ============================================================
# DATABASE
# ============================================================

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# ============================================================
# SIGNUP
# ============================================================

@router.post(
    "/signup",
    response_model=TokenResponse,
)
async def signup(
    data: UserSignup,
    db: AsyncSession = Depends(get_db),
):
    try:
        user = await auth_controller.signup_user(
            db,
            data,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    token = auth_controller.build_token_for_user(
        user
    )

    return TokenResponse(
        access_token=token,
        user=user,
    )


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login(
    data: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    try:
        user = await auth_controller.authenticate_user(
            db,
            data.email,
            data.password,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password.",
        )

    token = auth_controller.build_token_for_user(user)

    return TokenResponse(
        access_token=token,
        user=user,
    )


# ============================================================
# CURRENT USER / ME
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
async def get_me(
    current_user=Depends(get_current_user),
):
    return current_user


# ============================================================
# VERIFY EMAIL
# ============================================================

@router.get("/verify-email")
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(
            User.verification_token == token
        )
    )

    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification token.",
        )

    if user.email_verified:
        return {
            "message": "Email is already verified."
        }

    if (
        not user.verification_token_expires_at
        or user.verification_token_expires_at
        < datetime.now(timezone.utc)
    ):
        raise HTTPException(
            status_code=400,
            detail="Verification token has expired.",
        )

    user.email_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None

    await db.commit()
    await db.refresh(user)

    # Create JWT after successful verification
    access_token = auth_controller.build_token_for_user(
        user
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put("/profile")
async def update_profile(
    data: ProfileUpdateRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user = await auth_controller.update_user_profile(
            db=db,
            user=current_user,
            name=data.name,
            email=data.email,
            phone=data.phone,
        )

        return user

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:
        import traceback

        print("========== UPDATE PROFILE ERROR ==========")
        print(str(e))
        traceback.print_exc()
        print("==========================================")

        raise HTTPException(
            status_code=500,
            detail=str(e),   # temporary: show actual error
        )

# ============================================================
# FORGOT PASSWORD
# ============================================================

@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        await auth_controller.request_password_reset(
            db,
            data.email,
        )

        return {
            "message": (
                "If an account with that email exists, "
                "a password reset link has been sent."
            )
        }

    except Exception as e:
        print(
            f"Forgot password error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to process password reset request.",
        )


# ============================================================
# RESET PASSWORD
# ============================================================

@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long.",
        )

    try:
        await auth_controller.reset_password(
            db,
            data.token,
            data.new_password,
        )

        return {
            "message": "Password reset successfully."
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:
        print(
            f"Reset password error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to reset password.",
        )


# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.put(
    "/change-password"
)
async def change_password(
    data: ChangePasswordRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        await auth_controller.change_user_password(
            db=db,
            user=current_user,
            current_password=data.current_password,
            new_password=data.new_password,
        )

        return {
            "message": "Password changed successfully."
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:
        print(
            f"Change password error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to change password.",
        )


# ============================================================
# DELETE ACCOUNT
# ============================================================

@router.delete(
    "/account"
)
async def delete_account(
    data: AccountPasswordRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        await auth_controller.delete_user(
            db=db,
            user=current_user,
            password=data.password,
        )

        return {
            "message": "Account deleted successfully."
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:
        import traceback

        print("========== ACCOUNT DELETE ERROR ==========")
        print(e)
        traceback.print_exc()
        print("==========================================")

        raise HTTPException(
           status_code=500,
           detail=str(e),
    )