#!/usr/bin/env python
"""
Test script for the Projects API endpoints.
"""
import requests
import json
import sys
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:9000/api/v1"  # Update if your port differs
PROJECTS_URL = f"{API_BASE_URL}/projects"


def print_response(response):
    """Print response details for debugging"""
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response Text: {response.text}")
    print("-" * 50)


def test_create_project():
    """Test creating a new project"""
    print("\n1. Testing CREATE project...")

    project_data = {
        "name": f"Test Project {datetime.now().isoformat()}",
        "description": "This is a test project created from the API test script"
    }

    response = requests.post(PROJECTS_URL, json=project_data)
    print_response(response)

    if response.status_code == 201:
        print("✅ Create project test PASSED")
        return response.json()["id"]
    else:
        print("❌ Create project test FAILED")
        return None


def test_get_all_projects():
    """Test getting all projects"""
    print("\n2. Testing GET ALL projects...")

    response = requests.get(PROJECTS_URL)
    print_response(response)

    if response.status_code == 200:
        print("✅ Get all projects test PASSED")
        return True
    else:
        print("❌ Get all projects test FAILED")
        return False


def test_get_project(project_id):
    """Test getting a specific project"""
    print(f"\n3. Testing GET project (ID: {project_id})...")

    response = requests.get(f"{PROJECTS_URL}/{project_id}")
    print_response(response)

    if response.status_code == 200:
        print("✅ Get project test PASSED")
        return True
    else:
        print("❌ Get project test FAILED")
        return False


def test_update_project(project_id):
    """Test updating a project"""
    print(f"\n4. Testing UPDATE project (ID: {project_id})...")

    update_data = {
        "name": f"Updated Project {datetime.now().isoformat()}",
        "description": "This project was updated via the API test script"
    }

    response = requests.put(f"{PROJECTS_URL}/{project_id}", json=update_data)
    print_response(response)

    if response.status_code == 200:
        print("✅ Update project test PASSED")
        return True
    else:
        print("❌ Update project test FAILED")
        return False


def test_delete_project(project_id):
    """Test deleting a project"""
    print(f"\n5. Testing DELETE project (ID: {project_id})...")

    response = requests.delete(f"{PROJECTS_URL}/{project_id}")
    print_response(response)

    if response.status_code == 204:
        print("✅ Delete project test PASSED")

        # Verify deletion
        get_response = requests.get(f"{PROJECTS_URL}/{project_id}")
        if get_response.status_code == 404:
            print("✅ Verified deletion - project no longer exists")
            return True
        else:
            print("❌ Failed to verify deletion - project still exists")
            return False
    else:
        print("❌ Delete project test FAILED")
        return False


def run_all_tests():
    """Run all API tests in sequence"""
    print("Starting Projects API tests...")

    # Test creating a project
    project_id = test_create_project()
    if project_id is None:
        print("❌ Cannot continue tests without a valid project ID")
        return False

    # Test getting all projects
    test_get_all_projects()

    # Test getting a specific project
    test_get_project(project_id)

    # Test updating a project
    test_update_project(project_id)

    # Test deleting a project
    test_delete_project(project_id)

    print("\nCompleted all tests!")
    return True


if __name__ == "__main__":
    print("Projects API Test Script")
    print("=" * 50)

    # Check API health before starting tests
    try:
        health_response = requests.get(f"{API_BASE_URL.split('/api')[0]}/health")
        if health_response.status_code != 200:
            print(f"❌ API health check failed: {health_response.status_code}")
            sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("❌ Failed to connect to the API. Make sure the server is running.")
        sys.exit(1)

    print("✅ API is running")
    run_all_tests()
