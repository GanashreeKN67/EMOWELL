import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict

from database import get_database
from services import behavior_logger, user_service

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "demo_seed.json"


async def seed_demo_data() -> None:
    if not DATA_FILE.exists():
        return

    with DATA_FILE.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    await _seed_admins(payload.get("admins", []))
    await _seed_users(payload.get("users", []))


async def _seed_admins(admin_entries: list[Dict[str, Any]]) -> None:
    for admin in admin_entries:
        existing = await user_service.get_user_by_email(admin["email"])
        if existing:
            continue
        await user_service.create_user(
            email=admin["email"],
            password=admin["password"],
            full_name=admin.get("full_name", "Admin"),
            role="admin",
            status="approved",
        )


async def _seed_users(user_entries: list[Dict[str, Any]]) -> None:
    behavior_collection = get_database()["behavior_logs"]

    for entry in user_entries:
        user = await user_service.get_user_by_email(entry["email"])
        if not user:
            user = await user_service.create_user(
                email=entry["email"],
                password=entry["password"],
                full_name=entry.get("full_name", "User"),
                status=entry.get("status", "pending"),
            )

        for record in entry.get("behavior", []):
            seed_key = f"{entry['email']}|{record.get('date')}|{record.get('modality')}|{record.get('emotion')}"
            existing_log = await behavior_collection.find_one(
                {"user_id": user["_id"], "metadata.seed_key": seed_key}
            )
            if existing_log:
                continue

            record_date = datetime.fromisoformat(record["date"]).replace(tzinfo=timezone.utc) + timedelta(hours=12)
            metadata = {
                "notes": record.get("notes"),
                "seed": True,
                "seed_key": seed_key,
            }
            await behavior_logger.log_behavior(
                user_id=user["_id"],
                modality=record.get("modality", "text"),
                emotion=record.get("emotion"),
                confidence=record.get("confidence"),
                metadata=metadata,
                created_at=record_date,
            )
