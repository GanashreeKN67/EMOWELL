from fastapi import APIRouter, Depends, HTTPException, status

from dependencies.auth import get_current_admin
from schemas.auth import ApproveUserRequest
from services import user_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users/pending")
async def list_pending(admin=Depends(get_current_admin)):
    pending_users = await user_service.list_pending_users()
    serialized = [user_service.serialize_user(user) for user in pending_users]
    return {"pending": serialized}


@router.post("/users/{user_id}/decision")
async def approve_or_reject(user_id: str, payload: ApproveUserRequest, admin=Depends(get_current_admin)):
    if payload.approve:
        updated = await user_service.approve_user(user_id, admin, payload.notes)
    else:
        updated = await user_service.reject_user(user_id, admin, payload.notes)

    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {"user": user_service.serialize_user(updated)}
