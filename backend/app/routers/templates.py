from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.template import Template, TemplateCreate, TemplateUpdate
from app.services import template_service

router = APIRouter(
    prefix="/templates",
    tags=["templates"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=List[Template])
async def get_templates():
    """
    Retrieve all templates.
    """
    return await template_service.get_templates()


@router.get("/{id}", response_model=Template)
async def get_template(id: int):
    """
    Retrieve a single template by ID.
    """
    return await template_service.get_template(id)


@router.post("", response_model=Template, status_code=status.HTTP_201_CREATED)
async def create_template(template: TemplateCreate):
    """
    Create a new template.
    """
    return await template_service.create_template(template)


@router.put("/{id}", response_model=Template)
async def update_template(id: int, template: TemplateUpdate):
    """
    Update an existing template.
    """
    return await template_service.update_template(id, template)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(id: int):
    """
    Delete a template.
    """
    await template_service.delete_template(id)
    return None


@router.post("/seed", response_model=List[Template])
async def seed_templates():
    """
    Seed initial templates for public tender sites.
    """
    return await template_service.seed_initial_templates()
