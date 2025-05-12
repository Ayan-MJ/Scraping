import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

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

# Prepare a mock user object (can reuse parts of the old mock)
mock_user = MagicMock()
mock_user.id = SAMPLE_USER["id"]
mock_user.email = SAMPLE_USER["email"]
mock_user.app_metadata = SAMPLE_USER["app_metadata"]
mock_user.user_metadata = SAMPLE_USER["user_metadata"]
mock_user.aud = SAMPLE_USER["aud"]
mock_user.role = SAMPLE_USER["role"]

# Prepare mock Supabase responses
mock_supabase_auth_response_success = MagicMock()
mock_supabase_auth_response_success.user = mock_user

mock_supabase_auth_response_failure = MagicMock()
mock_supabase_auth_response_failure.user = None


# Mock unauthenticated user for testing - Now raises exception within the patch
class MockSupabaseAuthFailureException(Exception):
    pass

def test_health_check_no_auth_required():
    """Test that health check doesn't require authentication"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

# Patch the actual Supabase call within the auth dependency
@patch("app.core.auth.supabase.auth.get_user", return_value=mock_supabase_auth_response_success)
def test_successful_authentication(mock_get_user_supabase): # Renamed mock argument
    """Test successful API access with valid token"""
    # Provide a dummy Authorization header, required by HTTPBearer
    headers = {"Authorization": "Bearer faketoken"}
    response = client.get("/api/v1/projects/", headers=headers)

    # Then the request should succeed
    assert response.status_code == 200
    # Verify the Supabase client was called
    mock_get_user_supabase.assert_called_once_with("faketoken")


# Patch the Supabase call to simulate an invalid token (e.g., by raising an error)
@patch("app.core.auth.supabase.auth.get_user", side_effect=MockSupabaseAuthFailureException("Invalid token"))
def test_failed_authentication_invalid_token(mock_get_user_supabase):
    """Test API access fails with invalid token"""
    headers = {"Authorization": "Bearer invalidtoken"}
    response = client.get("/api/v1/projects/", headers=headers)

    # Then the request should fail with 401
    assert response.status_code == 401
    # Check the specific detail message format from auth.py
    assert "Invalid authentication credentials: Invalid token" in response.json()["detail"]
    mock_get_user_supabase.assert_called_once_with("invalidtoken")

def test_failed_authentication_no_token():
    """Test API access fails without a token"""
    # When no token is provided
    response = client.get("/api/v1/projects/")

    # Then the request should fail with 401 or 403
    assert response.status_code in (401, 403)

# Patch the Supabase call for user isolation test
@patch("app.services.project_service.get_projects")
@patch("app.core.auth.supabase.auth.get_user", return_value=mock_supabase_auth_response_success)
def test_user_isolation(mock_get_user_supabase, mock_get_projects): # Order matters for decorators
    """Test that a user can only access their own projects"""
    mock_get_projects.return_value = []
    headers = {"Authorization": "Bearer faketoken"}

    client.get("/api/v1/projects/", headers=headers)

    mock_get_user_supabase.assert_called_once_with("faketoken")
    # Ensure the project service is called with the ID from the *mocked* user
    mock_get_projects.assert_called_once_with(mock_user.id)
