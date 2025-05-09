#!/bin/bash

# Set environment variables
export API_URL="http://localhost:8000/api/v1"
export PROJECT_ID=""
export RUN_ID=""

echo "Testing Results API"
echo "=============================================="

# Function to check if API is running
check_api() {
  echo "Checking if API is running..."
  health_response=$(curl -s http://localhost:8000/health)
  if [[ $health_response == *"Scraping Wizard API is running"* ]]; then
    echo "API is running."
    return 0
  else
    echo "API is not running. Please start the API server first."
    exit 1
  fi
}

# Create a project if needed
create_project() {
  echo "Creating a test project..."
  response=$(curl -s -X POST "$API_URL/projects" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Project for Results API",
      "description": "A project to test the Results API"
    }')
  
  PROJECT_ID=$(echo "$response" | jq -r '.id')
  echo "Created project with ID: $PROJECT_ID"
}

# Create a run
create_run() {
  echo "Creating a test run..."
  response=$(curl -s -X POST "$API_URL/projects/$PROJECT_ID/runs" \
    -H "Content-Type: application/json" \
    -d '{
      "url": "https://example.com",
      "config": {
        "selector_schema": {
          "title": {
            "selector": "h1",
            "type": "text"
          },
          "description": {
            "selector": "p",
            "type": "text"
          }
        }
      }
    }')
  
  RUN_ID=$(echo "$response" | jq -r '.id')
  echo "Created run with ID: $RUN_ID"
}

# Check run status
check_run_status() {
  echo "Checking run status..."
  response=$(curl -s -X GET "$API_URL/runs/$RUN_ID")
  status=$(echo "$response" | jq -r '.status')
  echo "Run status: $status"
  
  # Wait for run to complete if it's still running
  while [[ "$status" == "running" || "$status" == "pending" ]]; do
    echo "Run is still processing. Waiting 5 seconds..."
    sleep 5
    response=$(curl -s -X GET "$API_URL/runs/$RUN_ID")
    status=$(echo "$response" | jq -r '.status')
    echo "Run status: $status"
  done
}

# Get results for a run
get_results() {
  echo "Getting results for run $RUN_ID..."
  response=$(curl -s -X GET "$API_URL/runs/$RUN_ID/results")
  echo "$response" | jq
  
  # Count results
  count=$(echo "$response" | jq length)
  echo "Found $count result(s)"
}

# Run all tests
check_api
create_project
create_run
check_run_status
get_results

echo "Tests completed." 