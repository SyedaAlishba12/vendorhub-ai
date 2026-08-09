from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import AsyncSessionLocal
from schemas.auth import UserSignup, UserLogin, UserResponse, TokenResponse
from controllers import auth_controller
from services.auth import decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def get_current_user(authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await auth_controller.get_user_by_email(db, payload.get("email"))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/signup", response_model=TokenResponse)
async def signup(data: UserSignup, db: AsyncSession = Depends(get_db)):
    try:
        user = await auth_controller.signup_user(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    token = auth_controller.build_token_for_user(user)
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await auth_controller.authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = auth_controller.build_token_for_user(user)
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return current_user
