#!/bin/bash

# Set environment variables
export API_URL="http://localhost:8000/api/v1"
export TEMPLATE_ID=""

echo "Testing Templates API"
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

# Test template creation
test_create() {
  echo "Testing template creation..."
  response=$(curl -s -X POST "$API_URL/templates" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Curl Test Template",
      "description": "A template created via curl",
      "thumbnail_url": "https://example.com/thumbnail.png",
      "selector_schema": {
        "title": {
          "selector": "h1.title",
          "type": "text"
        },
        "content": {
          "selector": "div.content",
          "type": "html"
        }
      }
    }')
  
  echo "$response" | jq
  TEMPLATE_ID=$(echo "$response" | jq -r '.id')
  echo "Created template with ID: $TEMPLATE_ID"
}

# Test getting all templates
test_get_all() {
  echo "Testing get all templates..."
  response=$(curl -s -X GET "$API_URL/templates")
  echo "$response" | jq
}

# Test getting a specific template
test_get_single() {
  echo "Testing get single template with ID $TEMPLATE_ID..."
  response=$(curl -s -X GET "$API_URL/templates/$TEMPLATE_ID")
  echo "$response" | jq
}

# Test updating a template
test_update() {
  echo "Testing template update..."
  response=$(curl -s -X PUT "$API_URL/templates/$TEMPLATE_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Updated Curl Template",
      "description": "This template was updated via curl"
    }')
  
  echo "$response" | jq
}

# Test seeding templates
test_seed() {
  echo "Testing template seeding..."
  response=$(curl -s -X POST "$API_URL/templates/seed")
  echo "$response" | jq
}

# Test template deletion
test_delete() {
  echo "Testing template deletion..."
  response=$(curl -s -X DELETE "$API_URL/templates/$TEMPLATE_ID" -w "%{http_code}")
  
  if [[ $response == "204" ]]; then
    echo "Template deleted successfully."
  else
    echo "Error deleting template: $response"
  fi
  
  # Verify template is gone
  response=$(curl -s -X GET "$API_URL/templates/$TEMPLATE_ID" -w "%{http_code}")
  if [[ $response == *"404"* ]]; then
    echo "Verified template is deleted (404 Not Found)."
  else
    echo "Template still exists: $response"
  fi
}

# Run all tests
check_api
test_seed
test_get_all
test_create
test_get_single
test_update
test_delete

echo "Tests completed." 