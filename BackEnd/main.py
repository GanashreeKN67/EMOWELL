from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import DEBUG, HOST, PORT
from database import close_mongo_connection, connect_to_mongo
from routes import emotion, assistant, health
from routes import auth as auth_routes
from routes import admin as admin_routes
from routes import dashboard as dashboard_routes
from models.image_model import load_image_model
from models.audio_model import load_audio_model
from datetime import datetime
from services.seed_service import seed_demo_data
from services.user_service import ensure_user_indexes

app = FastAPI(
    title="EMOWELL - Emotion Recognition & Mental Health Support",
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
    print("Starting EMOWELL Backend...")
    print("=" * 80)

    await connect_to_mongo()
    await ensure_user_indexes()
    await seed_demo_data()

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
    await close_mongo_connection()


app.include_router(auth_routes.router)
app.include_router(admin_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(emotion.router)
app.include_router(assistant.router)
app.include_router(health.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "EMOWELL",
        "description": "Emotion Recognition & Mental Health Support System",
        "version": "1.0.0",
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=HOST, port=PORT, reload=DEBUG)
