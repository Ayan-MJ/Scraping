import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.core.auth import get_current_user

# Test client for FastAPI
client = TestClient(app)

# Sample user data
SAMPLE_USER = {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "test@example.com",
    "app_metadata": {
        "provider": "email",
        "providers": ["email"]
    },
    "user_metadata": {
        "name": "Test User"
    },
    "aud": "authenticated",
    "confirmation_sent_at": "2023-01-01T00:00:00Z",
    "confirmed_at": "2023-01-01T00:01:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:01:00Z",
    "last_sign_in_at": "2023-01-01T00:01:00Z",
    "role": "authenticated"
}

# Mock authenticated user for testing
async def mock_get_current_user_authenticated():
    """Mock the get_current_user function to return a valid user"""
    return MagicMock(id=SAMPLE_USER["id"], email=SAMPLE_USER["email"])

# Mock unauthenticated user for testing
async def mock_get_current_user_unauthenticated():
    """Mock the get_current_user function to raise an exception"""
    from fastapi import HTTPException, status
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials"
    )

def test_health_check_no_auth_required():
    """Test that health check doesn't require authentication"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@patch("app.routers.projects.get_current_user", mock_get_current_user_authenticated)
def test_successful_authentication():
    """Test successful API access with valid token"""
    # When the auth dependency is mocked to return a valid user
    response = client.get("/api/v1/projects/")

    # Then the request should succeed
    assert response.status_code == 200

@patch("app.routers.projects.get_current_user", mock_get_current_user_unauthenticated)
def test_failed_authentication_invalid_token():
    """Test API access fails with invalid token"""
    # When the auth dependency is mocked to fail authentication
    response = client.get("/api/v1/projects/")

    # Then the request should fail with 401
    assert response.status_code == 401
    assert "Invalid authentication credentials" in response.json()["detail"]

def test_failed_authentication_no_token():
    """Test API access fails without a token"""
    # When no token is provided
    response = client.get("/api/v1/projects/")

    # Then the request should fail with 401 or 403
    assert response.status_code in (401, 403)

@patch("app.services.project_service.get_projects")
@patch("app.routers.projects.get_current_user", mock_get_current_user_authenticated)
def test_user_isolation(mock_get_projects):
    """Test that a user can only access their own projects"""
    # Given the service will return some projects
    mock_get_projects.return_value = []

    # When the user requests their projects
    client.get("/api/v1/projects/")

    # Then the service should be called with the correct user_id
    mock_get_projects.assert_called_once_with(SAMPLE_USER["id"])
