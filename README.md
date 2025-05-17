# Scraping Wizard

A web scraping platform with a FastAPI backend and Next.js frontend.

## Project Structure

- `backend/`: FastAPI service, Celery worker, Playwright
- `frontend/`: Next.js (App Router), TypeScript, React Query, Tailwind

## Development

### Backend

The backend is a FastAPI application that uses Supabase for its database, Celery for background task processing, Playwright for scraping, and Redis for Celery's message broker and real-time SSE event streaming.

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Environment Variables

Ensure you have a `.env` file in the root directory. Key variables for the backend include:

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
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## CI/CD

This project includes CI/CD pipelines for both backend and frontend. See [CICD.md](backend/CICD.md) for details on the backend CI/CD setup.

## Monitoring

For information on monitoring and error tracking, see [MONITORING.md](MONITORING.md).

## Running with Docker Compose

The project includes a `docker-compose.yml` file.

1. **Prerequisites:**
   * Docker and Docker Compose installed.
   * A `.env` file configured with your Supabase credentials and other settings.

2. **Start Services:**
   ```bash
   docker-compose up -d
   ```

## Real-time Scraping Events (SSE)

The backend provides a Server-Sent Events (SSE) endpoint to stream real-time progress and results for a scraping run.

* **Endpoint:** `GET /api/v1/runs/{run_id}/stream`

## Deployment

The backend is now deployed on [Render.com](https://render.com/). The previous AWS ECS deployment is deprecated.

### Frontend API URL
After deploying the backend, update the `NEXT_PUBLIC_API_URL` in `frontend/.env` to the Render.com backend URL (e.g., `https://your-backend-service.onrender.com/api/v1`).

## License

MIT 