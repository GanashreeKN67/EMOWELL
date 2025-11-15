from datetime import datetime
from schemas.responses import EmotionResponse, ErrorResponse


def format_emotion_response(emotion: str, confidence: float, guidance: str = None,
                           coping_strategies: list = None, all_predictions: dict = None) -> dict:
    """Format emotion analysis response"""
    return {
        "success": True,
        "emotion": emotion,
        "confidence": round(confidence, 4),
        "guidance": guidance,
        "coping_strategies": coping_strategies,
        "all_predictions": all_predictions,
        "timestamp": datetime.utcnow().isoformat()
    }


def format_error_response(error: str, detail: str = None) -> dict:
    """Format error response"""
    return {
        "success": False,
        "error": error,
        "detail": detail,
        "timestamp": datetime.utcnow().isoformat()
    }


def format_chatbot_response(conversation_id: str, assistant_message: str,
                           detected_emotion: str = None) -> dict:
    """Format chatbot response"""
    return {
        "success": True,
        "conversation_id": conversation_id,
        "assistant_message": assistant_message,
        "detected_emotion": detected_emotion,
        "timestamp": datetime.utcnow().isoformat()
    }
