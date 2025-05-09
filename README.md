# Scraping Wizard

This project is a no-code web-scraping platform with a FastAPI backend and a modern frontend.

## Backend

The backend is a FastAPI application located in the `backend/` directory. It uses Supabase for its database, Celery for background task processing, Playwright for scraping, and Redis for Celery's message broker and real-time SSE event streaming.

### Environment Variables

Ensure you have a `.env` file in the root directory (or `backend/.env` if preferred by your setup, but root is common for Docker Compose). Key variables for the backend include:

```env
# Supabase
SUPABASE_URL="your_supabase_url"
SUPABASE_KEY="your_supabase_service_role_key" # Service role key for backend operations
SUPABASE_ANON_KEY="your_supabase_anon_key"   # Anon key if used directly by any service

# PostgreSQL connection string (derived from Supabase usually)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-DB-HOST]:5432/postgres"

# Celery
CELERY_BROKER_URL="redis://localhost:6379/0"
CELERY_RESULT_BACKEND="redis://localhost:6379/0"

# Redis for SSE
REDIS_URL="redis://localhost:6379/1" # Using a different DB for SSE, or same as Celery

# API
API_V1_STR="/api/v1"
# Add other relevant backend settings...
```

**Note on REDIS_URL for SSE:** The `REDIS_URL` is used by the application to connect to Redis for publishing and subscribing to Server-Sent Events. The example above uses Redis database `1`. You can use the same Redis instance as Celery, but it's often good practice to use a different database number for different purposes if possible.

### Running with Docker Compose

The project includes a `docker-compose.yml` file.

1.  **Prerequisites:**
    *   Docker and Docker Compose installed.
    *   A `.env` file configured with your Supabase credentials and other settings.

2.  **Start Services:**
    ```bash
    docker-compose up -d
    ```
    This will typically start:
    *   The FastAPI backend service.
    *   A Redis service (if defined in `docker-compose.yml`).
    *   A Celery worker service.
    *   Potentially a Postgres database (though Supabase is cloud-hosted, you might run a local Postgres for other dev purposes).

    **If Redis is not part of your `docker-compose.yml`:**
    You'll need to ensure a Redis instance is running and accessible to the backend and worker. You can run Redis locally using Docker:
    ```bash
    docker run -d -p 6379:6379 --name local-redis redis:latest
    ```
    Then, update your `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`, and `REDIS_URL` in your `.env` file accordingly (e.g., `redis://localhost:6379/0`).

### Real-time Scraping Events (SSE)

The backend provides a Server-Sent Events (SSE) endpoint to stream real-time progress and results for a scraping run.

*   **Endpoint:** `GET /api/v1/runs/{run_id}/stream`

#### Testing SSE with JavaScript EventSource

You can test the SSE endpoint using JavaScript's `EventSource` API in your browser's developer console or a simple HTML file.

1.  Start a scrape run through the API to get a `run_id`.
2.  Replace `{your_run_id}` with the actual ID and `{your_api_base_url}` (e.g., `http://localhost:8000`) if needed.

```javascript
const runId = {your_run_id}; // Replace with an actual run ID
const apiUrl = `{your_api_base_url}/api/v1/runs/${runId}/stream`; // Adjust base URL if needed

console.log(`Connecting to SSE endpoint: ${apiUrl}`);
const eventSource = new EventSource(apiUrl);

eventSource.onopen = function() {
    console.log("SSE Connection opened.");
};

eventSource.onmessage = function(event) {
    console.log("Raw message received:", event);
    // Events published by the worker have a nested structure.
    // The `event.data` will be a JSON string like:
    // '{"type":"record","data":{"url":"...","title":"...",...}}'
    // or '{"type":"status","data":{"records_extracted":1,"status":"running"}}'
    // You should parse event.data to get the actual payload.
    
    try {
        const parsedData = JSON.parse(event.data);
        console.log("Parsed data:", parsedData);

        if (parsedData.type === "record") {
            console.log("New Record:", parsedData.data);
            // Update your UI with the new record
        } else if (parsedData.type === "status") {
            console.log("Status Update:", parsedData.data);
            // Update UI with new status (e.g., records_extracted, status message)
        } else if (parsedData.type === "complete") {
            console.log("Run Complete:", parsedData.data);
            // Final update, maybe close connection or display summary
            eventSource.close(); // Close connection after completion
        } else if (parsedData.type === "error") {
            console.error("SSE Error Event:", parsedData.data);
        }

    } catch (e) {
        console.error("Error parsing SSE event data:", e, "Raw data:", event.data);
    }
};

// Specific event types (if your SSE router yields event: field)
// The current sse-starlette implementation in stream.py yields named events
eventSource.addEventListener('record', function(event) {
    console.log('Named Event - Record:', JSON.parse(event.data));
});

eventSource.addEventListener('status', function(event) {
    console.log('Named Event - Status:', JSON.parse(event.data));
});

eventSource.addEventListener('complete', function(event) {
    console.log('Named Event - Complete:', JSON.parse(event.data));
    eventSource.close();
});

eventSource.addEventListener('ping', function(event) {
    console.log('Ping received:', JSON.parse(event.data));
});


eventSource.onerror = function(error) {
    console.error("EventSource failed:", error);
    eventSource.close(); // Close on error
};

// To close the connection manually:
// eventSource.close();
```

This snippet will log events to the console as they are streamed from the backend during a scrape run.

## Frontend

(Details about the frontend application can be added here)

## Contributing

(Details about how to contribute can be added here) 