import pytest
from unittest.mock import patch, MagicMock
from fastapi import status
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.result import ResultCreate, Result
from datetime import datetime

client = TestClient(app)

# Test fixtures for database mocking
@pytest.fixture
def mock_get_project():
    with patch("app.services.project_service.get_project") as mock:
        project = MagicMock()
        project.id = 1
        project.configuration = {"selector_schema": {"title": {"selector": "h1"}}}
        mock.return_value = project
        yield mock

@pytest.fixture
def mock_get_run():
    with patch("app.services.run_service.get_run") as mock:
        run = MagicMock()
        run.id = 42
        run.project_id = 1
        run.config = None  # No config, will use project's selector schema
        mock.return_value = run
        yield mock

@pytest.fixture
def mock_get_failed_results():
    with patch("app.services.result_service.get_failed_results") as mock:
        failed_result1 = Result(
            id=1,
            run_id=42,
            data={},
            url="https://example.com/page1",
            status="failed",
            error_message="Timeout error",
            created_at=datetime.now()
        )
        failed_result2 = Result(
            id=2,
            run_id=42,
            data={},
            url="https://example.com/page2",
            status="failed",
            error_message="Element not found",
            created_at=datetime.now()
        )
        mock.return_value = [failed_result1, failed_result2]
        yield mock

@pytest.fixture
def mock_celery_send_task():
    with patch("app.worker.celery.send_task") as mock:
        mock.return_value = MagicMock()
        yield mock

def test_retry_failed_urls(
    mock_get_project,
    mock_get_run,
    mock_get_failed_results,
    mock_celery_send_task
):
    """Test that the retry endpoint works as expected."""
    
    # Call the retry endpoint
    response = client.post("/projects/1/runs/42/retry")
    
    # Verify API response
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"retried": 2}
    
    # Verify the correct tasks were sent
    assert mock_celery_send_task.call_count == 2
    
    # First call should be for the first failed URL
    call_args_1 = mock_celery_send_task.call_args_list[0]
    assert call_args_1[0][0] == "process_single_url"
    assert call_args_1[0][1][0] == 42  # run_id
    assert call_args_1[0][1][1] == "https://example.com/page1"  # url
    
    # Second call should be for the second failed URL
    call_args_2 = mock_celery_send_task.call_args_list[1]
    assert call_args_2[0][0] == "process_single_url"
    assert call_args_2[0][1][0] == 42  # run_id
    assert call_args_2[0][1][1] == "https://example.com/page2"  # url

def test_retry_no_failed_urls(
    mock_get_project,
    mock_get_run,
    mock_celery_send_task
):
    """Test retry endpoint when no failed URLs exist."""
    
    # Mock get_failed_results to return empty list
    with patch("app.services.result_service.get_failed_results", return_value=[]):
        response = client.post("/projects/1/runs/42/retry")
        
        # Should return 200 OK with 0 retried
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"retried": 0}
        
        # No tasks should be sent
        mock_celery_send_task.assert_not_called()

def test_retry_invalid_project_run():
    """Test retry endpoint with a run that doesn't belong to the project."""
    
    # Mock the necessary services
    with patch("app.services.run_service.get_run") as mock_get_run:
        # Return a run with a different project_id
        run = MagicMock()
        run.id = 42
        run.project_id = 999  # Different from the project_id in the URL
        mock_get_run.return_value = run
        
        response = client.post("/projects/1/runs/42/retry")
        
        # Should return 400 Bad Request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "does not belong to project" in response.json()["detail"]

def test_retry_missing_selector_schema(
    mock_get_run
):
    """Test retry endpoint when no selector schema can be found."""
    
    # Mock project without selector schema
    with patch("app.services.project_service.get_project") as mock_get_project:
        project = MagicMock()
        project.id = 1
        project.configuration = {}  # No selector schema
        mock_get_project.return_value = project
        
        response = client.post("/projects/1/runs/42/retry")
        
        # Should return 400 Bad Request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "No selector schema found" in response.json()["detail"] 