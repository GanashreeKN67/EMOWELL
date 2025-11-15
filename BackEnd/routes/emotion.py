from fastapi import APIRouter, File, UploadFile, HTTPException
from models.image_model import predict_emotion_from_image
from models.audio_model import predict_emotion_from_audio
from models.text_model import analyze_text_emotion
from services.file_service import save_upload_file, cleanup_file
from schemas.requests import TextAnalysisRequest
from utils.validators import validate_image_file, validate_audio_file, validate_text_input
from utils.response_formatter import format_emotion_response

router = APIRouter(prefix="/emotion", tags=["emotion"])


@router.post("/image")
async def analyze_image_emotion(file: UploadFile = File(...)):
    """Analyze emotion from uploaded image"""
    file_path = None
    try:
        file_path = save_upload_file(file)

        is_valid, message = validate_image_file(file_path, file.filename)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)

        result = predict_emotion_from_image(file_path)

        return format_emotion_response(
            emotion=result["emotion"],
            confidence=result["confidence"],
            all_predictions=result["all_predictions"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")
    finally:
        if file_path:
            cleanup_file(file_path)


@router.post("/audio")
async def analyze_audio_emotion(file: UploadFile = File(...)):
    """Analyze emotion from uploaded audio"""
    file_path = None
    try:
        file_path = save_upload_file(file)

        is_valid, message = validate_audio_file(file_path, file.filename)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)

        result = predict_emotion_from_audio(file_path)

        return format_emotion_response(
            emotion=result["emotion"],
            confidence=result["confidence"],
            all_predictions=result["all_predictions"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing audio: {str(e)}")
    finally:
        if file_path:
            cleanup_file(file_path)


@router.post("/text")
async def analyze_text_emotion_endpoint(request: TextAnalysisRequest):
    """Analyze emotion from text with CBT guidance"""
    try:
        is_valid, message = validate_text_input(request.text)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)

        result = analyze_text_emotion(request.text, request.user_note or "")

        return format_emotion_response(
            emotion=result["detected_emotion"],
            confidence=0.85,
            guidance=result["guidance"],
            coping_strategies=result["coping_strategies"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing text: {str(e)}")
