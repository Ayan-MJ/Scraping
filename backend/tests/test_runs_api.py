#!/usr/bin/env python
"""
Test script for the Runs API endpoints.
"""
import requests
import json
import sys
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:9000/api/v1"  # Update if your port differs


def print_response(response):
    """Print response details for debugging"""
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response Text: {response.text}")
    print("-" * 50)


def test_get_runs_for_project(project_id):
    """Test getting all runs for a project"""
    print(f"\n1. Testing GET runs for project {project_id}...")
    
    response = requests.get(f"{API_BASE_URL}/projects/{project_id}/runs")
    print_response(response)
    
    if response.status_code == 200:
        print("✅ Get runs for project test PASSED")
        return True
    else:
        print("❌ Get runs for project test FAILED")
        return False


def test_enqueue_run(project_id, url):
    """Test enqueueing a new run"""
    print(f"\n2. Testing ENQUEUE run for project {project_id}...")
    
    response = requests.post(
        f"{API_BASE_URL}/projects/{project_id}/runs",
        params={"url": url},
        json={"config": {"selector": ".content", "wait_for": ".loaded"}}
    )
    print_response(response)
    
    if response.status_code == 201:
        print("✅ Enqueue run test PASSED")
        return response.json()["id"]
    else:
        print("❌ Enqueue run test FAILED")
        return None


def test_get_run(run_id):
    """Test getting a specific run"""
    print(f"\n3. Testing GET run (ID: {run_id})...")
    
    response = requests.get(f"{API_BASE_URL}/runs/{run_id}")
    print_response(response)
    
    if response.status_code == 200:
        print("✅ Get run test PASSED")
        return True
    else:
        print("❌ Get run test FAILED")
        return False


def test_update_run(run_id):
    """Test updating a run"""
    print(f"\n4. Testing UPDATE run (ID: {run_id})...")
    
    update_data = {
        "status": "cancelled",
        "error": "Test cancellation via API"
    }
    
    response = requests.put(f"{API_BASE_URL}/runs/{run_id}", json=update_data)
    print_response(response)
    
    if response.status_code == 200:
        print("✅ Update run test PASSED")
        return True
    else:
        print("❌ Update run test FAILED")
        return False


def test_delete_run(run_id):
    """Test deleting a run"""
    print(f"\n5. Testing DELETE run (ID: {run_id})...")
    
    response = requests.delete(f"{API_BASE_URL}/runs/{run_id}")
    print_response(response)
    
    if response.status_code == 204:
        print("✅ Delete run test PASSED")
        
        # Verify deletion
        get_response = requests.get(f"{API_BASE_URL}/runs/{run_id}")
        if get_response.status_code == 404:
            print("✅ Verified deletion - run no longer exists")
            return True
        else:
            print("❌ Failed to verify deletion - run still exists")
            return False
    else:
        print("❌ Delete run test FAILED")
        return False


def run_all_tests(project_id):
    """Run all API tests in sequence"""
    print(f"Starting Runs API tests for project {project_id}...")
    
    # Test getting all runs for a project
    test_get_runs_for_project(project_id)
    
    # Test enqueueing a run
    run_id = test_enqueue_run(project_id, "https://example.com")
    if run_id is None:
        print("❌ Cannot continue tests without a valid run ID")
        return False
    
    # Test getting a specific run
    test_get_run(run_id)
    
    # Test updating a run
    test_update_run(run_id)
    
    # Test deleting a run
    test_delete_run(run_id)
    
    print("\nCompleted all tests!")
    return True


if __name__ == "__main__":
    print("Runs API Test Script")
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
    
    # Get a project ID to test with
    try:
        projects_response = requests.get(f"{API_BASE_URL}/projects/")
        if projects_response.status_code != 200 or not projects_response.json():
            print("❌ No projects found. Please create a project first.")
            sys.exit(1)
        
        project_id = projects_response.json()[0]["id"]
        print(f"Using project ID: {project_id}")
    except Exception as e:
        print(f"❌ Failed to get projects: {e}")
        sys.exit(1)
    
    run_all_tests(project_id) 