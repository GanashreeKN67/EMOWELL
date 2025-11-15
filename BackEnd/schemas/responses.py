from pydantic import BaseModel
from typing import Optional, Dict, List, Any


class EmotionResponse(BaseModel):
    success: bool
    emotion: str
    confidence: float
    guidance: Optional[str] = None
    coping_strategies: Optional[List[str]] = None
    all_predictions: Optional[Dict[str, float]] = None
    timestamp: str


class ChatbotResponse(BaseModel):
    success: bool
    conversation_id: str
    assistant_message: str
    detected_emotion: Optional[str] = None
    timestamp: str


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    gemini_configured: bool
    timestamp: str


class ErrorResponse(BaseModel):
    success: bool
    error: str
    detail: Optional[str] = None
    timestamp: str
