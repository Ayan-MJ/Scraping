FROM python:3.10-slim

WORKDIR /app

# Install Poetry
RUN pip install poetry==1.4.2

# Copy poetry configuration files
COPY pyproject.toml ./

# Configure poetry to not use a virtual environment
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --without dev --no-interaction --no-ansi --no-root

# Install Playwright browsers
RUN apt-get update && apt-get install -y wget gnupg && \
    pip install playwright && \
    playwright install chromium && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy application code
COPY app/ ./app/

# Accept build arguments for Sentry and environment
ARG SENTRY_DSN
ARG ENVIRONMENT=production
ARG VERSION=1.0.0
ARG SERVER_NAME=scraping-wizard-api

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV SENTRY_DSN=${SENTRY_DSN}
ENV ENVIRONMENT=${ENVIRONMENT}
ENV VERSION=${VERSION}
ENV SERVER_NAME=${SERVER_NAME}

# Expose the API port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 