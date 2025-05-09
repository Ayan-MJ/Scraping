from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Scraping Wizard"
    
    # Supabase settings
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # Redis settings
    REDIS_URL: str = "redis://redis:6379/0"
    
    # Celery settings
    CELERY_BROKER_URL: str = REDIS_URL
    CELERY_RESULT_BACKEND: str = REDIS_URL
    
    # CORS allowed origins
    CORS_ORIGINS: list[str] = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Export settings as a module variable
__all__ = ["settings"] 