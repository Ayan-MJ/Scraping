#!/usr/bin/env python
"""
Test script for the Projects API endpoints.
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
def sample_project():
    """Return a sample project for testing"""
    return {
        "id": 1,
        "name": "Test Project",
        "description": "Test description",
        "user_id": SAMPLE_USER["id"],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

@pytest.fixture
def sample_project_updated(sample_project):
    """Return an updated sample project for testing"""
    return {
        **sample_project,
        "name": "Updated Test Project",
        "description": "Updated description",
        "updated_at": datetime.now().isoformat()
    }

@pytest.fixture
def mock_project_service(sample_project, sample_project_updated):
    """Mock project service functions"""
    with patch("app.services.project_service.get_projects", new_callable=AsyncMock) as mock_get_projects, \
         patch("app.services.project_service.get_project", new_callable=AsyncMock) as mock_get_project, \
         patch("app.services.project_service.create_project", new_callable=AsyncMock) as mock_create_project, \
         patch("app.services.project_service.update_project", new_callable=AsyncMock) as mock_update_project, \
         patch("app.services.project_service.delete_project", new_callable=AsyncMock) as mock_delete_project:
        
        # Set return values
        mock_get_projects.return_value = [sample_project]
        mock_get_project.return_value = sample_project
        mock_create_project.return_value = sample_project
        mock_update_project.return_value = sample_project_updated
        mock_delete_project.return_value = None
        
        # Configure get_project to raise exception for non-existent projects
        async def get_project_side_effect(id, user_id):
            if id == 999:
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail="Project not found")
            return sample_project
        
        mock_get_project.side_effect = get_project_side_effect
        
        yield {
            "get_projects": mock_get_projects,
            "get_project": mock_get_project,
            "create_project": mock_create_project,
            "update_project": mock_update_project,
            "delete_project": mock_delete_project
        }

@patch("app.core.auth.get_supabase_client")
def test_create_project(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_project_service):
    """Test creating a new project"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    project_data = {
        "name": f"Test Project {datetime.now().isoformat()}",
        "description": "This is a test project created from the API test script"
    }
    
    response = client.post("/api/v1/projects/", json=project_data, headers=auth_headers)
    print_response(response)

    assert response.status_code == 201
    mock_project_service["create_project"].assert_called_once()

@patch("app.core.auth.get_supabase_client")
def test_get_all_projects(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_project_service):
    """Test getting all projects"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    response = client.get("/api/v1/projects/", headers=auth_headers)
    print_response(response)

    assert response.status_code == 200
    mock_project_service["get_projects"].assert_called_once_with(SAMPLE_USER["id"])

@patch("app.core.auth.get_supabase_client")
def test_get_project(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_project_service):
    """Test getting a specific project"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    response = client.get("/api/v1/projects/1", headers=auth_headers)
    print_response(response)

    assert response.status_code == 200
    mock_project_service["get_project"].assert_called_once_with(1, SAMPLE_USER["id"])

@patch("app.core.auth.get_supabase_client")
def test_get_nonexistent_project(mock_get_supabase_client, mock_supabase_client, auth_headers):
    """Test getting a non-existent project"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    response = client.get("/api/v1/projects/999", headers=auth_headers)
    print_response(response)

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

@patch("app.core.auth.get_supabase_client")
def test_update_project(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_project_service):
    """Test updating a project"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    update_data = {
        "name": "Updated Test Project",
        "description": "This project was updated via the API test script"
    }
    
    response = client.put("/api/v1/projects/1", json=update_data, headers=auth_headers)
    print_response(response)

    assert response.status_code == 200
    mock_project_service["update_project"].assert_called_once_with(1, ANY, SAMPLE_USER["id"])

@patch("app.core.auth.get_supabase_client")
def test_delete_project(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_project_service):
    """Test deleting a project"""
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    response = client.delete("/api/v1/projects/1", headers=auth_headers)
    print_response(response)

    assert response.status_code == 204
    mock_project_service["delete_project"].assert_called_once_with(1, SAMPLE_USER["id"])

@patch("app.core.auth.get_supabase_client")
def test_project_api_workflow(mock_get_supabase_client, mock_supabase_client, auth_headers, mock_project_service):
    """
    Test the complete project API workflow:
    - Create a project
    - Get all projects
    - Get a specific project
    - Update a project
    - Delete a project
    """
    # Configure the mock supabase client
    mock_get_supabase_client.return_value = mock_supabase_client
    
    # Create a project
    create_response = client.post("/api/v1/projects/", json={
        "name": "Test Project",
        "description": "Test description"
    }, headers=auth_headers)
    assert create_response.status_code == 201
    project_id = create_response.json()["id"]
    
    # Get all projects
    get_all_response = client.get("/api/v1/projects/", headers=auth_headers)
    assert get_all_response.status_code == 200
    
    # Get a specific project
    get_response = client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert get_response.status_code == 200
    
    # Update a project
    update_response = client.put(f"/api/v1/projects/{project_id}", json={
        "name": "Updated Test Project",
        "description": "Updated description"
    }, headers=auth_headers)
    assert update_response.status_code == 200
    
    # Delete a project
    delete_response = client.delete(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert delete_response.status_code == 204
