from fastapi import APIRouter, HTTPException
from models.image_model import load_image_model
from models.audio_model import load_audio_model
from config import GEMINI_API_KEY
from datetime import datetime

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
async def health_check():
    """Health check endpoint"""
    try:
        image_loaded = load_image_model()
        audio_loaded = load_audio_model()
        gemini_configured = GEMINI_API_KEY is not None

        return {
            "status": "ok" if all([image_loaded, audio_loaded, gemini_configured]) else "partial",
            "models_loaded": {
                "image": image_loaded,
                "audio": audio_loaded,
            },
            "gemini_configured": gemini_configured,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")
