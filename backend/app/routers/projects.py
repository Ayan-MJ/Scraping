from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.schemas.project import Project, ProjectCreate, ProjectUpdate
from app.services import project_service

# Create router with prefix and tags
router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=List[Project])
async def get_all_projects():
    """
    Retrieve all projects.
    
    Returns:
        List[Project]: List of all projects
    """
    return await project_service.get_projects()


@router.get("/{id}", response_model=Project)
async def get_project_by_id(id: int):
    """
    Retrieve a project by ID.
    
    Args:
        id (int): Project ID
        
    Returns:
        Project: The requested project
        
    Raises:
        HTTPException: If project not found
    """
    return await project_service.get_project(id)


@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_new_project(project: ProjectCreate):
    """
    Create a new project.
    
    Args:
        project (ProjectCreate): Project data
        
    Returns:
        Project: The created project
    """
    return await project_service.create_project(project)


@router.put("/{id}", response_model=Project)
async def update_existing_project(id: int, project: ProjectUpdate):
    """
    Update an existing project.
    
    Args:
        id (int): Project ID
        project (ProjectUpdate): Project data to update
        
    Returns:
        Project: The updated project
        
    Raises:
        HTTPException: If project not found
    """
    return await project_service.update_project(id, project)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_project(id: int):
    """
    Delete a project.
    
    Args:
        id (int): Project ID
        
    Raises:
        HTTPException: If project not found
    """
    await project_service.delete_project(id)
    return None 