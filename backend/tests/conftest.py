import os
import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Set up the test environment with in-memory database."""
    # Load environment variables from .env.test
    load_dotenv(".env.test", override=True)

    # Ensure the in-memory database is used for tests
    os.environ["USE_INMEM_DB"] = "true"

    # Yield to allow tests to run
    yield

    # Clean up after tests (if needed)
    pass

@pytest.fixture
def client():
    """Test client for FastAPI application."""
    return TestClient(app)
