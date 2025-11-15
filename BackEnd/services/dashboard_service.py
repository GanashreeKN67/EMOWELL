from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from bson import ObjectId

from database import get_database
from services.behavior_logger import MODALITIES

DEFAULT_WINDOW_DAYS = 14
MIN_WINDOW_DAYS = 7
MAX_WINDOW_DAYS = 90
TOP_EMOTION_LIMIT = 8
AVAILABLE_RANGES = (7, 30, 90)


def _collection():
    return get_database()["behavior_logs"]


def _ensure_object_id(value: Any) -> ObjectId:
    if isinstance(value, ObjectId):
        return value
    return ObjectId(str(value))


def _floor_date(value: datetime) -> datetime.date:
    return value.astimezone(timezone.utc).date()


def _format_date(value: datetime.date) -> str:
    return value.isoformat()


async def get_dashboard_payload(user_id: Any, window_days: int = DEFAULT_WINDOW_DAYS) -> Dict[str, Any]:
    user_object_id = _ensure_object_id(user_id)
    collection = _collection()

    window_days = max(MIN_WINDOW_DAYS, min(MAX_WINDOW_DAYS, int(window_days)))

    total_interactions = await collection.count_documents({"user_id": user_object_id})

    latest_cursor = collection.find({"user_id": user_object_id}).sort("created_at", -1).limit(1)
    latest_docs = await latest_cursor.to_list(length=1)
    last_active = (
        latest_docs[0]["created_at"].astimezone(timezone.utc).isoformat()
        if latest_docs
        else None
    )

    window_start = datetime.now(timezone.utc) - timedelta(days=window_days - 1)
    range_cursor = (
        collection.find({"user_id": user_object_id, "created_at": {"$gte": window_start}})
        .sort("created_at", 1)
    )
    range_logs = await range_cursor.to_list(length=window_days * 200)

    daily_counts: Dict[str, Dict[str, int]] = defaultdict(lambda: {m: 0 for m in MODALITIES})
    emotion_counts: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    emotion_totals: Dict[str, int] = defaultdict(int)
    active_days_set = set()

    for log in range_logs:
        date_key = _format_date(_floor_date(log["created_at"]))
        active_days_set.add(date_key)
        modality = log.get("modality", "text")
        daily_counts[date_key][modality] = daily_counts[date_key].get(modality, 0) + 1
        emotion_label = (log.get("emotion") or "unknown").lower()
        emotion_counts[date_key][emotion_label] += 1
        emotion_totals[emotion_label] += 1

    ordered_dates: List[str] = []
    today = datetime.now(timezone.utc).date()
    for offset in range(window_days):
        day = today - timedelta(days=window_days - 1 - offset)
        day_str = day.isoformat()
        ordered_dates.append(day_str)
        daily_counts.setdefault(day_str, {m: 0 for m in MODALITIES})
        emotion_counts.setdefault(day_str, defaultdict(int))

    daily_series = []
    daily_totals_lookup: Dict[str, int] = {}
    for date_key in ordered_dates:
        modal_counts = daily_counts[date_key]
        total_for_day = sum(modal_counts.values())
        daily_totals_lookup[date_key] = total_for_day
        daily_series.append(
            {
                "date": date_key,
                "text": modal_counts.get("text", 0),
                "audio": modal_counts.get("audio", 0),
                "image": modal_counts.get("image", 0),
                "chatbot": modal_counts.get("chatbot", 0),
                "total": total_for_day,
            }
        )

    sorted_emotions = sorted(
        emotion_totals.items(), key=lambda item: item[1], reverse=True
    )
    include_other_bucket = len(sorted_emotions) > TOP_EMOTION_LIMIT
    if sorted_emotions:
        top_emotions = [name for name, _ in sorted_emotions[:TOP_EMOTION_LIMIT]]
    else:
        top_emotions = ["unknown"]
    if include_other_bucket and "other" not in top_emotions:
        top_emotions.append("other")

    top_emotion_lookup = {emotion for emotion in top_emotions if emotion != "other"}

    emotion_series: List[Dict[str, Any]] = []
    for date_key in ordered_dates:
        per_day = emotion_counts[date_key]
        payload: Dict[str, int] = {}
        for emotion in top_emotions:
            if emotion == "other":
                other_total = sum(
                    count for label, count in per_day.items() if label not in top_emotion_lookup
                )
                payload["other"] = other_total
            else:
                payload[emotion] = per_day.get(emotion, 0)
        emotion_series.append(
            {
                "date": date_key,
                "total": daily_totals_lookup.get(date_key, 0),
                "emotions": payload,
            }
        )

    modality_totals = {modality: 0 for modality in MODALITIES}
    for log in range_logs:
        modality = log.get("modality", "text")
        modality_totals[modality] = modality_totals.get(modality, 0) + 1

    total_in_window = sum(modality_totals.values()) or 1
    modalities_breakdown = [
        {
            "modality": modality,
            "count": modality_totals.get(modality, 0),
            "percentage": round((modality_totals.get(modality, 0) / total_in_window) * 100, 2),
        }
        for modality in MODALITIES
    ]

    recent_cursor = collection.find({"user_id": user_object_id}).sort("created_at", -1).limit(6)
    recent_docs = await recent_cursor.to_list(length=6)
    recent_entries = [
        {
            "id": str(doc.get("_id")),
            "modality": doc.get("modality"),
            "emotion": doc.get("emotion") or "unknown",
            "confidence": doc.get("confidence"),
            "timestamp": doc.get("created_at"),
            "notes": (
                (doc.get("metadata") or {}).get("notes")
                or (doc.get("metadata") or {}).get("note")
            ),
        }
        for doc in recent_docs
    ]

    streak_days = 0
    current_day = today
    active_days_lookup = set(active_days_set)
    while True:
        day_str = current_day.isoformat()
        if day_str in active_days_lookup:
            streak_days += 1
            current_day = current_day - timedelta(days=1)
            continue
        break

    summary = {
        "total_interactions": total_interactions,
        "active_days": len(active_days_lookup),
        "streak_days": streak_days,
        "last_active": last_active,
    }

    return {
        "summary": summary,
        "modalities": modalities_breakdown,
        "daily": daily_series,
        "emotion_series": emotion_series,
        "top_emotions": top_emotions,
        "window_days": window_days,
        "available_ranges": list(AVAILABLE_RANGES),
        "recent": recent_entries,
    }
