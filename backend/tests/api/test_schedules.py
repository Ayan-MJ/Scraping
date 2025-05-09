import pytest
from httpx import AsyncClient
from fastapi import status
from app.main import app
from app.schemas.schedule import ScheduleStatus
import json

# Base URL for API routes
API_BASE_URL = "/api/v1"

# Test data
test_schedule = {
    "project_id": 1,
    "name": "Test Schedule",
    "cron_expression": "0 9 * * *",  # Run at 9 AM every day
    "url": "https://example.com",
    "description": "Test schedule description"
}

@pytest.mark.asyncio
async def test_create_schedule():
    """Test creating a new schedule."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            f"{API_BASE_URL}/schedules",
            json=test_schedule
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == test_schedule["name"]
        assert data["project_id"] == test_schedule["project_id"]
        assert data["cron_expression"] == test_schedule["cron_expression"]
        assert data["status"] == ScheduleStatus.ACTIVE
        assert "id" in data
        
        # Save the created schedule ID for other tests
        test_schedule["id"] = data["id"]


@pytest.mark.asyncio
async def test_get_schedules():
    """Test getting all schedules."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(f"{API_BASE_URL}/schedules")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0


@pytest.mark.asyncio
async def test_get_schedule_by_id():
    """Test getting a specific schedule by ID."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(f"{API_BASE_URL}/schedules/{test_schedule['id']}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_schedule["id"]
        assert data["name"] == test_schedule["name"]


@pytest.mark.asyncio
async def test_get_schedules_by_project():
    """Test getting schedules filtered by project ID."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(
            f"{API_BASE_URL}/schedules?project_id={test_schedule['project_id']}"
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]["project_id"] == test_schedule["project_id"]


@pytest.mark.asyncio
async def test_update_schedule():
    """Test updating a schedule."""
    update_data = {
        "name": "Updated Schedule Name",
        "description": "Updated description"
    }
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.put(
            f"{API_BASE_URL}/schedules/{test_schedule['id']}",
            json=update_data
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_schedule["id"]
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        # Unchanged fields should remain
        assert data["cron_expression"] == test_schedule["cron_expression"]


@pytest.mark.asyncio
async def test_pause_schedule():
    """Test pausing a schedule."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"{API_BASE_URL}/schedules/{test_schedule['id']}/pause")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_schedule["id"]
        assert data["status"] == ScheduleStatus.PAUSED


@pytest.mark.asyncio
async def test_activate_schedule():
    """Test activating a paused schedule."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"{API_BASE_URL}/schedules/{test_schedule['id']}/activate")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_schedule["id"]
        assert data["status"] == ScheduleStatus.ACTIVE


@pytest.mark.asyncio
async def test_run_now():
    """Test triggering a schedule to run immediately."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"{API_BASE_URL}/schedules/{test_schedule['id']}/run-now")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_schedule["id"]
        assert "last_run" in data


@pytest.mark.asyncio
async def test_delete_schedule():
    """Test deleting a schedule."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.delete(f"{API_BASE_URL}/schedules/{test_schedule['id']}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify it's gone
        response = await client.get(f"{API_BASE_URL}/schedules/{test_schedule['id']}")
        assert response.status_code == status.HTTP_404_NOT_FOUND 