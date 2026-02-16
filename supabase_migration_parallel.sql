
-- Create the app_builds table for parallel build tracking
CREATE TABLE IF NOT EXISTS public.app_builds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
    build_type TEXT NOT NULL CHECK (build_type IN ('apk', 'aab', 'source', 'ios_ipa', 'ios_source')),
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'building', 'processing', 'ready', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0,
    download_url TEXT,
    build_message TEXT,
    github_run_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Index for fast lookups by app_id (Dashboard filtering)
CREATE INDEX IF NOT EXISTS idx_app_builds_app_id ON public.app_builds(app_id);

-- Create Index for sorting history quickly
CREATE INDEX IF NOT EXISTS idx_app_builds_created_at ON public.app_builds(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.app_builds ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view builds for their own apps
CREATE POLICY "Users can view their own app builds" 
ON public.app_builds FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.apps 
        WHERE apps.id = app_builds.app_id 
        AND apps.user_id = auth.uid()
    )
);

-- Policy: Users can insert builds for their own apps
CREATE POLICY "Users can create builds for their own apps" 
ON public.app_builds FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.apps 
        WHERE apps.id = app_builds.app_id 
        AND apps.user_id = auth.uid()
    )
);

-- Policy: Service Role (Admin) has full access
-- (Supabase Service Role bypasses RLS by default, but good for clarity if using specific roles)
