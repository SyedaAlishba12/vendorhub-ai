from pydantic import BaseModel, Field
from typing import Optional


# -------------------------
# Request Schemas
# -------------------------

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=100)
    email: str
    password: str = Field(..., min_length=8)
    role: str = "vendor"


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# -------------------------
# Response Schemas
# -------------------------

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    success: bool
    message: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    tokens: Optional[TokenResponse] = None

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

    model_config = {
        "from_attributes": True
    }


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str