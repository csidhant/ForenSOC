"""
Configuration management for ForenSOC application.
Handles environment variables and application settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "ForenSOC"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "sqlite:///./test.db"  # Default SQLite for MVP
    DATABASE_ECHO: bool = False
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost",
        "http://localhost:8000",
        "http://localhost:8501",  # Streamlit
        "http://localhost:3000",  # React frontend
    ]
    
    # File uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024 * 1024  # 5GB
    
    # Forensics tools paths
    VOLATILITY_PATH: str = "vol"  # Assumes vol in PATH
    ZEEK_PATH: str = "zeek"
    YARA_PATH: str = "yara"
    
    # Detection
    SSH_BRUTE_FORCE_THRESHOLD: int = 5
    SSH_BRUTE_FORCE_TIMEFRAME: int = 120  # seconds
    PORT_SCAN_THRESHOLD: int = 20
    PORT_SCAN_TIMEFRAME: int = 120
    RANSOMWARE_FILE_THRESHOLD: int = 30
    RANSOMWARE_TIME_WINDOW: int = 60
    DATA_EXFILTRATION_THRESHOLD: int = 1024 * 1024 * 1024  # 1GB

    # Initial admin credentials for development
    ADMIN_USERNAME: str = "admin"
    ADMIN_EMAIL: str = "admin@forensoc.local"
    ADMIN_PASSWORD: str = "admin123"
    DEFAULT_USER_ROLE: str = "viewer"
    
    class Config:
        """Configuration settings."""
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get application settings (cached)."""
    return Settings()
