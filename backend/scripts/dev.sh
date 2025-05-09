#!/bin/bash

# Usage message
usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Run the development server with different configurations"
  echo ""
  echo "Options:"
  echo "  --inmem, -i    Use in-memory database (for testing without Supabase)"
  echo "  --supabase, -s Use Supabase database (default)"
  echo "  --env FILE     Specify a custom .env file"
  echo "  --help, -h     Display this help message"
  exit 1
}

# Default values
USE_INMEM_DB="false"
ENV_FILE=".env"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --inmem|-i)
      USE_INMEM_DB="true"
      shift
      ;;
    --supabase|-s)
      USE_INMEM_DB="false"
      shift
      ;;
    --env)
      ENV_FILE="$2"
      shift 2
      ;;
    --help|-h)
      usage
      ;;
    *)
      echo "Unknown option: $1"
      usage
      ;;
  esac
done

# Load environment variables
if [[ -f "$ENV_FILE" ]]; then
  echo "Loading environment from $ENV_FILE"
  export $(grep -v '^#' "$ENV_FILE" | xargs)
else
  echo "Warning: $ENV_FILE not found. Using default configuration."
fi

# Override with command line settings
export USE_INMEM_DB="$USE_INMEM_DB"

echo "Starting development server with USE_INMEM_DB=$USE_INMEM_DB"

# Create a directory for the GitHub workflow if it doesn't exist
mkdir -p $(dirname $(pwd))/.github/workflows

# Run the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 