from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId

from database import get_database
from utils.security import get_password_hash


USERS_COLLECTION = "users"


def _collection():
    return get_database()[USERS_COLLECTION]


def _normalise_email(email: str) -> str:
    return email.strip().lower()


def _ensure_object_id(value: Any) -> ObjectId:
    if isinstance(value, ObjectId):
        return value
    return ObjectId(str(value))


def serialize_user(user: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(user.get("_id")),
        "email": user.get("email"),
        "full_name": user.get("full_name"),
        "role": user.get("role", "user"),
        "status": user.get("status", "pending"),
        "created_at": user.get("created_at"),
        "approved_at": user.get("approved_at"),
    }


async def ensure_user_indexes() -> None:
    await _collection().create_index("email", unique=True)


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    return await _collection().find_one({"email": _normalise_email(email)})


async def get_user_by_id(user_id: Any) -> Optional[Dict[str, Any]]:
    return await _collection().find_one({"_id": _ensure_object_id(user_id)})


async def create_user(*, email: str, password: str, full_name: str, role: str = "user", status: str = "pending") -> Dict[str, Any]:
    document = {
        "email": _normalise_email(email),
        "full_name": full_name.strip(),
        "hashed_password": get_password_hash(password),
        "role": role,
        "status": status,
        "created_at": datetime.now(timezone.utc),
        "approved_at": datetime.now(timezone.utc) if status == "approved" else None,
        "approved_by": None,
        "approval_notes": None,
    }
    result = await _collection().insert_one(document)
    document["_id"] = result.inserted_id
    return document


async def list_pending_users() -> List[Dict[str, Any]]:
    cursor = _collection().find({"status": "pending"}).sort("created_at", 1)
    return await cursor.to_list(length=100)


async def approve_user(user_id: Any, admin_user: Dict[str, Any], notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
    user_object_id = _ensure_object_id(user_id)
    update_payload = {
        "$set": {
            "status": "approved",
            "approved_at": datetime.now(timezone.utc),
            "approved_by": str(admin_user.get("_id")),
            "approval_notes": notes,
        }
    }
    await _collection().update_one({"_id": user_object_id}, update_payload)
    return await get_user_by_id(user_object_id)


async def reject_user(user_id: Any, admin_user: Dict[str, Any], notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
    user_object_id = _ensure_object_id(user_id)
    update_payload = {
        "$set": {
            "status": "rejected",
            "approved_at": None,
            "approved_by": str(admin_user.get("_id")),
            "approval_notes": notes,
        }
    }
    await _collection().update_one({"_id": user_object_id}, update_payload)
    return await get_user_by_id(user_object_id)
