# Scraping Wizard Backend

Backend for the Scraping Wizard platform - a no-code web scraping solution.

## Features

- **Projects API**: Manage scraping projects
- **Runs API**: Execute and monitor scraping jobs
- **Schedules API**: Set up recurring scraping jobs
- **Templates API**: Reusable scraping configurations for common websites

## Authentication

The API uses Supabase Auth for authentication. All endpoints except the health check require a valid JWT token.

### How Authentication Works

1. Users authenticate via Supabase Auth (email/password, social login, etc.)
2. Supabase provides a JWT token upon successful authentication
3. This token must be included in all API requests in the Authorization header
4. Row-Level Security (RLS) in the database ensures users can only access their own data

### Getting a JWT Token

#### Option 1: Using the Supabase UI

1. Go to your Supabase project dashboard
2. Navigate to the Authentication section
3. Sign in with a test user
4. Copy the JWT token from the browser's developer tools (localStorage)

#### Option 2: Using the Supabase JavaScript Client

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY')

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'example@email.com',
  password: 'example-password',
})

// The JWT token is in data.session.access_token
console.log(data.session.access_token)
```

#### Option 3: Using the Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Get a token
supabase tokens create --name my-token

# The output will include a JWT token
```

### Including the Token in API Requests

Include the token in the Authorization header of all API requests:

```bash
curl -X GET "http://localhost:8000/api/v1/projects/" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

For testing in Swagger UI:
1. Click the "Authorize" button at the top of the page
2. Enter your JWT token in the value field
3. Click "Authorize" to save

### Environment Variables

Make sure to set these environment variables:

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

## Development

### Prerequisites

- Python 3.10+
- Supabase (local or cloud instance)
- Redis (for Celery task queue)

### Setup

1. Clone the repository
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and configure your environment variables

### Running the Application

#### With Supabase (Production Mode)

Run the application with Supabase as the database:

```bash
./scripts/dev.sh --supabase
```

Or:

```bash
uvicorn app.main:app --reload
```

#### With In-Memory Database (Development/Testing Mode)

For quick development or testing without setting up Supabase:

```bash
./scripts/dev.sh --inmem
```

Or:

```bash
USE_INMEM_DB=true uvicorn app.main:app --reload
```

### Testing

Run tests with in-memory database:

```bash
USE_INMEM_DB=true pytest
```

Run tests with Supabase (requires a Supabase instance):

```bash
pytest
```

## In-Memory Database vs. Supabase

The application supports both Supabase and an in-memory database:

- **In-Memory Database**:
  - Used for testing and quick development
  - Data is lost when the application restarts
  - Controlled via `USE_INMEM_DB=true` environment variable
  - No need for Supabase credentials

- **Supabase Database**:
  - Used for production and integration testing
  - Persistent data storage
  - Default mode (`USE_INMEM_DB=false` or not set)
  - Requires valid Supabase credentials

### Best Practices

1. **Guard with environment flag**:
   - Use `USE_INMEM_DB=true` only in development/test environments
   - Default to Supabase in production

2. **Production Safeguards**:
   - The application will fail fast if Supabase credentials are missing
   - Never enable in-memory database in production

3. **Testing**:
   - CI pipeline runs tests against both in-memory and Supabase
   - In-memory tests validate logic without external dependencies
   - Supabase tests validate database integration

## API Documentation

When the application is running, access the API documentation at:

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Project Structure

```
backend/
├── app/
│   ├── core/         # Configuration and settings
│   ├── models/       # Database models
│   ├── routers/      # API route handlers
│   ├── schemas/      # Pydantic models
│   ├── services/     # Business logic
│   ├── main.py       # FastAPI application
│   └── worker.py     # Celery worker
├── scripts/          # Database setup scripts
├── tests/            # Test scripts
├── pyproject.toml    # Poetry dependencies
├── Dockerfile        # Docker configuration
└── README.md         # This file
```

## API Endpoints

### Projects API

- `GET /api/v1/projects/` - Get all projects
- `GET /api/v1/projects/{id}/` - Get a project by ID
- `POST /api/v1/projects/` - Create a new project
- `PUT /api/v1/projects/{id}/` - Update a project
- `DELETE /api/v1/projects/{id}/` - Delete a project

### Runs API

- `GET /api/v1/projects/{project_id}/runs` - Get all runs for a project
- `GET /api/v1/runs/{run_id}` - Get a run by ID
- `POST /api/v1/projects/{project_id}/runs` - Enqueue a new run
- `PUT /api/v1/runs/{run_id}` - Update a run
- `DELETE /api/v1/runs/{run_id}` - Delete a run
- `POST /api/v1/projects/{project_id}/runs/{run_id}/retry` - Retry failed URLs in a run

### Error Handling and Retry

The system now supports tracking failed scraping operations and provides a retry mechanism:

1. **Error Tracking**:
   - Each result now includes `status` ("success" or "failed") and `error_message` fields
   - Failed results are stored in the database with error details
   - The run summary includes count of failed URLs

2. **Retry Mechanism**:
   - Use `POST /api/v1/projects/{project_id}/runs/{run_id}/retry` to retry failed URLs
   - The endpoint returns the number of URLs that were queued for retry
   - Each failed URL is processed individually in a separate task

3. **Example Usage**:
   ```bash
   # Retry all failed URLs for run 123 in project 42
   curl -X POST http://localhost:8000/api/v1/projects/42/runs/123/retry -H "Authorization: Bearer YOUR_JWT_TOKEN"
   
   # Response: {"retried": 5}
   ```

## Running with Docker

To start all services (API, Celery worker, and Redis):

```bash
docker-compose up --build
```

The API will be available at http://localhost:9000

## API Documentation

- Swagger UI: http://localhost:9000/docs
- ReDoc: http://localhost:9000/redoc

## Development

### Installing dependencies locally

```bash
cd backend
poetry install
```

### Running the API locally

```bash
cd backend
poetry run uvicorn app.main:app --reload
```

### Running the Celery worker locally

```bash
cd backend
poetry run celery -A app.worker.celery worker --loglevel=info
```

## Testing

See the `tests/README.md` for instructions on how to test the API endpoints. 