from fastapi import APIRouter, Depends, HTTPException
from schemas.requests import ChatbotRequest
from services.gemini_service import get_chatbot_response
from utils.response_formatter import format_chatbot_response
import uuid
from dependencies.auth import get_current_active_user
from services.behavior_logger import log_behavior

router = APIRouter(prefix="/assistant", tags=["assistant"])

conversation_memory = {}


@router.post("/chat")
async def chat_with_assistant(
    request: ChatbotRequest,
    current_user=Depends(get_current_active_user),
):
    """Chat with CLARITY mental health assistant"""
    try:
        conversation_id = request.conversation_id or str(uuid.uuid4())

        memory_key = f"{current_user['_id']}::{conversation_id}"

        if memory_key not in conversation_memory:
            conversation_memory[memory_key] = []

        conversation_history = conversation_memory[memory_key]

        assistant_message, detected_emotion = get_chatbot_response(
            request.message,
            conversation_history,
        )

        conversation_history.append({
            "user": request.message,
            "assistant": assistant_message,
        })

        if len(conversation_history) > 20:
            conversation_memory[memory_key] = conversation_history[-20:]

        await log_behavior(
            user_id=current_user["_id"],
            modality="chatbot",
            emotion=detected_emotion,
            confidence=None,
            metadata={
                "message_length": len(request.message),
                "conversation_id": conversation_id,
            },
        )

        return format_chatbot_response(
            conversation_id=conversation_id,
            assistant_message=assistant_message,
            detected_emotion=detected_emotion,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in chatbot: {str(e)}")


@router.post("/chat/clear/{conversation_id}")
async def clear_conversation(conversation_id: str, current_user=Depends(get_current_active_user)):
    """Clear conversation history"""
    try:
        memory_key = f"{current_user['_id']}::{conversation_id}"
        if memory_key in conversation_memory:
            del conversation_memory[memory_key]

        return {
            "success": True,
            "message": "Conversation cleared",
            "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing conversation: {str(e)}")
