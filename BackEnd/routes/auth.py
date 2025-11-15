from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status

from dependencies.auth import get_current_user
from schemas.auth import TokenResponse, UserCreate, UserLogin
from services.user_service import create_user, get_user_by_email, serialize_user
from utils.security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register_user(payload: UserCreate):
    existing = await get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with that email already exists")

    user = await create_user(email=payload.email, password=payload.password, full_name=payload.full_name)

    return {
        "message": "Registration received. You will be able to log in after an admin approves your account.",
        "user": serialize_user(user),
    }


@router.post("/login", response_model=TokenResponse)
async def login_user(payload: UserLogin):
    user = await get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    if user.get("role") != "admin" and user.get("status") != "approved":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your account is pending approval")

    token = create_access_token({"sub": str(user.get("_id"))}, expires_delta=timedelta(hours=2))

    return TokenResponse(access_token=token, user=serialize_user(user))


@router.get("/me")
async def get_profile(current_user=Depends(get_current_user)):
    return {"user": serialize_user(current_user)}
