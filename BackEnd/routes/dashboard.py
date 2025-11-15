from fastapi import APIRouter, Depends, Query

from dependencies.auth import get_current_active_user
from schemas.dashboard import DashboardResponse
from services.dashboard_service import (
    DEFAULT_WINDOW_DAYS,
    MAX_WINDOW_DAYS,
    MIN_WINDOW_DAYS,
    get_dashboard_payload,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=DashboardResponse)
async def get_dashboard_overview(
    range_days: int = Query(
        DEFAULT_WINDOW_DAYS,
        ge=MIN_WINDOW_DAYS,
        le=MAX_WINDOW_DAYS,
        description="Number of days of history to include",
    ),
    current_user=Depends(get_current_active_user),
):
    return await get_dashboard_payload(current_user.get("_id"), window_days=range_days)
