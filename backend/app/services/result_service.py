"""
Service layer for handling scraping results.
"""
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from app.schemas.result import Result, ResultCreate
from app.core.supabase import supabase
from datetime import datetime
import logging
import os
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Table name in Supabase
RESULTS_TABLE = "results"

# Use in-memory database only in test mode (controlled by environment variable)
use_in_memory_db = os.getenv("USE_INMEM_DB", "false").lower() == "true"

# In-memory database for testing (when Supabase is not available)
in_memory_results = []
result_id_counter = 1

# Define ResultUpdate schema
class ResultUpdate(BaseModel):
    """Model for updating an existing result."""
    data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    error_message: Optional[str] = None

async def get_results(run_id: int = None) -> List[Result]:
    """
    Get all results, optionally filtered by run_id.
    
    Args:
        run_id: Optional ID of the run to filter results
        
    Returns:
        List of Result objects
    """
    if use_in_memory_db:
        if run_id is not None:
            results = [Result(**result) for result in in_memory_results if result["run_id"] == run_id]
        else:
            results = [Result(**result) for result in in_memory_results]
        return results
        
    try:
        query = supabase.table(RESULTS_TABLE).select("*")
        
        if run_id is not None:
            query = query.eq("run_id", run_id)
            
        response = query.execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching results: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch results")
        
        return [Result(**result_data) for result_data in response.data]
    except Exception as e:
        logger.error(f"Error in get_results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_failed_results(run_id: int) -> List[Result]:
    """
    Get failed results for a specific run.
    
    Args:
        run_id: ID of the run to get failed results for
        
    Returns:
        List of failed Result objects
    """
    if use_in_memory_db:
        results = [Result(**result) for result in in_memory_results 
                  if result["run_id"] == run_id and result.get("status") == "failed"]
        return results
    
    try:
        response = supabase.table(RESULTS_TABLE).select("*")\
            .eq("run_id", run_id)\
            .eq("status", "failed")\
            .execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching failed results: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch failed results")
        
        return [Result(**result_data) for result_data in response.data]
    except Exception as e:
        logger.error(f"Error in get_failed_results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
    if use_in_memory_db:
        for result in in_memory_results:
            if result["id"] == result_id:
                return Result(**result)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Result with ID {result_id} not found"
        )
    
    try:
        response = supabase.table(RESULTS_TABLE).select("*").eq("id", result_id).execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching result {result_id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch result")
            
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Result with ID {result_id} not found"
            )
        
        return Result(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_result: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def create_result(data: ResultCreate) -> Result:
    """
    Create a new result.
    
    Args:
        data (ResultCreate): Result data to be created
        
    Returns:
        Result: The created result
    """
    global result_id_counter
    
    if use_in_memory_db:
        logger.debug("Using in-memory database for create_result")
        now = datetime.utcnow()
        result_data = data.model_dump()
        result_data["id"] = result_id_counter
        result_data["created_at"] = now
        result_data["updated_at"] = now
        
        in_memory_results.append(result_data)
        result_id_counter += 1
        
        return Result(**result_data)
    
    try:
        now = datetime.utcnow().isoformat()
        result_data = data.model_dump()
        
        # Set timestamps
        result_data["created_at"] = now
        result_data["updated_at"] = now
        
        response = supabase.table(RESULTS_TABLE).insert(result_data).execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error creating result: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to create result")
        
        # Update the run's records_extracted count - only increment for successful scrapes
        if data.status == "success":
            run_id = data.run_id
            update_response = supabase.table("runs").select("records_extracted").eq("id", run_id).execute()
            if update_response.data:
                current_count = update_response.data[0].get("records_extracted", 0) or 0
                supabase.table("runs").update({"records_extracted": current_count + 1}).eq("id", run_id).execute()
        
        return Result(**response.data[0])
    except Exception as e:
        logger.error(f"Error in create_result: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
    # First make sure the result exists
    await get_result(result_id)
    
    # Filter out None values
    update_data = {k: v for k, v in result_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    if not update_data:
        return await get_result(result_id)
    
    if use_in_memory_db:
        for i, result in enumerate(in_memory_results):
            if result["id"] == result_id:
                in_memory_results[i].update(update_data)
                return Result(**in_memory_results[i])
    else:
        try:
            response = supabase.table(RESULTS_TABLE).update(update_data).eq("id", result_id).execute()
            
            if hasattr(response, 'error') and response.error is not None:
                logger.error(f"Error updating result {result_id}: {response.error}")
                raise HTTPException(status_code=500, detail="Failed to update result")
                
            return Result(**response.data[0])
        except Exception as e:
            logger.error(f"Error in update_result: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # If we get here, something went wrong
    raise HTTPException(status_code=500, detail="Failed to update result")

async def delete_result(result_id: int) -> None:
    """
    Delete a result.
    
    Args:
        result_id: ID of the result to delete
        
    Raises:
        HTTPException: If result not found
    """
    # First make sure the result exists
    await get_result(result_id)
    
    if use_in_memory_db:
        global in_memory_results
        in_memory_results = [r for r in in_memory_results if r["id"] != result_id]
        return
    
    try:
        response = supabase.table(RESULTS_TABLE).delete().eq("id", result_id).execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error deleting result {result_id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to delete result")
    except Exception as e:
        logger.error(f"Error in delete_result: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_results_by_run(run_id: int) -> List[Result]:
    """
    Retrieve all results for a specific run.
    
    Args:
        run_id (int): ID of the run
        
    Returns:
        List[Result]: List of results for the run
    """
    if use_in_memory_db:
        logger.debug(f"Using in-memory database for get_results_by_run with run_id {run_id}")
        results = [Result(**result) for result in in_memory_results if result["run_id"] == run_id]
        return results
    
    try:
        response = supabase.table(RESULTS_TABLE).select("*").eq("run_id", run_id).execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching results for run {run_id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch results")
        
        return [Result(**result_data) for result_data in response.data]
    except Exception as e:
        logger.error(f"Error in get_results_by_run: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_failed_results(run_id: int) -> List[Result]:
    """
    Retrieve all failed results for a specific run.
    
    Args:
        run_id (int): ID of the run
        
    Returns:
        List[Result]: List of failed results for the run
    """
    if use_in_memory_db:
        logger.debug(f"Using in-memory database for get_failed_results with run_id {run_id}")
        results = [Result(**result) for result in in_memory_results 
                   if result["run_id"] == run_id and result.get("status") == "failed"]
        return results
    
    try:
        response = supabase.table(RESULTS_TABLE).select("*")\
            .eq("run_id", run_id)\
            .eq("status", "failed")\
            .execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching failed results for run {run_id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch results")
        
        return [Result(**result_data) for result_data in response.data]
    except Exception as e:
        logger.error(f"Error in get_failed_results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_result(id: int) -> Result:
    """
    Retrieve a single result by ID.
    
    Args:
        id (int): Result ID
        
    Returns:
        Result: The requested result
        
    Raises:
        HTTPException: If result not found
    """
    if use_in_memory_db:
        logger.debug(f"Using in-memory database for get_result with id {id}")
        for result in in_memory_results:
            if result["id"] == id:
                return Result(**result)
        raise HTTPException(status_code=404, detail=f"Result with ID {id} not found")
    
    try:
        response = supabase.table(RESULTS_TABLE).select("*").eq("id", id).execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching result {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch result")
        
        if not response.data:
            raise HTTPException(status_code=404, detail=f"Result with ID {id} not found")
        
        return Result(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_result: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 
