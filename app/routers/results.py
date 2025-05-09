from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from app.schemas.result import Result
from app.services import result_service

router = APIRouter(
    prefix="/runs",
    tags=["results"],
    responses={404: {"description": "Not found"}},
)


@router.get("/{run_id}/results", response_model=List[Result])
async def get_results_by_run(
    run_id: int,
    limit: Optional[int] = Query(100, description="Maximum number of results to return"),
    offset: Optional[int] = Query(0, description="Number of results to skip")
):
    """
    Retrieve all results for a specific run.
    
    Args:
        run_id (int): ID of the run
        limit (int, optional): Maximum number of results to return. Defaults to 100.
        offset (int, optional): Number of results to skip. Defaults to 0.
        
    Returns:
        List[Result]: List of results for the run
    """
    try:
        results = await result_service.get_results_by_run(run_id)
        
        # Simple pagination (future enhancement: add pagination in the database query)
        if offset > 0:
            results = results[offset:]
        if limit > 0:
            results = results[:limit]
            
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get results: {str(e)}"
        )


@router.get("/{run_id}/results/{result_id}", response_model=Result)
async def get_result(run_id: int, result_id: int):
    """
    Retrieve a specific result by ID.
    
    Args:
        run_id (int): ID of the run (for validation)
        result_id (int): ID of the result
        
    Returns:
        Result: The requested result
    """
    try:
        result = await result_service.get_result(result_id)
        
        # Validate that the result belongs to the specified run
        if result.run_id != run_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Result {result_id} does not belong to run {run_id}"
            )
            
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get result: {str(e)}"
        ) 