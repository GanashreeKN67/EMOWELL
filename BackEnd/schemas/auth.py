from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=120)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserPublic"


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    status: str
    created_at: datetime
    approved_at: Optional[datetime] = None


class PendingUser(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    status: str
    created_at: datetime


class ApproveUserRequest(BaseModel):
    approve: bool = True
    notes: Optional[str] = None


TokenResponse.model_rebuild()
