import os
import sys
import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient

# Add the app directory to the Python path
app_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, app_path)

# Import mocks
try:
    from tests.mocks import MockRedis, MockSupabase
except ImportError:
    # If mocks.py doesn't exist yet, create simple mock classes
    from unittest.mock import MagicMock
    
    class MockRedis:
        def __init__(self, *args, **kwargs):
            self.data = {}
        
        def get(self, key):
            return self.data.get(key)
            
        def set(self, key, value, *args, **kwargs):
            self.data[key] = value
            return True
    
    class MockSupabase:
        def table(self, name):
            return MagicMock()
            
        def rpc(self, *args, **kwargs):
            mock_response = MagicMock()
            mock_response.execute.return_value.data = {}
            mock_response.execute.return_value.error = None
            return mock_response

# Mock dependencies that might not be available in CI environment
MOCK_MODULES = ['croniter', 'playwright', 'redis', 'celery', 'ormar']
for module_name in MOCK_MODULES:
    try:
        __import__(module_name)
    except ImportError:
        print(f"{module_name} not found, creating mock module")
        import types
        mock_module = types.ModuleType(module_name)
        sys.modules[module_name] = mock_module
        
        # Add specific mocks based on module
        if module_name == 'croniter':
            mock_module.croniter = type('croniter', (), {
                '__init__': lambda *args, **kwargs: None,
                'get_next': lambda self, *args: None,
                'get_prev': lambda self: None,
                'get_current': lambda self: None
            })
        elif module_name == 'celery':
            # Create a basic mock for Celery
            class MockCelery:
                def __init__(self, *args, **kwargs):
                    self.conf = type('conf', (), {'beat_schedule': {}})
                    
                def task(self, *args, **kwargs):
                    def decorator(func):
                        return func
                    return decorator
                    
                def send_task(self, *args, **kwargs):
                    return type('AsyncResult', (), {'id': 'mock-task-id'})
            
            mock_module.Celery = MockCelery
            mock_module.schedules = types.ModuleType('celery.schedules')
            mock_module.schedules.crontab = lambda **kwargs: None
            sys.modules['celery.schedules'] = mock_module.schedules
        elif module_name == 'redis':
            mock_module.Redis = MockRedis
        elif module_name == 'ormar':
            # Create basic ORM fields
            mock_module.Model = type('Model', (), {})
            mock_module.Integer = lambda **kwargs: None
            mock_module.String = lambda **kwargs: None
            mock_module.Text = lambda **kwargs: None
            mock_module.JSON = lambda **kwargs: None
            mock_module.DateTime = lambda **kwargs: None
            mock_module.Boolean = lambda **kwargs: None
            mock_module.ForeignKey = lambda model, **kwargs: None

# Load environment variables from .env.test BEFORE importing app
env_file = ".env.test"
if os.path.exists(env_file):
    load_dotenv(env_file, override=True)
    print(f"Loaded test environment from {env_file}")
else:
    print(f"Warning: {env_file} not found. Using default environment variables.")

# Ensure required settings are available as env vars
os.environ["USE_INMEM_DB"] = os.environ.get("USE_INMEM_DB", "true")
os.environ["ENVIRONMENT"] = os.environ.get("ENVIRONMENT", "test")
os.environ["SUPABASE_URL"] = os.environ.get("SUPABASE_URL", "https://example.com")
os.environ["SUPABASE_KEY"] = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test")
os.environ["SUPABASE_SERVICE_KEY"] = os.environ.get("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service")
os.environ["REDIS_HOST"] = os.environ.get("REDIS_HOST", "localhost")
os.environ["REDIS_PORT"] = os.environ.get("REDIS_PORT", "6379")
os.environ["CELERY_BROKER_URL"] = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
os.environ["CELERY_RESULT_BACKEND"] = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Set null value for Sentry during testing unless explicitly provided
if "SENTRY_DSN" not in os.environ:
    os.environ["SENTRY_DSN"] = ""

# Mock Supabase client
sys.modules['app.core.supabase'] = type('module', (), {'supabase': MockSupabase()})

# Mock Redis client
if 'redis' in sys.modules:
    # Patch Redis to return our mock
    original_redis = sys.modules['redis'].Redis
    sys.modules['redis'].Redis = MockRedis
    
    # Also patch aioredis if it exists
    if 'aioredis' in sys.modules:
        sys.modules['aioredis'].Redis = MockRedis

# Now import the app
try:
    from app.main import app
    print("Successfully imported FastAPI application")
except ImportError as e:
    print(f"Failed to import app: {e}")
    print("Current Python path:", sys.path)
    print("Current environment variables:", {k: v for k, v in os.environ.items() if not k.startswith('_')})
    raise

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Set up the test environment with in-memory database."""
    # Verify test environment is properly set
    assert os.environ.get("ENVIRONMENT") == "test", "Tests must run in test environment"
    assert os.environ.get("USE_INMEM_DB") == "true", "Tests should use in-memory database"
    
    # Additional test setup can go here
    print("Test environment set up with in-memory database")
    yield
    # Clean up after tests (if needed)
    print("Test environment cleanup completed")

@pytest.fixture
def client():
    """Test client for FastAPI application."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def mock_db():
    """Fixture to provide a mock database for testing."""
    return {
        "projects": [],
        "runs": [],
        "schedules": [],
        "templates": [],
        "results": []
    }

@pytest.fixture
def mock_redis():
    """Fixture to provide a mock Redis client for testing."""
    return MockRedis()
