import os
import sys
import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient

# Add the app directory to the Python path
app_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, app_path)

# Load environment variables from .env.test BEFORE importing app
env_file = ".env.test"
if os.path.exists(env_file):
    load_dotenv(env_file, override=True)
    print(f"Loaded test environment from {env_file}")
else:
    print(f"Warning: {env_file} not found. Using default environment variables.")

# Ensure required settings are available as env vars
os.environ["USE_INMEM_DB"] = os.environ.get("USE_INMEM_DB", "true")
os.environ["ENVIRONMENT"] = os.environ.get("ENVIRONMENT", "test")
os.environ["SUPABASE_URL"] = os.environ.get("SUPABASE_URL", "https://example.com")
os.environ["SUPABASE_KEY"] = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test")
os.environ["SUPABASE_SERVICE_KEY"] = os.environ.get("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service")
os.environ["REDIS_HOST"] = os.environ.get("REDIS_HOST", "localhost")
os.environ["REDIS_PORT"] = os.environ.get("REDIS_PORT", "6379")
os.environ["CELERY_BROKER_URL"] = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
os.environ["CELERY_RESULT_BACKEND"] = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Set null value for Sentry during testing unless explicitly provided
if "SENTRY_DSN" not in os.environ:
    os.environ["SENTRY_DSN"] = ""

# Now import the app
try:
    from app.main import app
    print("Successfully imported FastAPI application")
except ImportError as e:
    print(f"Failed to import app: {e}")
    print("Current Python path:", sys.path)
    print("Current environment variables:", {k: v for k, v in os.environ.items() if not k.startswith('_')})
    raise

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Set up the test environment with in-memory database."""
    # Verify test environment is properly set
    assert os.environ.get("ENVIRONMENT") == "test", "Tests must run in test environment"
    assert os.environ.get("USE_INMEM_DB") == "true", "Tests should use in-memory database"
    
    # Additional test setup can go here
    print("Test environment set up with in-memory database")
    yield
    # Clean up after tests (if needed)
    print("Test environment cleanup completed")

@pytest.fixture
def client():
    """Test client for FastAPI application."""
    with TestClient(app) as test_client:
        yield test_client
