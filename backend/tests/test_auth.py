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

# Prepare a mock user object
mock_user_data = MagicMock()
mock_user_data.id = SAMPLE_USER["id"]
mock_user_data.email = SAMPLE_USER["email"]
mock_user_data.app_metadata = SAMPLE_USER["app_metadata"]
mock_user_data.user_metadata = SAMPLE_USER["user_metadata"]
mock_user_data.aud = SAMPLE_USER["aud"]
mock_user_data.role = SAMPLE_USER["role"]

# Prepare mock Supabase get_user() response
mock_supabase_get_user_response_success = MagicMock()
mock_supabase_get_user_response_success.user = mock_user_data

# Mock Supabase client
mock_supabase_client = MagicMock()

# Exception for auth failure
class MockSupabaseAuthFailureException(Exception):
    pass

def test_health_check_no_auth_required():
    """Test that health check doesn't require authentication"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

# Patch the get_supabase_client function in the auth module
@patch("app.core.auth.get_supabase_client")
def test_successful_authentication(mock_get_supabase_client_func):
    """Test successful API access with valid token"""
    # Configure the mock supabase client that get_supabase_client will return
    mock_supabase_client.auth.get_user.return_value = mock_supabase_get_user_response_success
    mock_get_supabase_client_func.return_value = mock_supabase_client

    headers = {"Authorization": "Bearer faketoken"}
    response = client.get("/api/v1/projects/", headers=headers)

    assert response.status_code == 200
    mock_get_supabase_client_func.assert_called_once()
    mock_supabase_client.auth.get_user.assert_called_once_with("faketoken")

@patch("app.core.auth.get_supabase_client")
def test_failed_authentication_invalid_token(mock_get_supabase_client_func):
    """Test API access fails with invalid token"""
    # Configure the mock supabase client to raise an exception
    mock_supabase_client.auth.get_user.side_effect = MockSupabaseAuthFailureException("Invalid token")
    mock_get_supabase_client_func.return_value = mock_supabase_client

    headers = {"Authorization": "Bearer invalidtoken"}
    response = client.get("/api/v1/projects/", headers=headers)

    assert response.status_code == 401
    assert "Invalid authentication credentials: Invalid token" in response.json()["detail"]
    mock_get_supabase_client_func.assert_called_once()
    mock_supabase_client.auth.get_user.assert_called_once_with("invalidtoken")
    # Reset side effect for other tests if client is reused globally (good practice)
    mock_supabase_client.auth.get_user.side_effect = None

def test_failed_authentication_no_token():
    """Test API access fails without a token"""
    response = client.get("/api/v1/projects/")
    assert response.status_code in (401, 403) # FastAPI returns 403 if HTTPBearer fails to get a token

@patch("app.services.project_service.get_projects")
@patch("app.core.auth.get_supabase_client")
def test_user_isolation(mock_get_supabase_client_func, mock_get_projects_service): # Order matters for decorators
    """Test that a user can only access their own projects"""
    # Configure the mock supabase client for successful auth
    mock_supabase_client.auth.get_user.return_value = mock_supabase_get_user_response_success
    mock_get_supabase_client_func.return_value = mock_supabase_client
    
    mock_get_projects_service.return_value = []
    headers = {"Authorization": "Bearer faketoken"}

    client.get("/api/v1/projects/", headers=headers)

    mock_get_supabase_client_func.assert_called_once()
    mock_supabase_client.auth.get_user.assert_called_once_with("faketoken")
    mock_get_projects_service.assert_called_once_with(mock_user_data.id)
    # Reset side effect for other tests
    mock_supabase_client.auth.get_user.side_effect = None
