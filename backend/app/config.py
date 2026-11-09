import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directories
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATABASE_DIR = PROJECT_ROOT / "database"
DATABASE_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_FILE = DATABASE_DIR / "dev.db"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    APP_NAME: str = "SevaSaar AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = f"sqlite:///{DATABASE_FILE.as_posix()}"

    # Google GenAI / Gemma Configuration
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", os.getenv("GEMMA_API_KEY", ""))
    GEMMA_MODEL_NAME: str = os.getenv("GEMMA_MODEL_NAME", "gemini-2.5-flash")

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
