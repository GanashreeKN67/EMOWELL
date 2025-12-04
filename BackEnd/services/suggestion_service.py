import json
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any

import google.generativeai as genai
from bson import ObjectId

from config import GEMINI_API_KEY
from database import connect_to_mongo, get_database

# Configure Gemini API
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY is not configured. Suggestions will be unavailable.")

GEMINI_MODEL_NAME = "gemini-2.5-flash"
GENERATION_CONFIG = {
    "temperature": 0.6,
    "top_p": 0.9,
    "top_k": 32,
    "response_mime_type": "application/json",
}


def _get_model() -> genai.GenerativeModel:
    return genai.GenerativeModel(
        GEMINI_MODEL_NAME,
        generation_config=GENERATION_CONFIG,
    )


def _extract_json_from_response(response_text: str) -> Dict[str, Any]:
    if not response_text:
        raise ValueError("Gemini returned an empty response.")
    try:
        parsed = json.loads(response_text)
    except json.JSONDecodeError:
        match = re.search(r"{.*}", response_text, re.DOTALL)
        if not match:
            raise ValueError("Gemini response was not valid JSON.")
        parsed = json.loads(match.group(0))
    if not isinstance(parsed, dict):
        raise ValueError("Gemini response must be a JSON object.")
    return parsed


def _generate_with_retries(prompt: str, max_attempts: int = 2) -> Dict[str, Any]:
    model = _get_model()
    last_error: Exception | None = None
    for attempt in range(max_attempts):
        refined_prompt = prompt if attempt == 0 else (
            f"{prompt}\n\nEnsure your response is ONLY the JSON object described above. Do not include markdown, explanations, or additional prose."
        )
        response = model.generate_content(refined_prompt)
        response_text = getattr(response, "text", None)
        if response_text is None and getattr(response, "candidates", None):
            parts = []
            for candidate in response.candidates:
                content = getattr(candidate, "content", None)
                if content and getattr(content, "parts", None):
                    for part in content.parts:
                        value = getattr(part, "text", None)
                        if value:
                            parts.append(value)
            response_text = "\n".join(parts)
        try:
            return _extract_json_from_response(response_text or "")
        except Exception as exc:  # pylint: disable=broad-except
            last_error = exc
    raise RuntimeError(f"Gemini response parsing failed: {last_error}")

async def get_user_emotion_history(user_id: str, days: int = 30) -> List[Dict]:
    """Retrieve user's recent emotion history for context"""
    try:
        try:
            db = get_database()
        except RuntimeError:
            db = await connect_to_mongo()
        start_date = datetime.utcnow() - timedelta(days=days)
        
        cursor = db.behavior_logs.find({
            "user_id": ObjectId(user_id),
            "timestamp": {"$gte": start_date}
        }).sort("timestamp", -1).limit(50)
        
        history = []
        logs = await cursor.to_list(length=50)
        for log in logs:
            history.append({
                "emotion": log.get("emotion"),
                "confidence": log.get("confidence"),
                "modality": log.get("modality"),
                "timestamp": log.get("timestamp"),
                "metadata": log.get("metadata", {})
            })
        
        return history
    except Exception as e:
        print(f"Error retrieving user history: {e}")
        return []

def analyze_emotion_patterns(history: List[Dict]) -> Dict[str, Any]:
    """Analyze user's emotion patterns to provide context"""
    if not history:
        return {"patterns": [], "trends": "No recent history available"}
    
    emotion_counts = {}
    modality_preferences = {}
    recent_emotions = []
    
    for log in history:
        emotion = log.get("emotion", "unknown")
        modality = log.get("modality", "unknown")
        
        # Count emotions
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        # Track modality usage
        modality_preferences[modality] = modality_preferences.get(modality, 0) + 1
        
        # Recent emotions (last 7 entries)
        if len(recent_emotions) < 7:
            recent_emotions.append(emotion)
    
    # Find dominant emotions
    dominant_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else "neutral"
    
    # Determine trend
    if len(recent_emotions) >= 3:
        positive_emotions = ["happy", "calm", "neutral", "surprise"]
        recent_positive = sum(1 for e in recent_emotions[:3] if e in positive_emotions)
        trend = "improving" if recent_positive >= 2 else "concerning" if recent_positive == 0 else "stable"
    else:
        trend = "insufficient_data"
    
    return {
        "dominant_emotion": dominant_emotion,
        "emotion_distribution": emotion_counts,
        "modality_usage": modality_preferences,
        "recent_trend": trend,
        "total_interactions": len(history)
    }

async def generate_personalized_suggestions(
    current_emotion: str,
    confidence: float,
    modality: str,
    user_id: str,
    all_predictions: Dict = None
) -> Dict[str, Any]:
    """Generate personalized suggestions using Gemini AI based on emotion, confidence, and user history"""
    
    try:
        if not GEMINI_API_KEY:
            print("Gemini API key is not configured; skipping suggestion generation.")
            return None

        # Get user's emotion history
        history = await get_user_emotion_history(user_id)
        patterns = analyze_emotion_patterns(history)
        
        # Prepare context for AI
        context_prompt = f"""
        You are a compassionate CBT (Cognitive Behavioral Therapy) assistant providing personalized guidance.
        
        CURRENT SITUATION:
        - Detected Emotion: {current_emotion}
        - Confidence Score: {confidence:.2f} ({get_confidence_level(confidence)})
        - Analysis Method: {modality}
        
        USER HISTORY CONTEXT:
        - Dominant emotion pattern: {patterns.get('dominant_emotion', 'unknown')}
        - Recent trend: {patterns.get('recent_trend', 'unknown')}
        - Total interactions: {patterns.get('total_interactions', 0)}
        - Emotion distribution: {patterns.get('emotion_distribution', {})}
        
        """
        
        if all_predictions:
            context_prompt += f"- Secondary emotions detected: {format_secondary_emotions(all_predictions, current_emotion)}\n"
        
        context_prompt += f"""
        TASK:
        Provide 4-6 personalized, actionable suggestions that:
        1. Address the current emotion ({current_emotion}) specifically
        2. Consider the confidence level ({get_confidence_level(confidence)})
        3. Account for the user's emotional patterns and history
        4. Include both immediate coping strategies and longer-term recommendations
        5. Are practical and easy to implement
        6. Use a warm, supportive, and non-judgmental tone
        
        Format your response as a JSON object with this structure:
        {{
            "immediate_actions": ["action1", "action2", "action3"],
            "coping_strategies": ["strategy1", "strategy2"],
            "long_term_recommendations": ["recommendation1", "recommendation2"],
            "personalized_insight": "A brief, supportive message based on their patterns"
        }}
        
        Make suggestions specific to {modality} analysis and the detected emotion of {current_emotion}.
        """
        
        suggestions_data = _generate_with_retries(context_prompt)

        # Normalize structure expected by the UI while preserving model-provided content
        def ensure_list(value):
            if value is None:
                return []
            if isinstance(value, list):
                return [str(item) for item in value]
            return [str(value)]

        suggestions_data["immediate_actions"] = ensure_list(suggestions_data.get("immediate_actions"))
        suggestions_data["coping_strategies"] = ensure_list(suggestions_data.get("coping_strategies"))
        suggestions_data["long_term_recommendations"] = ensure_list(suggestions_data.get("long_term_recommendations"))

        if "personalized_insight" in suggestions_data and suggestions_data["personalized_insight"] is not None:
            suggestions_data["personalized_insight"] = str(suggestions_data["personalized_insight"])

        suggestions_data["confidence_note"] = get_confidence_guidance(confidence)
        suggestions_data["emotion_intensity"] = get_emotion_intensity(current_emotion, confidence)

        return suggestions_data

    except Exception as e:
        print(f"Error generating suggestions: {e}")
        return None

def get_confidence_level(confidence: float) -> str:
    """Convert confidence score to human-readable level"""
    if confidence >= 0.8:
        return "Very High"
    elif confidence >= 0.6:
        return "High"
    elif confidence >= 0.4:
        return "Moderate"
    elif confidence >= 0.2:
        return "Low"
    else:
        return "Very Low"

def get_confidence_guidance(confidence: float) -> str:
    """Provide guidance based on confidence level"""
    if confidence >= 0.8:
        return "The analysis shows strong confidence in this emotion detection."
    elif confidence >= 0.6:
        return "The analysis indicates good confidence in this emotion detection."
    elif confidence >= 0.4:
        return "The analysis shows moderate confidence. Consider the suggestions as general guidance."
    else:
        return "The analysis has lower confidence. These suggestions are general emotional support strategies."

def get_emotion_intensity(emotion: str, confidence: float) -> str:
    """Determine emotion intensity based on confidence"""
    if confidence >= 0.7:
        return "Strong"
    elif confidence >= 0.5:
        return "Moderate"
    else:
        return "Mild"

def format_secondary_emotions(all_predictions: Dict, primary_emotion: str) -> str:
    """Format secondary emotions for context"""
    try:
        sorted_predictions = sorted(all_predictions.items(), key=lambda x: x[1], reverse=True)
        secondary = [f"{emotion} ({score:.2f})" for emotion, score in sorted_predictions[1:3] if emotion != primary_emotion]
        return ", ".join(secondary) if secondary else "None significant"
    except:
        return "Not available"
