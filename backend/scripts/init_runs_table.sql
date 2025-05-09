-- Create runs table
CREATE TABLE IF NOT EXISTS runs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    config JSONB,
    url TEXT,
    urls JSONB,
    results JSONB,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_runs_project_id ON runs(project_id);

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to runs table
DROP TRIGGER IF EXISTS set_timestamp_runs ON runs;
CREATE TRIGGER set_timestamp_runs
BEFORE UPDATE ON runs
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Add sample data
INSERT INTO runs (project_id, status, url, config, results)
VALUES 
(1, 'completed', 'https://example.com', 
 '{"selector": ".main-content", "wait_for": ".loaded"}', 
 '{"https://example.com": {"status_code": 200, "content_length": 1024, "title": "Example Domain"}}'),
(1, 'failed', 'https://nonexistent-domain.example', 
 '{"selector": ".content", "wait_for": ".ready"}', 
 NULL); 