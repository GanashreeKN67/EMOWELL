from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import DEBUG, HOST, PORT
from routes import emotion, assistant, health
from models.image_model import load_image_model
from models.audio_model import load_audio_model
from datetime import datetime

app = FastAPI(
    title="CLARITY - Emotion Recognition & Mental Health Support",
    description="Multi-modal emotion recognition with CBT-based mental health support",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    print("\n" + "=" * 80)
    print("Starting CLARITY Backend...")
    print("=" * 80)

    print("\nLoading Image Emotion Model...")
    if load_image_model():
        print("   [OK] Image model loaded successfully")
    else:
        print("   [WARN] Image model failed to load")

    print("\nLoading Audio Emotion Model...")
    if load_audio_model():
        print("   [OK] Audio model loaded successfully")
    else:
        print("   [WARN] Audio model failed to load")

    print("\n" + "=" * 80)
    print(f"Backend is ready on {HOST}:{PORT}")
    print("=" * 80 + "\n")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("\nShutting down CLARITY Backend...")


app.include_router(emotion.router)
app.include_router(assistant.router)
app.include_router(health.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "CLARITY",
        "description": "Emotion Recognition & Mental Health Support System",
        "version": "1.0.0",
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=HOST, port=PORT, reload=DEBUG)
