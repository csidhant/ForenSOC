"""
Configuration management for ForenSOC application.
Handles environment variables and application settings.
Supports both local SQLite (dev) and PostgreSQL (production).
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "ForenSOC"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_STR: str = "/api"

    # Database
    # For local dev: sqlite:///./forensoc.db
    # For production: postgresql://user:pass@host:5432/dbname
    DATABASE_URL: str = "sqlite:///./forensoc.db"
    DATABASE_ECHO: bool = False

    # Security
    SECRET_KEY: str = "change-this-in-production-use-a-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS — set ALLOWED_ORIGINS_STR as a comma-separated list in env
    # Example: "https://forensoc.vercel.app,https://myapp.netlify.app"
    ALLOWED_ORIGINS_STR: str = ""

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """Build full CORS allowlist from env + always-allowed local origins."""
        base = [
            "http://localhost",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
        ]
        if self.ALLOWED_ORIGINS_STR:
            extra = [o.strip() for o in self.ALLOWED_ORIGINS_STR.split(",") if o.strip()]
            base.extend(extra)
        return base

    # File uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 500 * 1024 * 1024  # 500 MB (reduced for cloud)

    # Forensics tools paths (cloud platforms won't have these)
    VOLATILITY_PATH: str = "vol"
    ZEEK_PATH: str = "zeek"
    YARA_PATH: str = "yara"

    # Detection thresholds
    SSH_BRUTE_FORCE_THRESHOLD: int = 5
    SSH_BRUTE_FORCE_TIMEFRAME: int = 120
    PORT_SCAN_THRESHOLD: int = 20
    PORT_SCAN_TIMEFRAME: int = 120
    RANSOMWARE_FILE_THRESHOLD: int = 30
    RANSOMWARE_TIME_WINDOW: int = 60
    DATA_EXFILTRATION_THRESHOLD: int = 1024 * 1024 * 1024  # 1GB

    # Default admin credentials (CHANGE IN PRODUCTION!)
    ADMIN_USERNAME: str = "admin"
    ADMIN_EMAIL: str = "admin@forensoc.local"
    ADMIN_PASSWORD: str = "admin"
    DEFAULT_USER_ROLE: str = "viewer"

    # Celery / Redis (async forensics - optional)
    REDIS_URL: str = "redis://127.0.0.1:6379/0"

    # Slack webhook for critical alert notifications (optional)
    SLACK_WEBHOOK_URL: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get application settings (cached)."""
    return Settings()
