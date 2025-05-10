import pytest
from httpx import AsyncClient
from fastapi import status
from app.main import app
import json

# Base URL for API routes
API_BASE_URL = "/api/v1"

# Test data
test_template = {
    "name": "Test Template",
    "description": "A test template for testing",
    "thumbnail_url": "https://example.com/test-thumbnail.png",
    "selector_schema": {
        "test_field": {
            "selector": "div.test-field",
            "type": "text"
        },
        "test_link": {
            "selector": "a.test-link",
            "type": "link",
            "attribute": "href"
        }
    }
}

@pytest.mark.asyncio
async def test_create_template():
    """Test creating a new template."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            f"{API_BASE_URL}/templates",
            json=test_template
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == test_template["name"]
        assert data["description"] == test_template["description"]
        assert data["thumbnail_url"] == test_template["thumbnail_url"]
        assert "id" in data

        # Save the created template ID for other tests
        test_template["id"] = data["id"]


@pytest.mark.asyncio
async def test_get_templates():
    """Test getting all templates."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(f"{API_BASE_URL}/templates")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0


@pytest.mark.asyncio
async def test_get_template_by_id():
    """Test getting a specific template by ID."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(f"{API_BASE_URL}/templates/{test_template['id']}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_template["id"]
        assert data["name"] == test_template["name"]


@pytest.mark.asyncio
async def test_update_template():
    """Test updating a template."""
    update_data = {
        "name": "Updated Template Name",
        "description": "Updated description"
    }

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.put(
            f"{API_BASE_URL}/templates/{test_template['id']}",
            json=update_data
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_template["id"]
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        # Unchanged fields should remain
        assert data["thumbnail_url"] == test_template["thumbnail_url"]


@pytest.mark.asyncio
async def test_seed_templates():
    """Test seeding initial templates."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"{API_BASE_URL}/templates/seed")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3  # We expect at least 3 templates (eprocure, gem, etenders)


@pytest.mark.asyncio
async def test_delete_template():
    """Test deleting a template."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.delete(f"{API_BASE_URL}/templates/{test_template['id']}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify it's gone
        response = await client.get(f"{API_BASE_URL}/templates/{test_template['id']}")
        assert response.status_code == status.HTTP_404_NOT_FOUND
