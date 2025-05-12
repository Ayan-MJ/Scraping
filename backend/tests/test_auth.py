import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, ANY
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

@pytest.fixture
def mock_user():
    """Fixture to create a consistent mock user for authentication tests"""
    mock_user_data = MagicMock()
    mock_user_data.id = SAMPLE_USER["id"]
    mock_user_data.email = SAMPLE_USER["email"]
    mock_user_data.app_metadata = SAMPLE_USER["app_metadata"]
    mock_user_data.user_metadata = SAMPLE_USER["user_metadata"]
    mock_user_data.aud = SAMPLE_USER["aud"]
    mock_user_data.role = SAMPLE_USER["role"]
    return mock_user_data

@pytest.fixture
def mock_supabase_auth_response(mock_user):
    """Fixture to create a mock Supabase authentication response"""
    mock_response = MagicMock()
    mock_response.user = mock_user
    return mock_response

@pytest.fixture
def mock_supabase_client(mock_supabase_auth_response):
    """Fixture to create a mock Supabase client with auth methods"""
    mock_client = MagicMock()
    mock_client.auth.get_user.return_value = mock_supabase_auth_response
    return mock_client

def test_health_check_no_auth_required():
    """Test that health check doesn't require authentication"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@patch("app.core.auth.get_supabase_client")
def test_successful_authentication(mock_get_supabase_client_func, mock_supabase_client, mock_user):
    """Test successful API access with valid token"""
    # Configure the mock supabase client
    mock_get_supabase_client_func.return_value = mock_supabase_client

    headers = {"Authorization": "Bearer valid-token"}
    response = client.get("/api/v1/projects/", headers=headers)

    assert response.status_code == 200
    mock_get_supabase_client_func.assert_called_once()
    mock_supabase_client.auth.get_user.assert_called_once_with("valid-token")

@patch("app.core.auth.get_supabase_client")
def test_failed_authentication_invalid_token(mock_get_supabase_client_func, mock_supabase_client):
    """Test API access fails with invalid token"""
    # Configure the mock to raise an exception for invalid token
    mock_supabase_client.auth.get_user.side_effect = Exception("Invalid token")
    mock_get_supabase_client_func.return_value = mock_supabase_client

    headers = {"Authorization": "Bearer invalid-token"}
    response = client.get("/api/v1/projects/", headers=headers)

    assert response.status_code == 401
    assert "Invalid authentication credentials" in response.json()["detail"]
    mock_get_supabase_client_func.assert_called_once()
    mock_supabase_client.auth.get_user.assert_called_once_with("invalid-token")

def test_failed_authentication_no_token():
    """Test API access fails without a token"""
    response = client.get("/api/v1/projects/")
    assert response.status_code in (401, 403)  # FastAPI returns 403 if HTTPBearer fails to get a token

@patch("app.services.project_service.get_projects")
@patch("app.core.auth.get_supabase_client")
def test_user_isolation(mock_get_supabase_client_func, mock_get_projects_service, mock_supabase_client, mock_user):
    """Test that a user can only access their own projects"""
    # Configure the mock supabase client
    mock_get_supabase_client_func.return_value = mock_supabase_client
    
    # Configure the project service mock
    mock_get_projects_service.return_value = []
    
    headers = {"Authorization": "Bearer valid-token"}
    client.get("/api/v1/projects/", headers=headers)

    mock_get_supabase_client_func.assert_called_once()
    mock_supabase_client.auth.get_user.assert_called_once_with("valid-token")
    mock_get_projects_service.assert_called_once_with(mock_user.id)
