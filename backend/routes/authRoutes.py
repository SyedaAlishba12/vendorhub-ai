from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from controllers.authController import AuthController
from common.utils.auth import get_current_user

from schemas.authSchema import (
    RegisterRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    RefreshTokenRequest,
    UserResponse,
    LoginResponse,
    RefreshTokenResponse,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------
# Register
# ------------------------

@router.post(
    "/register",
    response_model=UserResponse,
)
def register(
    user: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        return AuthController.register(db, user)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# ------------------------
# Login
# ------------------------

@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    try:
        return AuthController.login(
            db,
            credentials,
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# ------------------------
# Forgot Password
# ------------------------

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    return AuthController.forgot_password(
        db,
        request,
    )


# ------------------------
# Reset Password
# ------------------------

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    return AuthController.reset_password(
        db,
        request,
    )


# ------------------------
# Verify Email
# ------------------------

@router.get("/verify-email/{token}")
def verify_email(
    token: str,
    db: Session = Depends(get_db),
):
    return AuthController.verify_email(
        db,
        token,
    )


# ------------------------
# Refresh Token
# ------------------------

@router.post(
    "/refresh-token",
    response_model=RefreshTokenResponse,
)
def refresh_token(
    request: RefreshTokenRequest,
):
    return AuthController.refresh_token(
        request,
    )


# ------------------------
# Current User
# ------------------------

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_current_user_profile(
    current_user=Depends(get_current_user),
):
    return AuthController.current_user(current_user)