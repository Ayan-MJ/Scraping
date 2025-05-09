from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException
from app.schemas.template import Template, TemplateCreate, TemplateUpdate
from app.core.supabase import supabase
from app.core.config import settings
import logging
import json
import os

logger = logging.getLogger(__name__)

# Table name in Supabase
TEMPLATES_TABLE = "templates"

# In-memory database for testing (when Supabase is not available)
in_memory_templates = []

# Use in-memory database only in test mode (controlled by environment variable)
use_in_memory_db = os.getenv("USE_INMEM_DB", "false").lower() == "true"

# Initialize in-memory templates counter
template_id_counter = 1

# Fail fast if Supabase credentials are missing in production
if not use_in_memory_db:
    try:
        # Check if supabase connection is valid
        if not supabase:
            raise ValueError("Supabase client is not initialized")
    except Exception as e:
        logger.error(f"Supabase connection error: {e}")
        raise RuntimeError(f"Failed to connect to Supabase database. Please check your credentials. Error: {e}")


async def get_templates() -> List[Template]:
    """
    Retrieve all templates.
    
    Returns:
        List[Template]: List of templates
    """
    if use_in_memory_db:
        logger.debug("Using in-memory database for get_templates")
        return [Template(**template) for template in in_memory_templates]
    
    try:
        response = supabase.table(TEMPLATES_TABLE).select("*").execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching templates: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch templates")
        
        return [Template(**template_data) for template_data in response.data]
    except Exception as e:
        logger.error(f"Error in get_templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_template(id: int) -> Template:
    """
    Retrieve a single template by ID.
    
    Args:
        id (int): Template ID
        
    Returns:
        Template: The requested template
        
    Raises:
        HTTPException: If template not found
    """
    if use_in_memory_db:
        logger.debug(f"Using in-memory database for get_template with id {id}")
        for template in in_memory_templates:
            if template["id"] == id:
                return Template(**template)
        raise HTTPException(status_code=404, detail=f"Template with ID {id} not found")
    
    try:
        response = supabase.table(TEMPLATES_TABLE).select("*").eq("id", id).execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching template {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch template")
        
        if not response.data:
            raise HTTPException(status_code=404, detail=f"Template with ID {id} not found")
        
        return Template(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def create_template(data: TemplateCreate) -> Template:
    """
    Create a new template.
    
    Args:
        data (TemplateCreate): Template data
        
    Returns:
        Template: The created template
    """
    global template_id_counter
    
    if use_in_memory_db:
        logger.debug("Using in-memory database for create_template")
        now = datetime.utcnow()
        template_data = data.model_dump()
        template_data["id"] = template_id_counter
        template_data["created_at"] = now
        template_data["updated_at"] = now
        
        in_memory_templates.append(template_data)
        template_id_counter += 1
        
        return Template(**template_data)
    
    try:
        now = datetime.utcnow().isoformat()
        template_data = data.model_dump()
        
        # Set timestamps
        template_data["created_at"] = now
        template_data["updated_at"] = now
        
        response = supabase.table(TEMPLATES_TABLE).insert(template_data).execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error creating template: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to create template")
        
        return Template(**response.data[0])
    except Exception as e:
        logger.error(f"Error in create_template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_template(id: int, data: TemplateUpdate) -> Template:
    """
    Update an existing template.
    
    Args:
        id (int): Template ID
        data (TemplateUpdate): Template data to update
        
    Returns:
        Template: The updated template
        
    Raises:
        HTTPException: If template not found
    """
    if use_in_memory_db:
        logger.debug(f"Using in-memory database for update_template with id {id}")
        # First check if template exists
        found = False
        for i, template in enumerate(in_memory_templates):
            if template["id"] == id:
                found = True
                update_data = data.model_dump(exclude_none=True)
                update_data["updated_at"] = datetime.utcnow()
                in_memory_templates[i].update(update_data)
                return Template(**in_memory_templates[i])
                
        if not found:
            raise HTTPException(status_code=404, detail=f"Template with ID {id} not found")
    
    try:
        # First check if template exists
        await get_template(id)
        
        # Update the template
        update_data = data.model_dump(exclude_none=True)
        
        # Set updated_at timestamp
        if "updated_at" not in update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()
        
        response = supabase.table(TEMPLATES_TABLE).update(update_data).eq("id", id).execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error updating template {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to update template")
        
        return Template(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_template(id: int) -> None:
    """
    Delete a template.
    
    Args:
        id (int): Template ID
        
    Raises:
        HTTPException: If template not found or deletion fails
    """
    if use_in_memory_db:
        logger.debug(f"Using in-memory database for delete_template with id {id}")
        # Check if template exists
        for i, template in enumerate(in_memory_templates):
            if template["id"] == id:
                del in_memory_templates[i]
                return
                
        raise HTTPException(status_code=404, detail=f"Template with ID {id} not found")
    
    try:
        # First check if template exists
        await get_template(id)
        
        # Delete the template
        response = supabase.table(TEMPLATES_TABLE).delete().eq("id", id).execute()
        
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error deleting template {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to delete template")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def seed_initial_templates() -> List[Template]:
    """
    Seed initial templates for public tender sites.
    
    Returns:
        List[Template]: List of created/updated templates
    """
    try:
        # Predefined templates for public tender sites
        templates = [
            {
                "name": "eProcure.gov.in",
                "description": "Template for scraping tenders from the Central Public Procurement Portal of India",
                "thumbnail_url": "https://eprocure.gov.in/eprocure/app/resources/img/eprocure-logo.png",
                "selector_schema": {
                    "tender_title": {
                        "selector": "span.tenderTitle",
                        "type": "text"
                    },
                    "tender_ref_no": {
                        "selector": "span.tenderRefNo",
                        "type": "text"
                    },
                    "closing_date": {
                        "selector": "span.closingDate",
                        "type": "text"
                    },
                    "tender_details": {
                        "selector": "div.tenderDetails",
                        "type": "html"
                    }
                }
            },
            {
                "name": "GeM.gov.in",
                "description": "Template for scraping Government e-Marketplace",
                "thumbnail_url": "https://gem.gov.in/resources/images/logo.svg",
                "selector_schema": {
                    "bid_title": {
                        "selector": "div.bid-title h4",
                        "type": "text"
                    },
                    "bid_number": {
                        "selector": "div.bid-number span",
                        "type": "text"
                    },
                    "bid_end_date": {
                        "selector": "div.bid-end-date",
                        "type": "text"
                    },
                    "bid_value": {
                        "selector": "div.bid-value span",
                        "type": "text"
                    }
                }
            },
            {
                "name": "eTenders.maharashtra.gov.in",
                "description": "Template for scraping Maharashtra state government tenders",
                "thumbnail_url": "https://etenders.maharashtra.gov.in/images/logo.png",
                "selector_schema": {
                    "tender_notice_title": {
                        "selector": "td.tender-notice-title",
                        "type": "text"
                    },
                    "tender_id": {
                        "selector": "td.tender-id",
                        "type": "text"
                    },
                    "opening_date": {
                        "selector": "td.opening-date",
                        "type": "text"
                    },
                    "closing_date": {
                        "selector": "td.closing-date",
                        "type": "text"
                    },
                    "tender_document": {
                        "selector": "a.tender-document",
                        "type": "link",
                        "attribute": "href"
                    }
                }
            }
        ]

        results = []
        
        if use_in_memory_db:
            logger.debug("Using in-memory database for seed_initial_templates")
            global template_id_counter
            now = datetime.utcnow()
            
            # Clear existing templates
            in_memory_templates.clear()
            template_id_counter = 1
            
            # Add templates
            for template_data in templates:
                template_data["id"] = template_id_counter
                template_data["created_at"] = now
                template_data["updated_at"] = now
                in_memory_templates.append(template_data.copy())
                results.append(Template(**template_data))
                template_id_counter += 1
                
            logger.info(f"Seeded {len(results)} templates in memory")
            return results
        
        for template in templates:
            # Check if template with same name exists
            response = supabase.table(TEMPLATES_TABLE).select("*").eq("name", template["name"]).execute()
            
            now = datetime.utcnow().isoformat()
            template["updated_at"] = now
            
            if response.data and len(response.data) > 0:
                # Update existing template
                template_id = response.data[0]["id"]
                response = supabase.table(TEMPLATES_TABLE).update(template).eq("id", template_id).execute()
                logger.info(f"Updated existing template: {template['name']}")
            else:
                # Create new template
                template["created_at"] = now
                response = supabase.table(TEMPLATES_TABLE).insert(template).execute()
                logger.info(f"Created new template: {template['name']}")
                
            if hasattr(response, 'error') and response.error is not None:
                logger.error(f"Error seeding template {template['name']}: {response.error}")
                continue
                
            results.append(Template(**response.data[0]))
            
        logger.info(f"Seeded {len(results)} templates in Supabase")
        return results
    except Exception as e:
        logger.error(f"Error in seed_initial_templates: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 