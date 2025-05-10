"""
Service layer for handling scraping results.
"""
from typing import List
from app.schemas.result import Result, ResultCreate, ResultUpdate
from app.models.result import Result as ResultModel

async def get_results(run_id: int = None) -> List[Result]:
    """
    Get all results, optionally filtered by run_id.
    
    Args:
        run_id: Optional ID of the run to filter results
        
    Returns:
        List of Result objects
    """
    query = ResultModel.objects()
    if run_id is not None:
        query = query.filter(run_id=run_id)
        
    results = await query.execute()
    return [Result.model_validate(result) for result in results]

async def get_failed_results(run_id: int) -> List[Result]:
    """
    Get failed results for a specific run.
    
    Args:
        run_id: ID of the run to get failed results for
        
    Returns:
        List of failed Result objects
    """
    query = ResultModel.objects().filter(
        run_id=run_id,
        status="failed"
    )
    
    results = await query.execute()
    return [Result.model_validate(result) for result in results]

async def get_result(result_id: int) -> Result:
    """
    Get a single result by ID.
    
    Args:
        result_id: ID of the result to retrieve
        
    Returns:
        Result object
        
    Raises:
        HTTPException: If result not found
    """
    result = await ResultModel.objects().get_or_none(id=result_id)
    if not result:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Result with ID {result_id} not found"
        )
    
    return Result.model_validate(result)

async def create_result(result_data: ResultCreate) -> Result:
    """
    Create a new result.
    
    Args:
        result_data: ResultCreate object with result data
        
    Returns:
        Newly created Result object
    """
    result = await ResultModel.objects().create(**result_data.model_dump())
    return Result.model_validate(result)

async def update_result(result_id: int, result_data: ResultUpdate) -> Result:
    """
    Update an existing result.
    
    Args:
        result_id: ID of the result to update
        result_data: ResultUpdate object with fields to update
        
    Returns:
        Updated Result object
        
    Raises:
        HTTPException: If result not found
    """
    result = await get_result(result_id)
    
    # Filter out None values
    update_data = {k: v for k, v in result_data.model_dump().items() if v is not None}
    
    if not update_data:
        return result
    
    # Update the result
    await ResultModel.objects().filter(id=result_id).update(**update_data)
    
    # Return the updated result
    return await get_result(result_id)

async def delete_result(result_id: int) -> None:
    """
    Delete a result.
    
    Args:
        result_id: ID of the result to delete
        
    Raises:
        HTTPException: If result not found
    """
    result = await get_result(result_id)
    await ResultModel.objects().filter(id=result_id).delete() 