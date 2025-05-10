from typing import List, Optional
from datetime import datetime
from uuid import UUID
from fastapi import HTTPException
from app.schemas.project import Project, ProjectCreate, ProjectUpdate
from app.core.supabase import supabase
import logging

logger = logging.getLogger(__name__)

# Table name in Supabase
PROJECTS_TABLE = "projects"


async def get_projects(user_id: UUID) -> List[Project]:
    """
    Retrieve all projects belonging to the user.
    
    Args:
        user_id (UUID): The ID of the authenticated user
    
    Returns:
        List[Project]: List of all projects owned by the user
    """
    try:
        response = supabase.table(PROJECTS_TABLE).select("*").eq("user_id", str(user_id)).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching projects: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch projects")
        
        return [Project(**project) for project in response.data]
    except Exception as e:
        logger.error(f"Error in get_projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_project(id: int, user_id: UUID) -> Project:
    """
    Retrieve a single project by ID that belongs to the user.
    
    Args:
        id (int): Project ID
        user_id (UUID): The ID of the authenticated user
        
    Returns:
        Project: The requested project
        
    Raises:
        HTTPException: If project not found or doesn't belong to the user
    """
    try:
        response = supabase.table(PROJECTS_TABLE).select("*").eq("id", id).eq("user_id", str(user_id)).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching project {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch project")
        
        if not response.data:
            raise HTTPException(status_code=404, detail=f"Project with ID {id} not found")
        
        return Project(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def create_project(data: ProjectCreate, user_id: UUID) -> Project:
    """
    Create a new project owned by the user.
    
    Args:
        data (ProjectCreate): Project data
        user_id (UUID): The ID of the authenticated user
        
    Returns:
        Project: The created project
    """
    try:
        now = datetime.utcnow().isoformat()
        project_data = data.model_dump(exclude_none=True)
        
        # Set timestamps if not provided
        if "created_at" not in project_data:
            project_data["created_at"] = now
        if "updated_at" not in project_data:
            project_data["updated_at"] = now
        
        # Set user_id
        project_data["user_id"] = str(user_id)
        
        response = supabase.table(PROJECTS_TABLE).insert(project_data).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error creating project: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to create project")
        
        return Project(**response.data[0])
    except Exception as e:
        logger.error(f"Error in create_project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_project(id: int, data: ProjectUpdate, user_id: UUID) -> Project:
    """
    Update an existing project owned by the user.
    
    Args:
        id (int): Project ID
        data (ProjectUpdate): Project data to update
        user_id (UUID): The ID of the authenticated user
        
    Returns:
        Project: The updated project
        
    Raises:
        HTTPException: If project not found or doesn't belong to the user
    """
    try:
        # First check if project exists and belongs to the user
        await get_project(id, user_id)
        
        # Update the project
        update_data = data.model_dump(exclude_none=True)
        if "updated_at" not in update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()
        
        response = supabase.table(PROJECTS_TABLE).update(update_data).eq("id", id).eq("user_id", str(user_id)).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error updating project {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to update project")
        
        if not response.data:
            raise HTTPException(status_code=404, detail=f"Project with ID {id} not found")
            
        return Project(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_project(id: int, user_id: UUID) -> None:
    """
    Delete a project owned by the user.
    
    Args:
        id (int): Project ID
        user_id (UUID): The ID of the authenticated user
        
    Raises:
        HTTPException: If project not found, doesn't belong to the user, or deletion fails
    """
    try:
        # First check if project exists and belongs to the user
        await get_project(id, user_id)
        
        # Delete the project
        response = supabase.table(PROJECTS_TABLE).delete().eq("id", id).eq("user_id", str(user_id)).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error deleting project {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to delete project")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_project: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 