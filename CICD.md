# CI/CD Setup for Scraping Wizard

This project uses GitHub Actions for continuous integration and continuous deployment.

## Workflows

### Frontend CI/CD

**File**: `.github/workflows/frontend.yml`

This workflow handles the frontend application deployment:

1. Triggers on push and pull requests to the `main` branch
2. Sets up Node.js environment
3. Installs dependencies
4. Runs linting and tests
5. Builds the application
6. Deploys to Vercel (on push to main only)

### Backend CI/CD

**File**: `.github/workflows/backend.yml`

This workflow handles the backend API deployment:

1. Triggers on push and pull requests to the `main` branch
2. Sets up Python environment
3. Installs Poetry and dependencies
4. Runs linting and tests
5. Builds a Docker image
6. Pushes the image to GitHub Container Registry
7. Deploys to AWS ECS (on push to main only)

## Required Secrets

You need to set up the following secrets in your GitHub repository:

### Frontend Deployment

- `VERCEL_TOKEN`: Your Vercel authentication token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

### Backend Deployment

- `CR_PAT`: GitHub Container Registry personal access token
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `ECS_CLUSTER`: ECS cluster name
- `ECS_SERVICE`: ECS service name

## Setting Up Secrets

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets" > "Actions"
3. Click "New repository secret"
4. Add each of the required secrets listed above

## Manual Deployment

If you need to deploy manually:

### Frontend

```bash
cd frontend
npm ci
npm run build
# Use Vercel CLI
vercel --prod
```

### Backend

```bash
cd backend
docker build -t scraping-wizard-api .
docker tag scraping-wizard-api ghcr.io/your-username/scraping-wizard-api:latest
docker push ghcr.io/your-username/scraping-wizard-api:latest
# Then update ECS service via AWS CLI or console
``` 