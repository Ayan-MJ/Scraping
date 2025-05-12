#!/usr/bin/env python
"""
Test script for the Runs API endpoints.
"""
import json
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from datetime import datetime
from app.core.auth import get_supabase_client

# Test client for FastAPI
client = TestClient(app)

# Sample user data
SAMPLE_USER = {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "test@example.com"
}

# Mock user for authentication
mock_user = MagicMock()
mock_user.id = SAMPLE_USER["id"]
mock_user.email = SAMPLE_USER["email"]

# Prepare mock Supabase get_user() response
mock_supabase_response = MagicMock()
mock_supabase_response.user = mock_user

# Mock Supabase client
mock_supabase_client = MagicMock()
mock_supabase_client.auth.get_user.return_value = mock_supabase_response

# Reset function for mocks before each test
@pytest.fixture(autouse=True)
def reset_mocks():
    # Create a fresh mock for each test
    global mock_supabase_client
    mock_supabase_client = MagicMock()
    mock_supabase_client.auth.get_user.return_value = mock_supabase_response
    yield

def print_response(response):
    """Print response details for debugging"""
    print(f"Status Code: {response.status_code}")
    try:
        content = response.json() if hasattr(response, "json") else response
        print(f"Response: {json.dumps(content, indent=2)}")
    except:
        print(f"Response Text: {response.text}")
    print("-" * 50)

@patch("app.core.auth.get_supabase_client")
@patch("app.services.run_service.get_runs_for_project")
def test_get_runs_for_project(mock_get_runs, mock_get_supabase_client_func):
    """Test getting all runs for a project"""
    print("\n1. Testing GET runs for project...")
    
    # Configure mocks
    mock_get_supabase_client_func.return_value = mock_supabase_client
    mock_get_runs.return_value = [
        {
            "id": 1,
            "project_id": 1,
            "status": "completed",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ]
    
    # Add auth header
    headers = {"Authorization": "Bearer faketoken"}
    
    response = client.get("/api/v1/projects/1/runs", headers=headers)
    print_response(response)

    assert response.status_code == 200
    mock_get_runs.assert_called_once_with(1, SAMPLE_USER["id"])
    print("✅ Get runs for project test PASSED")
    return True

@patch("app.core.auth.get_supabase_client")
@patch("app.services.run_service.enqueue_run")
def test_enqueue_run(mock_enqueue_run, mock_get_supabase_client_func):
    """Test enqueueing a new run"""
    print("\n2. Testing ENQUEUE run for project...")
    
    # Configure mocks
    mock_get_supabase_client_func.return_value = mock_supabase_client
    mock_enqueue_run.return_value = {
        "id": 1,
        "project_id": 1,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # Add auth header
    headers = {"Authorization": "Bearer faketoken"}
    config = {"selector": ".content", "wait_for": ".loaded"}
    
    response = client.post(
        "/api/v1/projects/1/runs",
        params={"url": "https://example.com"},
        json={"config": config},
        headers=headers
    )
    print_response(response)

    assert response.status_code == 201
    mock_enqueue_run.assert_called_once()
    print("✅ Enqueue run test PASSED")
    return response.json()["id"]

@patch("app.core.auth.get_supabase_client")
@patch("app.services.run_service.get_run")
def test_get_run(mock_get_run, mock_get_supabase_client_func):
    """Test getting a specific run"""
    print("\n3. Testing GET run...")
    
    # Configure mocks
    mock_get_supabase_client_func.return_value = mock_supabase_client
    mock_get_run.return_value = {
        "id": 1,
        "project_id": 1,
        "status": "completed",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # Add auth header
    headers = {"Authorization": "Bearer faketoken"}
    
    response = client.get("/api/v1/runs/1", headers=headers)
    print_response(response)

    assert response.status_code == 200
    mock_get_run.assert_called_once_with(1, SAMPLE_USER["id"])
    print("✅ Get run test PASSED")
    return True

@patch("app.core.auth.get_supabase_client")
@patch("app.services.run_service.update_run")
def test_update_run(mock_update_run, mock_get_supabase_client_func):
    """Test updating a run"""
    print("\n4. Testing UPDATE run...")
    
    # Configure mocks
    mock_get_supabase_client_func.return_value = mock_supabase_client
    mock_update_run.return_value = {
        "id": 1,
        "project_id": 1,
        "status": "cancelled",
        "error": "Test cancellation via API",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # Add auth header
    headers = {"Authorization": "Bearer faketoken"}
    update_data = {
        "status": "cancelled",
        "error": "Test cancellation via API"
    }
    
    response = client.put("/api/v1/runs/1", json=update_data, headers=headers)
    print_response(response)

    assert response.status_code == 200
    mock_update_run.assert_called_once_with(1, update_data, SAMPLE_USER["id"])
    print("✅ Update run test PASSED")
    return True

@patch("app.core.auth.get_supabase_client")
@patch("app.services.run_service.delete_run")
def test_delete_run(mock_delete_run, mock_get_supabase_client_func):
    """Test deleting a run"""
    print("\n5. Testing DELETE run...")
    
    # Configure mocks
    mock_get_supabase_client_func.return_value = mock_supabase_client
    mock_delete_run.return_value = None
    
    # Add auth header
    headers = {"Authorization": "Bearer faketoken"}
    
    response = client.delete("/api/v1/runs/1", headers=headers)
    print_response(response)

    assert response.status_code == 204
    mock_delete_run.assert_called_once_with(1, SAMPLE_USER["id"])
    print("✅ Delete run test PASSED")

    # Verify deletion by checking 404 response when trying to get the deleted run
    # We need to make the get_run service raise an exception to simulate a 404
    with patch("app.services.run_service.get_run", side_effect=Exception("Run not found")):
        get_response = client.get("/api/v1/runs/1", headers=headers)
        assert get_response.status_code == 404
        print("✅ Verified deletion - run no longer exists")
    
    return True

@pytest.mark.usefixtures("mock_run_service")
def test_run_api_workflow():
    """
    Test the complete run API workflow:
    - Get runs for a project
    - Enqueue a new run
    - Get a specific run
    - Update a run
    - Delete a run
    """
    with patch("app.core.auth.get_supabase_client", return_value=mock_supabase_client):
        # Set up auth headers
        headers = {"Authorization": "Bearer faketoken"}
        
        # Get runs for a project
        get_runs_response = client.get("/api/v1/projects/1/runs", headers=headers)
        assert get_runs_response.status_code == 200
        
        # Enqueue a new run
        enqueue_response = client.post(
            "/api/v1/projects/1/runs",
            params={"url": "https://example.com"},
            json={"config": {"selector": ".content"}},
            headers=headers
        )
        assert enqueue_response.status_code == 201
        run_id = enqueue_response.json()["id"]
        
        # Get a specific run
        get_response = client.get(f"/api/v1/runs/{run_id}", headers=headers)
        assert get_response.status_code == 200
        
        # Update a run
        update_response = client.put(
            f"/api/v1/runs/{run_id}", 
            json={"status": "cancelled"}, 
            headers=headers
        )
        assert update_response.status_code == 200
        
        # Delete a run
        delete_response = client.delete(f"/api/v1/runs/{run_id}", headers=headers)
        assert delete_response.status_code == 204

# Mock run service to avoid actual database calls
@pytest.fixture
def mock_run_service():
    with patch("app.services.run_service.get_runs_for_project") as mock_get_runs, \
         patch("app.services.run_service.get_run") as mock_get_run, \
         patch("app.services.run_service.enqueue_run") as mock_enqueue_run, \
         patch("app.services.run_service.update_run") as mock_update_run, \
         patch("app.services.run_service.delete_run") as mock_delete_run:
        
        mock_run = {
            "id": 1,
            "project_id": 1,
            "status": "completed",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Mock get_runs_for_project to return a list with a test run
        mock_get_runs.return_value = [mock_run]
        
        # Mock get_run to return the test run
        mock_get_run.return_value = mock_run
        
        # Mock enqueue_run to return a new run with pending status
        mock_enqueue_run.return_value = {
            **mock_run,
            "status": "pending"
        }
        
        # Mock update_run to return the updated run
        mock_update_run.return_value = {
            **mock_run,
            "status": "cancelled",
            "updated_at": datetime.now().isoformat()
        }
        
        # Mock delete_run to return None
        mock_delete_run.return_value = None
        
        yield {
            "get_runs_for_project": mock_get_runs,
            "get_run": mock_get_run,
            "enqueue_run": mock_enqueue_run,
            "update_run": mock_update_run,
            "delete_run": mock_delete_run
        }
