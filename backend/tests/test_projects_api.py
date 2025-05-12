#!/usr/bin/env python
"""
Test script for the Projects API endpoints.
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
def test_create_project(mock_get_supabase_client_func):
    """Test creating a new project"""
    print("\n1. Testing CREATE project...")
    
    # Configure the mock supabase client
    mock_get_supabase_client_func.return_value = mock_supabase_client
    
    project_data = {
        "name": f"Test Project {datetime.now().isoformat()}",
        "description": "This is a test project created from the API test script"
    }

    # Add auth header
    headers = {"Authorization": "Bearer faketoken"}
    
    response = client.post("/api/v1/projects/", json=project_data, headers=headers)
    print_response(response)

    assert response.status_code == 201
    print("✅ Create project test PASSED")
    return response.json()["id"]

@patch("app.core.auth.get_supabase_client")
def test_get_all_projects(mock_get_supabase_client_func):
    """Test getting all projects"""
    print("\n2. Testing GET ALL projects...")
    
    # Configure the mock supabase client
    mock_get_supabase_client_func.return_value = mock_supabase_client
    
    # Add auth header
    headers = {"Authorization": "Bearer faketoken"}
    
    response = client.get("/api/v1/projects/", headers=headers)
    print_response(response)

    assert response.status_code == 200
    print("✅ Get all projects test PASSED")
    return True

@patch("app.core.auth.get_supabase_client")
@patch("app.services.project_service.get_project")
def test_get_project(mock_get_project, mock_get_supabase_client_func):
    """Test getting a specific project"""
    print("\n3. Testing GET project...")
    
    # Create a mock project to return
    mock_project = {
        "id": 1,
        "name": "Test Project",
        "description": "Test description",
        "user_id": SAMPLE_USER["id"],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    mock_get_project.return_value = mock_project
    
    # Configure the mock supabase client
    mock_get_supabase_client_func.return_value = mock_supabase_client
    
    # Add auth header
    headers = {"Authorization": "Bearer faketoken"}
    
    response = client.get(f"/api/v1/projects/1", headers=headers)
    print_response(response)

    assert response.status_code == 200
    mock_get_project.assert_called_once_with(1, SAMPLE_USER["id"])
    print("✅ Get project test PASSED")
    return True

@patch("app.core.auth.get_supabase_client")
@patch("app.services.project_service.get_project")
@patch("app.services.project_service.update_project")
def test_update_project(mock_update_project, mock_get_project, mock_get_supabase_client_func):
    """Test updating a project"""
    print("\n4. Testing UPDATE project...")
    
    # Mock project to update
    mock_project = {
        "id": 1,
        "name": "Test Project",
        "description": "Test description",
        "user_id": SAMPLE_USER["id"],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # Updated project to return
    mock_updated_project = {
        **mock_project,
        "name": "Updated Test Project",
        "description": "Updated description",
        "updated_at": datetime.now().isoformat()
    }
    
    mock_get_project.return_value = mock_project
    mock_update_project.return_value = mock_updated_project
    
    # Configure the mock supabase client
    mock_get_supabase_client_func.return_value = mock_supabase_client
    
    update_data = {
        "name": "Updated Test Project",
        "description": "This project was updated via the API test script"
    }

    # Add auth header
    headers = {"Authorization": "Bearer faketoken"}
    
    response = client.put(f"/api/v1/projects/1", json=update_data, headers=headers)
    print_response(response)

    assert response.status_code == 200
    mock_get_project.assert_called_once_with(1, SAMPLE_USER["id"])
    print("✅ Update project test PASSED")
    return True

@patch("app.core.auth.get_supabase_client")
@patch("app.services.project_service.get_project")
@patch("app.services.project_service.delete_project")
def test_delete_project(mock_delete_project, mock_get_project, mock_get_supabase_client_func):
    """Test deleting a project"""
    print("\n5. Testing DELETE project...")
    
    # Mock project to delete
    mock_project = {
        "id": 1,
        "name": "Test Project",
        "description": "Test description",
        "user_id": SAMPLE_USER["id"],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    mock_get_project.return_value = mock_project
    mock_delete_project.return_value = None
    
    # Configure the mock supabase client
    mock_get_supabase_client_func.return_value = mock_supabase_client
    
    # Add auth header
    headers = {"Authorization": "Bearer faketoken"}
    
    response = client.delete(f"/api/v1/projects/1", headers=headers)
    print_response(response)

    assert response.status_code == 204
    mock_get_project.assert_called_once_with(1, SAMPLE_USER["id"])
    mock_delete_project.assert_called_once_with(1, SAMPLE_USER["id"])
    print("✅ Delete project test PASSED")

    # For verification after deletion, mock an empty response
    mock_get_project.side_effect = Exception("Project not found")
    
    # Verify deletion
    get_response = client.get(f"/api/v1/projects/1", headers=headers)
    assert get_response.status_code == 404
    print("✅ Verified deletion - project no longer exists")
    return True

# Mock project service to avoid actual database calls
@pytest.fixture
def mock_project_service():
    with patch("app.services.project_service.get_projects") as mock_get_projects, \
         patch("app.services.project_service.get_project") as mock_get_project, \
         patch("app.services.project_service.create_project") as mock_create_project, \
         patch("app.services.project_service.update_project") as mock_update_project, \
         patch("app.services.project_service.delete_project") as mock_delete_project:
        
        # Mock create_project to return a project with an ID
        mock_create_project.return_value = {
            "id": 1,
            "name": "Test Project",
            "description": "Test description",
            "user_id": SAMPLE_USER["id"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Mock get_projects to return a list with the test project
        mock_get_projects.return_value = [mock_create_project.return_value]
        
        # Mock get_project to return the test project
        mock_get_project.return_value = mock_create_project.return_value
        
        # Mock update_project to return the updated project
        mock_update_project.return_value = {
            **mock_create_project.return_value,
            "name": "Updated Test Project",
            "description": "Updated description",
            "updated_at": datetime.now().isoformat()
        }
        
        # Mock delete_project to return None
        mock_delete_project.return_value = None
        
        yield {
            "get_projects": mock_get_projects,
            "get_project": mock_get_project,
            "create_project": mock_create_project,
            "update_project": mock_update_project,
            "delete_project": mock_delete_project
        }

@pytest.mark.usefixtures("mock_project_service")
def test_project_api_workflow():
    """
    Test the complete project API workflow:
    - Create a project
    - Get all projects
    - Get a specific project
    - Update a project
    - Delete a project
    """
    with patch("app.core.auth.get_supabase_client", return_value=mock_supabase_client):
        # Set up auth headers
        headers = {"Authorization": "Bearer faketoken"}
        
        # Create a project
        create_response = client.post("/api/v1/projects/", json={
            "name": "Test Project",
            "description": "Test description"
        }, headers=headers)
        assert create_response.status_code == 201
        project_id = create_response.json()["id"]
        
        # Get all projects
        get_all_response = client.get("/api/v1/projects/", headers=headers)
        assert get_all_response.status_code == 200
        
        # Get a specific project
        get_response = client.get(f"/api/v1/projects/{project_id}", headers=headers)
        assert get_response.status_code == 200
        
        # Update a project
        update_response = client.put(f"/api/v1/projects/{project_id}", json={
            "name": "Updated Test Project",
            "description": "Updated description"
        }, headers=headers)
        assert update_response.status_code == 200
        
        # Delete a project
        delete_response = client.delete(f"/api/v1/projects/{project_id}", headers=headers)
        assert delete_response.status_code == 204
