from fastapi import APIRouter, HTTPException, status, Depends, Path, Query, Body
from typing import List, Optional, Dict, Any
from app.schemas.run import Run, RunCreate, RunUpdate
from app.services import run_service, project_service, result_service
from app.worker import celery as celery_app
from app.core.auth import get_current_user

# Create router with prefix and tags
router = APIRouter(tags=["runs"])


@router.get("/projects/{project_id}/runs", response_model=List[Run])
async def get_runs_for_project(
    project_id: int = Path(..., description="The ID of the project"),
    current_user = Depends(get_current_user),
):
    """
    Retrieve all runs for a project owned by the authenticated user.

    Args:
        project_id (int): The ID of the project

    Returns:
        List[Run]: List of runs for the project
    """
    # Verify project exists and belongs to the user
    await project_service.get_project(project_id, current_user.id)

    return await run_service.get_runs(project_id=project_id)


@router.get("/runs/{run_id}", response_model=Run)
async def get_run_by_id(
    run_id: int = Path(..., description="The ID of the run"),
    current_user = Depends(get_current_user),
):
    """
    Retrieve a run by ID.

    Args:
        run_id (int): The ID of the run

    Returns:
        Run: The requested run

    Raises:
        HTTPException: If run not found or doesn't belong to user's projects
    """
    run = await run_service.get_run(run_id)

    # Verify the run's project belongs to the user
    await project_service.get_project(run.project_id, current_user.id)

    return run


@router.post("/projects/{project_id}/runs", response_model=Run, status_code=status.HTTP_201_CREATED)
async def enqueue_new_run(
    project_id: int = Path(..., description="The ID of the project"),
    url: Optional[str] = Query(None, description="Single URL to scrape"),
    urls: Optional[List[str]] = Body(None, description="List of URLs to scrape"),
    config: Optional[Dict[str, Any]] = Body(None, description="Run configuration"),
    current_user = Depends(get_current_user),
):
    """
    Create a new run and enqueue it for processing.

    Args:
        project_id (int): The ID of the project
        url (Optional[str]): Single URL to scrape
        urls (Optional[List[str]]): List of URLs to scrape
        config (Optional[Dict[str, Any]]): Run configuration

    Returns:
        Run: The created run with pending status
    """
    # Verify project exists and belongs to the user
    await project_service.get_project(project_id, current_user.id)

    if not url and not urls:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'url' or 'urls' must be provided"
        )

    return await run_service.enqueue_run(
        project_id=project_id,
        config=config,
        url=url,
        urls=urls
    )


@router.put("/runs/{run_id}", response_model=Run)
async def update_existing_run(
    run_id: int = Path(..., description="The ID of the run"),
    run_update: RunUpdate = Body(..., description="Run data to update"),
    current_user = Depends(get_current_user),
):
    """
    Update an existing run.

    Args:
        run_id (int): The ID of the run
        run_update (RunUpdate): Run data to update

    Returns:
        Run: The updated run

    Raises:
        HTTPException: If run not found or doesn't belong to user's projects
    """
    # Get the run to check its project
    run = await run_service.get_run(run_id)

    # Verify the run's project belongs to the user
    await project_service.get_project(run.project_id, current_user.id)

    return await run_service.update_run(run_id, run_update)


@router.delete("/runs/{run_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_run(
    run_id: int = Path(..., description="The ID of the run"),
    current_user = Depends(get_current_user),
):
    """
    Delete a run.

    Args:
        run_id (int): The ID of the run

    Raises:
        HTTPException: If run not found or doesn't belong to user's projects
    """
    # Get the run to check its project
    run = await run_service.get_run(run_id)

    # Verify the run's project belongs to the user
    await project_service.get_project(run.project_id, current_user.id)

    await run_service.delete_run(run_id)
    return None


@router.post("/projects/{project_id}/runs/{run_id}/retry", response_model=Dict[str, int])
async def retry_failed_urls(
    project_id: int = Path(..., description="The ID of the project"),
    run_id: int = Path(..., description="The ID of the run"),
    current_user = Depends(get_current_user),
):
    """
    Retry failed URLs for a specific run.

    Args:
        project_id (int): The ID of the project
        run_id (int): The ID of the run

    Returns:
        Dict[str, int]: Number of URLs that were retried

    Raises:
        HTTPException: If run not found or doesn't belong to the project or user
    """
    # Verify project exists and belongs to the user
    await project_service.get_project(project_id, current_user.id)

    # Verify run exists
    run = await run_service.get_run(run_id)

    if run.project_id != project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Run {run_id} does not belong to project {project_id}"
        )

    # Get selector schema from run configuration
    selector_schema = None

    # First try getting selector schema from run
    if run.config and run.config.get('selector_schema'):
        selector_schema = run.config.get('selector_schema')

    # If no selector schema in run, get it from project
    if not selector_schema:
        project = await project_service.get_project(project_id, current_user.id)
        if project.configuration and project.configuration.get('selector_schema'):
            selector_schema = project.configuration.get('selector_schema')

    if not selector_schema:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No selector schema found for this run or project"
        )

    # Get all failed results for this run
    failed_results = await result_service.get_failed_results(run_id)

    # Dispatch a Celery task for each failed URL
    for result in failed_results:
        celery_app.send_task(
            "process_single_url",
            args=[run_id, result.url, selector_schema]
        )

    return {"retried": len(failed_results)}
