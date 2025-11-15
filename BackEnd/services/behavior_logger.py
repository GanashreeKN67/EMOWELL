from datetime import datetime, timezone
from typing import Any, Dict, Optional

from bson import ObjectId

from database import get_database

MODALITIES = ("text", "audio", "image", "chatbot")


def _collection():
    return get_database()["behavior_logs"]


def _ensure_object_id(value: Any) -> ObjectId:
    if isinstance(value, ObjectId):
        return value
    return ObjectId(str(value))


async def log_behavior(
    *,
    user_id: Any,
    modality: str,
    emotion: Optional[str],
    confidence: Optional[float] = None,
    metadata: Optional[Dict[str, Any]] = None,
    created_at: Optional[datetime] = None,
) -> None:
    if modality not in MODALITIES:
        raise ValueError(f"Unsupported modality '{modality}'.")

    entry = {
        "user_id": _ensure_object_id(user_id),
        "modality": modality,
        "emotion": emotion,
        "confidence": confidence,
        "metadata": metadata or {},
        "created_at": created_at or datetime.now(timezone.utc),
    }
    await _collection().insert_one(entry)
