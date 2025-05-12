#!/usr/bin/env python
"""
Test script for the Runs API endpoints.
"""
import json
import pytest
from unittest.mock import patch, MagicMock, AsyncMock, ANY
from fastapi.testclient import TestClient
from app.main import app
from datetime import datetime
from uuid import UUID

# Test client for FastAPI
client = TestClient(app)

# Sample user data
SAMPLE_USER = {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "test@example.com"
}

@pytest.fixture
def mock_user():
    """Fixture to create a consistent mock user for authentication tests"""
    mock_user_data = MagicMock()
    mock_user_data.id = SAMPLE_USER["id"]
    mock_user_data.email = SAMPLE_USER["email"]
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

@pytest.fixture
def auth_headers():
    """Return authentication headers for requests"""
    return {"Authorization": "Bearer valid-token"}

def print_response(response):
    """Print response details for debugging"""
    print(f"Status Code: {response.status_code}")
    try:
        content = response.json() if hasattr(response, "json") else response
        print(f"Response: {json.dumps(content, indent=2)}")
    except:
        print(f"Response Text: {response.text}")
    print("-" * 50)

@pytest.fixture
def sample_run():
    """Return a sample run for testing"""
    return {
        "id": 1,
        "project_id": 1,
        "status": "completed",
        "url": "https://example.com",
        "config": {"selector": ".content"},
        "user_id": SAMPLE_USER["id"],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

@pytest.fixture
def sample_run_updated(sample_run):
    """Return an updated sample run for testing"""
    return {
        **sample_run,
        "status": "cancelled",
        "error": "Test cancellation",
        "updated_at": datetime.now().isoformat()
    }

@pytest.fixture
def mock_run_service(sample_run, sample_run_updated):
    """Mock run service functions"""
    with patch("app.services.run_service.get_runs", new_callable=AsyncMock) as mock_get_runs, \
         patch("app.services.run_service.get_run", new_callable=AsyncMock) as mock_get_run, \
         patch("app.services.run_service.enqueue_run", new_callable=AsyncMock) as mock_enqueue_run, \
         patch("app.services.run_service.update_run", new_callable=AsyncMock) as mock_update_run, \
         patch("app.services.run_service.delete_run", new_callable=AsyncMock) as mock_delete_run:
        
        # Set return values
        mock_get_runs.return_value = [sample_run]
        mock_get_run.return_value = sample_run
        mock_enqueue_run.return_value = {**sample_run, "status": "pending"}
        mock_update_run.return_value = sample_run_updated
        mock_delete_run.return_value = None
        
        # Configure get_run to raise exception for non-existent runs
        async def get_run_side_effect(id, user_id):
            if id == 999:
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail="Run not found")
            return sample_run
        
        mock_get_run.side_effect = get_run_side_effect
        
        yield {
            "get_runs": mock_get_runs,
            "get_run": mock_get_run,
            "enqueue_run": mock_enqueue_run,
            "update_run": mock_update_run,
            "delete_run": mock_delete_run
        }

@patch("app.core.auth.get_supabase_client")
def test_get_runs_for_project(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_run_service):
    """Test getting all runs for a project"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    response = client.get("/api/v1/projects/1/runs", headers=auth_headers)
    print_response(response)

    assert response.status_code == 200
    mock_run_service["get_runs"].assert_called_once_with(1)

@patch("app.core.auth.get_supabase_client")
def test_enqueue_run(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_run_service):
    """Test enqueueing a new run"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    config = {"selector": ".content", "wait_for": ".loaded"}
    
    response = client.post(
        "/api/v1/projects/1/runs",
        params={"url": "https://example.com"},
        json={"config": config},
        headers=auth_headers
    )
    print_response(response)

    assert response.status_code == 201
    mock_run_service["enqueue_run"].assert_called_once()

@patch("app.core.auth.get_supabase_client")
def test_get_run(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_run_service):
    """Test getting a specific run"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    response = client.get("/api/v1/runs/1", headers=auth_headers)
    print_response(response)

    assert response.status_code == 200
    mock_run_service["get_run"].assert_called_once_with(1, SAMPLE_USER["id"])

@patch("app.core.auth.get_supabase_client")
def test_get_nonexistent_run(mock_get_supabase_client, mock_supabase_client, auth_headers):
    """Test getting a non-existent run"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    response = client.get("/api/v1/runs/999", headers=auth_headers)
    print_response(response)

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

@patch("app.core.auth.get_supabase_client")
def test_update_run(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_run_service):
    """Test updating a run"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    update_data = {
        "status": "cancelled",
        "error": "Test cancellation via API"
    }
    
    response = client.put("/api/v1/runs/1", json=update_data, headers=auth_headers)
    print_response(response)

    assert response.status_code == 200
    mock_run_service["update_run"].assert_called_once_with(1, ANY, SAMPLE_USER["id"])

@patch("app.core.auth.get_supabase_client")
def test_delete_run(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_run_service):
    """Test deleting a run"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    response = client.delete("/api/v1/runs/1", headers=auth_headers)
    print_response(response)

    assert response.status_code == 204
    mock_run_service["delete_run"].assert_called_once_with(1, SAMPLE_USER["id"])

@patch("app.core.auth.get_supabase_client")
def test_run_api_workflow(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_run_service):
    """
    Test the complete run API workflow:
    - Create a run by enqueueing
    - Get all runs for a project
    - Get a specific run
    - Update a run
    - Delete a run
    """
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    # Enqueue a run
    config = {"selector": ".content"}
    enqueue_response = client.post(
        "/api/v1/projects/1/runs",
        params={"url": "https://example.com"},
        json={"config": config},
        headers=auth_headers
    )
    assert enqueue_response.status_code == 201
    run_id = enqueue_response.json()["id"]
    
    # Get all runs for the project
    get_all_response = client.get("/api/v1/projects/1/runs", headers=auth_headers)
    assert get_all_response.status_code == 200
    
    # Get a specific run
    get_response = client.get(f"/api/v1/runs/{run_id}", headers=auth_headers)
    assert get_response.status_code == 200
    
    # Update a run
    update_response = client.put(f"/api/v1/runs/{run_id}", json={
        "status": "cancelled",
        "error": "Test cancellation"
    }, headers=auth_headers)
    assert update_response.status_code == 200
    
    # Delete a run
    delete_response = client.delete(f"/api/v1/runs/{run_id}", headers=auth_headers)
    assert delete_response.status_code == 204
