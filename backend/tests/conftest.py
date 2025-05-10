import os
import sys
import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient

# Add the app directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables from .env.test BEFORE importing app
load_dotenv(".env.test", override=True)

# Ensure required settings are available as env vars
os.environ["USE_INMEM_DB"] = "true"
os.environ["SUPABASE_URL"] = os.environ.get("SUPABASE_URL", "https://example.com")
os.environ["SUPABASE_KEY"] = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test")
os.environ["SUPABASE_SERVICE_KEY"] = os.environ.get("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service")

# Now import the app
from app.main import app

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Set up the test environment with in-memory database."""
    # Additional test setup can go here
    yield
    # Clean up after tests (if needed)
    pass

@pytest.fixture
def client():
    """Test client for FastAPI application."""
    return TestClient(app)
