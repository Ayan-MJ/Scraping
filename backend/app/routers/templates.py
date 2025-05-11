from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Annotated
from app.schemas.template import Template, TemplateCreate, TemplateUpdate
from app.services import template_service
from app.core.auth import get_current_user

# Create router with prefix and tags
router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/", response_model=List[Template])
async def get_all_templates(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Retrieve all templates.

    Returns:
        List[Template]: List of all templates
    """
    return await template_service.get_templates()


@router.get("/{id}", response_model=Template)
async def get_template_by_id(id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Retrieve a template by ID.

    Args:
        id (int): Template ID

    Returns:
        Template: The requested template

    Raises:
        HTTPException: If template not found
    """
    return await template_service.get_template(id)


@router.post("/", response_model=Template, status_code=status.HTTP_201_CREATED)
async def create_new_template(template: TemplateCreate, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Create a new template.

    Args:
        template (TemplateCreate): Template data

    Returns:
        Template: The created template
    """
    return await template_service.create_template(template)


@router.put("/{id}", response_model=Template)
async def update_existing_template(
    id: int,
    template: TemplateUpdate,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    """
    Update an existing template.

    Args:
        id (int): Template ID
        template (TemplateUpdate): Template data to update

    Returns:
        Template: The updated template

    Raises:
        HTTPException: If template not found
    """
    return await template_service.update_template(id, template)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_template(id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Delete a template.

    Args:
        id (int): Template ID

    Raises:
        HTTPException: If template not found
    """
    await template_service.delete_template(id)
    return None


@router.post("/seed", response_model=List[Template])
async def seed_templates():
    """
    Seed initial templates for public tender sites.
    """
    return await template_service.seed_initial_templates()
