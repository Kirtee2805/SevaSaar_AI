import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings, PROJECT_ROOT
from app.database.connection import engine, Base, SessionLocal
from app.database.seed_data import seed_initial_patients

from app.api.language import router as language_router
from app.api.generate_summary import router as summary_router
from app.api.patients import router as patients_router
from app.api.doctor import router as doctor_router
from app.api.receptionist import router as receptionist_router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sevasaar-backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite schema & seed data
    logger.info("Initializing SQLite database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_patients(db)
        logger.info("Database initialized and verified.")
    finally:
        db.close()
    yield
    logger.info("Shutting down SevaSaar AI Backend...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(language_router)
app.include_router(summary_router)
app.include_router(patients_router)
app.include_router(doctor_router)
app.include_router(receptionist_router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

# Mount frontend static directory if exists
frontend_dir = PROJECT_ROOT / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")

