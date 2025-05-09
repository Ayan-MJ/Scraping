#!/bin/bash

# Script to run all SQL migrations against a local Supabase instance
# Usage: ./run_migrations.sh

# Configuration
SUPABASE_URL="http://localhost:54321"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
SCRIPT_DIR="$(dirname "$0")"

echo "Starting migration process..."

run_migration() {
  local migration_file="$1"
  echo "Running migration: $migration_file"
  
  # Read the SQL file
  local sql_content=$(<"$migration_file")
  
  # Run the SQL via the Supabase API
  curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/sql" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -d "{\"query\": \"${sql_content}\"}"
    
  echo -e "\nMigration completed: $migration_file\n"
}

# Run the initialization scripts first
echo "Running initialization scripts..."
run_migration "${SCRIPT_DIR}/init_supabase.sql"
run_migration "${SCRIPT_DIR}/init_runs_table.sql"
run_migration "${SCRIPT_DIR}/init_templates_table.sql"

# Run the migration files from supabase/migrations
echo "Running migration files..."
for migration_file in "$SCRIPT_DIR"/../supabase/migrations/*.sql; do
  run_migration "$migration_file"
done

echo "All migrations completed!"

# Open the Supabase Studio in the default browser
echo "Opening Supabase Studio at http://localhost:54323"
open http://localhost:54323 