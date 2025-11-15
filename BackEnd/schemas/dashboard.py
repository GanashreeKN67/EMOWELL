from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel


class SummaryStats(BaseModel):
    total_interactions: int
    active_days: int
    streak_days: int
    last_active: Optional[str]


class ModalityBreakdown(BaseModel):
    modality: str
    count: int
    percentage: float


class DailySeriesPoint(BaseModel):
    date: str
    text: int
    audio: int
    image: int
    chatbot: int
    total: int


class EmotionSeriesPoint(BaseModel):
    date: str
    total: int
    emotions: Dict[str, int]


class RecentEntry(BaseModel):
    id: str
    modality: str
    emotion: str
    confidence: Optional[float]
    timestamp: datetime
    notes: Optional[str] = None


class DashboardResponse(BaseModel):
    summary: SummaryStats
    modalities: List[ModalityBreakdown]
    daily: List[DailySeriesPoint]
    emotion_series: List[EmotionSeriesPoint]
    top_emotions: List[str]
    window_days: int
    available_ranges: List[int]
    recent: List[RecentEntry]
