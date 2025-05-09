from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException
from app.schemas.project import Project, ProjectCreate, ProjectUpdate
from app.core.supabase import supabase
import logging

logger = logging.getLogger(__name__)

# Table name in Supabase
PROJECTS_TABLE = "projects"


async def get_projects() -> List[Project]:
    """
    Retrieve all projects.
    
    Returns:
        List[Project]: List of all projects
    """
    try:
        response = supabase.table(PROJECTS_TABLE).select("*").execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching projects: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch projects")
        
        return [Project(**project) for project in response.data]
    except Exception as e:
        logger.error(f"Error in get_projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_project(id: int) -> Project:
    """
    Retrieve a single project by ID.
    
    Args:
        id (int): Project ID
        
    Returns:
        Project: The requested project
        
    Raises:
        HTTPException: If project not found
    """
    try:
        response = supabase.table(PROJECTS_TABLE).select("*").eq("id", id).execute()
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


async def create_project(data: ProjectCreate) -> Project:
    """
    Create a new project.
    
    Args:
        data (ProjectCreate): Project data
        
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
        
        response = supabase.table(PROJECTS_TABLE).insert(project_data).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error creating project: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to create project")
        
        return Project(**response.data[0])
    except Exception as e:
        logger.error(f"Error in create_project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_project(id: int, data: ProjectUpdate) -> Project:
    """
    Update an existing project.
    
    Args:
        id (int): Project ID
        data (ProjectUpdate): Project data to update
        
    Returns:
        Project: The updated project
        
    Raises:
        HTTPException: If project not found
    """
    try:
        # First check if project exists
        await get_project(id)
        
        # Update the project
        update_data = data.model_dump(exclude_none=True)
        if "updated_at" not in update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()
        
        response = supabase.table(PROJECTS_TABLE).update(update_data).eq("id", id).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error updating project {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to update project")
        
        return Project(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_project(id: int) -> None:
    """
    Delete a project.
    
    Args:
        id (int): Project ID
        
    Raises:
        HTTPException: If project not found or deletion fails
    """
    try:
        # First check if project exists
        await get_project(id)
        
        # Delete the project
        response = supabase.table(PROJECTS_TABLE).delete().eq("id", id).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error deleting project {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to delete project")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_project: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 