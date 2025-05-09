from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize the Supabase client
def get_supabase_client() -> Client:
    """
    Creates and returns a Supabase client using settings from the config.
    """
    try:
        supabase: Client = create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_KEY
        )
        return supabase
    except Exception as e:
        logger.error(f"Error initializing Supabase client: {e}")
        raise

# Create a singleton instance
supabase = get_supabase_client() 