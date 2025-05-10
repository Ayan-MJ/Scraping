-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add some sample data with fake user IDs
-- In real-world usage, these would be actual user_id values from Supabase Auth
INSERT INTO projects (name, description, user_id) VALUES
    ('Sample Project 1', 'This is a sample project for testing', '00000000-0000-0000-0000-000000000001'),
    ('Sample Project 2', 'Another sample project for the API', '00000000-0000-0000-0000-000000000002')
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