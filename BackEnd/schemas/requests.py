from pydantic import BaseModel, Field
from typing import Optional


class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    user_note: Optional[str] = Field(None, max_length=1000)


class ChatbotRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None


class HealthCheckRequest(BaseModel):
    pass
