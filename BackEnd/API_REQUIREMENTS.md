# CLARITY Backend API Requirements

This document explains how to use the CLARITY FastAPI backend from any frontend client. It avoids deep technical language so it can be shared with non-developers when needed.

---

## 1. Getting Started

- **Base URL**: Use the server address where the backend is running. While testing locally it is usually `http://127.0.0.1:8000`.
- **Content Type**: Send JSON for text requests and form-data for file uploads (images and audio).
- **Authentication**: None required right now. Every endpoint is open once your frontend can reach the server.

---

## 2. Endpoints Summary

| Endpoint                                  | Method | What it does                                                          | When to use it                                       |
| ----------------------------------------- | ------ | --------------------------------------------------------------------- | ---------------------------------------------------- |
| `/emotion/text`                           | POST   | Reads plain text and returns the detected emotion with guidance tips. | Use after a user shares their feelings in text form. |
| `/emotion/image`                          | POST   | Looks at a face image and guesses the emotion.                        | Use when a user uploads a selfie or webcam snapshot. |
| `/emotion/audio`                          | POST   | Listens to a short audio clip and predicts the emotion.               | Use when a user records their voice.                 |
| `/assistant/chat`                         | POST   | Sends a message to the CLARITY chatbot and gets a supportive reply.   | Use for the conversational assistant in your UI.     |
| `/assistant/chat/clear/{conversation_id}` | POST   | Clears the stored conversation history for a chat session.            | Optional. Call when the user starts over.            |
| `/health`                                 | GET    | Checks if models and the Gemini key are properly configured.          | Use for internal monitoring or a setup checklist.    |
| `/`                                       | GET    | Returns basic service info such as version and uptime.                | Use to confirm the server is alive.                  |

---

## 3. Detailed Endpoint Notes

### 3.1 `/emotion/text` (POST)

- **Purpose**: Understand user feelings from text and provide CBT-style guidance.
- **Request Body (JSON)**
  ```json
  {
    "text": "I feel nervous about my exam tomorrow",
    "user_note": "User also mentioned trouble sleeping" // optional
  }
  ```
- **Response Body (JSON)**
  ```json
  {
    "success": true,
    "emotion": "anxious",
    "confidence": 0.85,
    "guidance": "Supportive CBT advice...",
    "coping_strategies": [
      "Practice grounding techniques",
      "Challenge worried thoughts"
    ],
    "timestamp": "2025-11-13T10:15:30.123456",
    "all_predictions": null // only present for image/audio requests
  }
  ```

### 3.2 `/emotion/image` (POST)

- **Purpose**: Detect the dominant facial emotion.
- **Request**: Send a `multipart/form-data` request with the image file under the field name `file`.
  - Accepts `.jpg`, `.jpeg`, `.png` up to 10 MB.
- **Response Body (JSON)**
  ```json
  {
    "success": true,
    "emotion": "happy",
    "confidence": 0.92,
    "all_predictions": {
      "angry": 0.01,
      "disgust": 0.0,
      "fear": 0.02,
      "happy": 0.92,
      "neutral": 0.03,
      "sad": 0.01,
      "surprise": 0.01
    },
    "timestamp": "2025-11-13T10:15:30.123456"
  }
  ```

### 3.3 `/emotion/audio` (POST)

- **Purpose**: Detect the dominant emotion in a short speech clip.
- **Request**: Send a `multipart/form-data` request with the audio file under the field name `file`.
  - Accepts `.wav`, `.mp3`, `.ogg`, `.flac`, `.m4a` up to 10 MB.
- **Response Body (JSON)** similar to the image endpoint.

### 3.4 `/assistant/chat` (POST)

- **Purpose**: Conversational CBT assistant with memory.
- **Request Body (JSON)**
  ```json
  {
    "message": "I'm overwhelmed at work",
    "conversation_id": "abc123" // optional; provide to keep context across messages
  }
  ```
- **Response Body (JSON)**
  ```json
  {
    "success": true,
    "conversation_id": "abc123",
    "assistant_message": "Empathetic response...",
    "detected_emotion": "anxious",
    "timestamp": "2025-11-13T10:15:30.123456"
  }
  ```
- Keep the `conversation_id` returned from the backend and send it with later messages to maintain context. Let it be blank or omit it to start a new conversation.

### 3.5 `/assistant/chat/clear/{conversation_id}` (POST)

- **Purpose**: Forget stored chat history for a conversation.
- **Request**: Use the `conversation_id` you want to clear, for example `/assistant/chat/clear/abc123`.
- **Response**
  ```json
  {
    "success": true,
    "message": "Conversation cleared",
    "timestamp": "2025-11-13T10:15:30.123456"
  }
  ```

### 3.6 `/health` (GET)

- **Purpose**: Simple service status.
- **Response**
  ```json
  {
    "status": "ok", // or "partial"
    "models_loaded": {
      "image": true,
      "audio": true
    },
    "gemini_configured": true,
    "timestamp": "2025-11-13T10:15:30.123456"
  }
  ```

### 3.7 `/` (GET)

- **Purpose**: Quick metadata check.
- **Response**
  ```json
  {
    "name": "CLARITY",
    "description": "Emotion Recognition & Mental Health Support System",
    "version": "1.0.0",
    "status": "online",
    "timestamp": "2025-11-13T10:15:30.123456"
  }
  ```

---

## 4. Error Handling

When something goes wrong you will receive a response shaped like this:

```json
{
  "success": false,
  "error": "Short description of the problem",
  "detail": "Extra info if available",
  "timestamp": "2025-11-13T10:15:30.123456"
}
```

Common causes include:

- Missing file or wrong file type for uploads.
- Text longer than 2000 characters.
- Backend cannot reach the Gemini API (configure `GEMINI_API_KEY`).

Always show a human-friendly message to your users when an error occurs.

---

## 5. Frontend Integration Tips

- Use HTTPS in production to protect uploads and messages.
- For file uploads, use a standard HTML form or your framework’s form-data helper.
- Keep the conversation ID in your frontend state (for example, local storage or in-memory) to preserve chat history.
- Display the coping strategies list as actionable bullet points or buttons to encourage user engagement.

---

## 6. Checklist for Launch

1. `.env` file is filled out with the correct model paths and Gemini API key.
2. Models (`.keras` and scaler) are present under `models_saved/`.
3. Backend server responds to `GET /` with `status: online`.
4. Test each endpoint with sample data before connecting the full UI.

If you follow this guide, you will have everything needed to hook up the CLARITY backend to your frontend experience.
