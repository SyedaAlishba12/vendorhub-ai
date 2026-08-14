from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "buyer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==========================================
# FORGOT PASSWORD
# ==========================================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# ==========================================
# RESET PASSWORD
# ==========================================

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ==========================================
# PROFILE UPDATE
# ==========================================

class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None


# ==========================================
# CHANGE PASSWORD
# ==========================================

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ==========================================
# ACCOUNT ACTIONS
# ==========================================

class AccountPasswordRequest(BaseModel):
    password: str