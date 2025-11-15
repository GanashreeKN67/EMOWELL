# CLARITY Backend

FastAPI backend powering the CLARITY multi-modal emotion recognition and CBT-guided assistant.

## Quick Start

1. Create a Python 3.10+ environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and update the values, including `GEMINI_API_KEY`.
4. Place your trained model artifacts in `models_saved/` matching the paths set in `config.py`.
5. Launch the API:
   ```bash
   python main.py
   ```
   or
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Overview

- `POST /emotion/image` — Predict emotion from an uploaded image file.
- `POST /emotion/audio` — Predict emotion from an uploaded audio file.
- `POST /emotion/text` — Analyze text and return CBT guidance.
- `POST /assistant/chat` — Converse with the CLARITY assistant.
- `POST /assistant/chat/clear/{conversation_id}` — Clear stored conversation history.
- `GET /health` — Verify model and Gemini configuration status.
- `GET /` — Basic service metadata.
