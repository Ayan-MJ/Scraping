from pydantic_settings import BaseSettings
from typing import Optional, List, Any
import os
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Scraping Wizard"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Process BACKEND_CORS_ORIGINS from string to list
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Supabase settings
    SUPABASE_URL: str
    SUPABASE_KEY: str  # Public client key (anon key)
    SUPABASE_SERVICE_KEY: str  # Service role key for admin operations
    
    # Sentry settings
    SENTRY_DSN: Optional[str] = None
    
    # Database settings
    USE_INMEM_DB: bool = False
    
    # Redis settings
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://redis:6379/0"
    
    # Celery settings
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"
    
    # CORS allowed origins
    CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str) -> Any:
            if field_name == "BACKEND_CORS_ORIGINS" and raw_val:
                try:
                    return json.loads(raw_val)
                except json.JSONDecodeError:
                    return [item.strip() for item in raw_val.split(",")]
            return raw_val

# Create settings instance
settings = Settings()

# Export settings as a module variable
__all__ = ["settings"] 