from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any, Annotated
from app.schemas.result import Result, ResultCreate
from app.services import result_service, run_service, project_service
from app.core.auth import get_current_user

# Create router with prefix and tags
router = APIRouter(prefix="/results", tags=["results"])


@router.get("/", response_model=List[Result])
async def get_all_results(
    current_user: Annotated[dict, Depends(get_current_user)],
    run_id: int = None
):
    """
    Retrieve all results, optionally filtered by run ID.

    Args:
        run_id (Optional[int]): Filter results by run ID

    Returns:
        List[Result]: List of results
    """
    # If run_id is provided, verify user has access to it
    if run_id is not None:
        run = await run_service.get_run(run_id)
        await project_service.get_project(run.project_id, current_user.id)

    return await result_service.get_results(run_id)


@router.get("/{id}", response_model=Result)
async def get_result_by_id(id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Retrieve a result by ID if the user has access to the associated run.

    Args:
        id (int): Result ID

    Returns:
        Result: The requested result

    Raises:
        HTTPException: If result not found or user doesn't have access
    """
    result = await result_service.get_result(id)
    run = await run_service.get_run(result.run_id)
    await project_service.get_project(run.project_id, current_user.id)
    return result


@router.get("/{id}/data", response_model=Dict[str, Any])
async def get_result_data(id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Retrieve the raw data for a result if the user has access to the associated run.

    Args:
        id (int): Result ID

    Returns:
        Dict[str, Any]: The result data

    Raises:
        HTTPException: If result not found or user doesn't have access
    """
    # First check that the user has access to this result
    result = await get_result_by_id(id, current_user)
    
    # Return the data
    return result.data


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_result(id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Delete a result if the user has access to the associated run.

    Args:
        id (int): Result ID

    Raises:
        HTTPException: If result not found or user doesn't have access
    """
    # First check that the user has access to this result
    await get_result_by_id(id, current_user)
    
    # Delete the result
    await result_service.delete_result(id)
    return None 
