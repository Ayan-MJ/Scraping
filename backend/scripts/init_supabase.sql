-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add some sample data
INSERT INTO projects (name, description) VALUES
    ('Sample Project 1', 'This is a sample project for testing'),
    ('Sample Project 2', 'Another sample project for the API')
ON CONFLICT (id) DO NOTHING;

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- First drop the trigger if it exists
DROP TRIGGER IF EXISTS set_timestamp ON projects;

-- Then create the trigger
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp(); 