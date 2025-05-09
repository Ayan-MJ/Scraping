FROM python:3.10-slim

WORKDIR /app

# Install Poetry
RUN pip install poetry==1.4.2

# Copy poetry configuration files
COPY pyproject.toml ./

# Configure poetry to not use a virtual environment
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-dev --no-interaction --no-ansi

# Install Playwright browsers
RUN apt-get update && apt-get install -y wget gnupg && \
    pip install playwright && \
    playwright install chromium && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy application code
COPY app/ ./app/

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expose the API port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 