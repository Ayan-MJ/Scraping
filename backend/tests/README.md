# API Tests for Scraping Wizard

This directory contains test scripts to verify the functionality of the Scraping Wizard API endpoints.

## Project Endpoints Test

The `test_projects_api.py` script tests the CRUD operations for the Project endpoints:

- `GET /api/v1/projects` - Get all projects
- `GET /api/v1/projects/{id}` - Get a project by ID
- `POST /api/v1/projects` - Create a new project
- `PUT /api/v1/projects/{id}` - Update a project
- `DELETE /api/v1/projects/{id}` - Delete a project

## Runs Endpoints Test

The `test_runs_api.py` script tests the CRUD operations and enqueue functionality for the Runs endpoints:

- `GET /api/v1/projects/{project_id}/runs` - Get all runs for a project
- `GET /api/v1/runs/{run_id}` - Get a run by ID
- `POST /api/v1/projects/{project_id}/runs` - Enqueue a new run
- `PUT /api/v1/runs/{run_id}` - Update a run
- `DELETE /api/v1/runs/{run_id}` - Delete a run

## Running the Tests

Make sure the API is running first:

```bash
docker-compose up --build
```

Then run the test scripts:

```bash
# Install required packages
pip install requests

# Test Projects API
python tests/test_projects_api.py

# Test Runs API
python tests/test_runs_api.py
```

Each script will:
1. Test the API health endpoint
2. Run a full CRUD test sequence
3. Verify the results of each operation

## Manual Testing with curl

You can also test the API manually using curl:

### Projects API

```bash
# Health check
curl http://localhost:9000/health

# Get all projects
curl http://localhost:9000/api/v1/projects

# Create a project
curl -X POST http://localhost:9000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project", "description":"A test project"}'

# Get a project by ID (replace {id} with the actual project ID)
curl http://localhost:9000/api/v1/projects/{id}

# Update a project (replace {id} with the actual project ID)
curl -X PUT http://localhost:9000/api/v1/projects/{id} \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Project", "description":"An updated test project"}'

# Delete a project (replace {id} with the actual project ID)
curl -X DELETE http://localhost:9000/api/v1/projects/{id}
```

### Runs API

```bash
# Get all runs for a project (replace {project_id} with the actual project ID)
curl http://localhost:9000/api/v1/projects/{project_id}/runs

# Enqueue a new run (replace {project_id} with the actual project ID)
curl -X POST "http://localhost:9000/api/v1/projects/{project_id}/runs?url=https://example.com" \
  -H "Content-Type: application/json" \
  -d '{"config":{"selector":".content","wait_for":".loaded"}}'

# Get a run by ID (replace {run_id} with the actual run ID)
curl http://localhost:9000/api/v1/runs/{run_id}

# Update a run (replace {run_id} with the actual run ID)
curl -X PUT http://localhost:9000/api/v1/runs/{run_id} \
  -H "Content-Type: application/json" \
  -d '{"status":"cancelled","error":"Manually cancelled"}'

# Delete a run (replace {run_id} with the actual run ID)
curl -X DELETE http://localhost:9000/api/v1/runs/{run_id}
``` 