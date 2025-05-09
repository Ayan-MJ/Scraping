from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import asyncio

# Import routers
from app.routers import projects, runs, schedules, templates, results, stream

app = FastAPI(
    title="Scraping Wizard API",
    description="""
    API for a no-code web-scraping platform.
    
    ## Features
    
    * **Projects** - Manage web scraping projects
    * **Runs** - Manage individual scraping run instances
    * **Schedules** - Configure recurring scraping jobs
    * **Templates** - Manage scraping templates for different websites
    * **Results** - Access scraped data from completed runs
    
    ## Authentication
    
    This API uses Supabase for authentication. All endpoints require authentication.
    """,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Modify in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(runs.router, prefix=settings.API_V1_STR)
app.include_router(schedules.router, prefix=settings.API_V1_STR)
app.include_router(templates.router, prefix=settings.API_V1_STR)
app.include_router(results.router, prefix=settings.API_V1_STR)
app.include_router(stream.router, prefix=settings.API_V1_STR, tags=["stream"])

@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint to verify the API is running.
    
    Returns:
        dict: Status message
    """
    return {"status": "ok", "message": "Scraping Wizard API is running"}

@app.on_event("startup")
async def startup_event():
    """
    Actions to run on application startup.
    """
    # Load and register schedules
    # Commented out for now as we need to initialize the database tables first
    # from app.services import schedule_service
    # await schedule_service.load_and_register_schedules()
    
    # Create templates table for testing
    try:
        from app.core.supabase import supabase
        
        # Create templates table if it doesn't exist
        result = supabase.rpc(
            "create_templates_table_if_not_exists",
            {
                "sql_query": """
                    CREATE TABLE IF NOT EXISTS public.templates (
                      id SERIAL PRIMARY KEY,
                      name TEXT NOT NULL,
                      description TEXT,
                      thumbnail_url TEXT,
                      selector_schema JSONB NOT NULL,
                      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                """
            }
        ).execute()
        
        print("Templates table ready for testing")
    except Exception as e:
        print(f"Error creating templates table: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 