from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import asyncio

# Import Sentry
try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.asgi import SentryAsgiMiddleware
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False
    print("Sentry SDK not available. Install with 'pip install sentry-sdk' to enable error tracking.")

# Define a hook to filter sensitive data before sending to Sentry
def before_send(event, hint):
    # You can modify the event here to remove sensitive data
    # Example: scrubbing sensitive headers
    if 'request' in event and 'headers' in event['request']:
        if 'authorization' in event['request']['headers']:
            event['request']['headers']['authorization'] = '[Filtered]'

    return event

# Initialize Sentry only if it's available and DSN is configured
if SENTRY_AVAILABLE and settings.SENTRY_DSN:
    try:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            integrations=[
                FastApiIntegration(),
            ],
            traces_sample_rate=0.1,
            # Set to True to capture potentially sensitive data (URL, headers, etc.)
            send_default_pii=False,
            environment=settings.ENVIRONMENT,
            before_send=before_send,
            # Add release information if available
            release=settings.VERSION if hasattr(settings, 'VERSION') else None,
            # Add server_name if you want to identify which server instance sent the event
            server_name=settings.SERVER_NAME if hasattr(settings, 'SERVER_NAME') else None,
        )
        print(f"Sentry initialized for environment: {settings.ENVIRONMENT}")
    except Exception as e:
        print(f"Error initializing Sentry: {e}")
        SENTRY_AVAILABLE = False

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

    This API uses Supabase Auth for authentication.

    All authenticated endpoints require a valid JWT token from Supabase Auth.
    Pass the token in the Authorization header as a Bearer token:
    `Authorization: Bearer your-jwt-token`.

    If authentication fails, a 401 Unauthorized response will be returned.

    To obtain a token for testing, you can:
    1. Use the Supabase UI to sign in and copy the token
    2. Use the Supabase JS or other client to sign in programmatically
    """,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Modify in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

# Add Sentry middleware only if Sentry is available
if SENTRY_AVAILABLE and settings.SENTRY_DSN:
    try:
        app = SentryAsgiMiddleware(app)
        print("Sentry ASGI middleware added")
    except Exception as e:
        print(f"Error adding Sentry middleware: {e}")

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

# Test endpoint to verify Sentry is working
@app.get("/debug-sentry", tags=["health"])
async def test_sentry():
    """
    Endpoint to trigger a test error for Sentry.
    This endpoint intentionally raises an exception to test Sentry integration.

    Only available in development.
    """
    if not SENTRY_AVAILABLE or not settings.SENTRY_DSN:
        return {"message": "Sentry is not configured or available"}
        
    if settings.ENVIRONMENT == "development":
        try:
            raise Exception("This is a test error to verify Sentry is capturing exceptions")
        except Exception as e:
            sentry_sdk.capture_exception(e)
            return {"message": "Test error sent to Sentry"}
    return {"message": "Sentry test endpoint only available in development mode"}

@app.on_event("startup")
async def startup_event():
    """
    Actions to run on application startup.
    """
    print(f"Starting Scraping Wizard API in {settings.ENVIRONMENT} environment")
    
    # Load and register schedules
    # Commented out for now as we need to initialize the database tables first
    # from app.services import schedule_service
    # await schedule_service.load_and_register_schedules()

    # Create templates table for testing
    if settings.USE_INMEM_DB:
        print("Using in-memory database for testing")
        return
        
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
