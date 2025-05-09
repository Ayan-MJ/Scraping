-- Create templates table
CREATE TABLE IF NOT EXISTS public.templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  selector_schema JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_templates_name ON public.templates(name);

-- Add RLS policies
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Policy for selecting templates (anyone can select)
CREATE POLICY select_templates ON public.templates
    FOR SELECT USING (true);

-- Policy for inserting templates (only authenticated users)
CREATE POLICY insert_templates ON public.templates
    FOR INSERT WITH CHECK (
        auth.uid() = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid
    );

-- Policy for updating templates (only authenticated users)
CREATE POLICY update_templates ON public.templates
    FOR UPDATE USING (
        auth.uid() = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid
    );

-- Policy for deleting templates (only authenticated users)
CREATE POLICY delete_templates ON public.templates
    FOR DELETE USING (
        auth.uid() = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid
    );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT SELECT ON public.templates TO anon; 