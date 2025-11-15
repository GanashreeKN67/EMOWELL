from fastapi import APIRouter, HTTPException
from schemas.requests import ChatbotRequest
from services.gemini_service import get_chatbot_response
from utils.response_formatter import format_chatbot_response
import uuid

router = APIRouter(prefix="/assistant", tags=["assistant"])

conversation_memory = {}


@router.post("/chat")
async def chat_with_assistant(request: ChatbotRequest):
    """Chat with CLARITY mental health assistant"""
    try:
        conversation_id = request.conversation_id or str(uuid.uuid4())

        if conversation_id not in conversation_memory:
            conversation_memory[conversation_id] = []

        conversation_history = conversation_memory[conversation_id]

        assistant_message, detected_emotion = get_chatbot_response(
            request.message,
            conversation_history,
        )

        conversation_history.append({
            "user": request.message,
            "assistant": assistant_message,
        })

        if len(conversation_history) > 20:
            conversation_memory[conversation_id] = conversation_history[-20:]

        return format_chatbot_response(
            conversation_id=conversation_id,
            assistant_message=assistant_message,
            detected_emotion=detected_emotion,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in chatbot: {str(e)}")


@router.post("/chat/clear/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """Clear conversation history"""
    try:
        if conversation_id in conversation_memory:
            del conversation_memory[conversation_id]

        return {
            "success": True,
            "message": "Conversation cleared",
            "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing conversation: {str(e)}")
