-- Create results table
CREATE TABLE IF NOT EXISTS public.results (
  id SERIAL PRIMARY KEY,
  run_id INT REFERENCES public.runs(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add the new columns for error tracking and retry functionality
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'success';
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Create index on run_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_results_run_id ON public.results(run_id);

-- Create index on status for filtering failed results
CREATE INDEX IF NOT EXISTS idx_results_status ON public.results(status);

-- Create index on url for retry operations
CREATE INDEX IF NOT EXISTS idx_results_url ON public.results(url);

-- Add RLS policies
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Policy for selecting results (anyone who can view the run can view its results)
CREATE POLICY select_results ON public.results
    FOR SELECT USING (true);

-- Policy for inserting results (only authenticated users)
CREATE POLICY insert_results ON public.results
    FOR INSERT WITH CHECK (
        auth.uid() = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid
    );

-- Policy for deleting results (only authenticated users)
CREATE POLICY delete_results ON public.results
    FOR DELETE USING (
        auth.uid() = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid
    );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.results TO authenticated;
GRANT SELECT ON public.results TO anon;

-- Update runs table to add records_extracted and finished_at columns if they don't exist
ALTER TABLE public.runs ADD COLUMN IF NOT EXISTS records_extracted INT DEFAULT 0;
ALTER TABLE public.runs ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP WITH TIME ZONE; 