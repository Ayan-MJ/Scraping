-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cron_expression TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    url TEXT,
    urls JSONB,
    config JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_run TIMESTAMP WITH TIME ZONE,
    last_error TEXT
);

-- Create index on project_id for faster queries
CREATE INDEX IF NOT EXISTS idx_schedules_project_id ON public.schedules(project_id);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_schedules_status ON public.schedules(status);

-- Add RLS policies
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Policy for selecting schedules (only authorized users can select)
CREATE POLICY select_schedules ON public.schedules
    FOR SELECT USING (
        auth.uid() = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid
    );

-- Policy for inserting schedules (only authorized users can insert)
CREATE POLICY insert_schedules ON public.schedules
    FOR INSERT WITH CHECK (
        auth.uid() = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid
    );

-- Policy for updating schedules (only authorized users can update)
CREATE POLICY update_schedules ON public.schedules
    FOR UPDATE USING (
        auth.uid() = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid
    );

-- Policy for deleting schedules (only authorized users can delete)
CREATE POLICY delete_schedules ON public.schedules
    FOR DELETE USING (
        auth.uid() = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid
    );

-- Update runs table to add a reference to schedules
ALTER TABLE public.runs ADD COLUMN IF NOT EXISTS schedule_id BIGINT REFERENCES public.schedules(id) ON DELETE SET NULL; 