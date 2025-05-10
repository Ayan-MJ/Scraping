from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Annotated
from app.schemas.project import Project, ProjectCreate, ProjectUpdate
from app.services import project_service
from app.core.auth import get_current_user

# Create router with prefix and tags
router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=List[Project])
async def get_all_projects(current_user = Depends(get_current_user)):
    """
    Retrieve all projects owned by the authenticated user.

    Returns:
        List[Project]: List of projects owned by the user
    """
    return await project_service.get_projects(current_user.id)


@router.get("/{id}", response_model=Project)
async def get_project_by_id(id: int, current_user = Depends(get_current_user)):
    """
    Retrieve a project by ID if it belongs to the authenticated user.

    Args:
        id (int): Project ID

    Returns:
        Project: The requested project

    Raises:
        HTTPException: If project not found or doesn't belong to the user
    """
    return await project_service.get_project(id, current_user.id)


@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_new_project(project: ProjectCreate, current_user = Depends(get_current_user)):
    """
    Create a new project owned by the authenticated user.

    Args:
        project (ProjectCreate): Project data

    Returns:
        Project: The created project
    """
    return await project_service.create_project(project, current_user.id)


@router.put("/{id}", response_model=Project)
async def update_existing_project(
    id: int,
    project: ProjectUpdate,
    current_user = Depends(get_current_user)
):
    """
    Update an existing project if it belongs to the authenticated user.

    Args:
        id (int): Project ID
        project (ProjectUpdate): Project data to update

    Returns:
        Project: The updated project

    Raises:
        HTTPException: If project not found or doesn't belong to the user
    """
    return await project_service.update_project(id, project, current_user.id)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_project(id: int, current_user = Depends(get_current_user)):
    """
    Delete a project if it belongs to the authenticated user.

    Args:
        id (int): Project ID

    Raises:
        HTTPException: If project not found or doesn't belong to the user
    """
    await project_service.delete_project(id, current_user.id)
    return None
