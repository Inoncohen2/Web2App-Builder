
-- Create App Builds Table for Parallel Tracks
CREATE TABLE IF NOT EXISTS public.app_builds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
    build_type TEXT NOT NULL, -- 'android_app', 'android_source', 'ios_app', 'ios_source'
    build_format TEXT NOT NULL, -- 'apk', 'aab', 'source', 'ipa'
    status TEXT DEFAULT 'queued', -- 'queued', 'building', 'ready', 'failed', 'cancelled'
    progress INTEGER DEFAULT 0,
    download_url TEXT,
    build_message TEXT,
    github_run_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_builds_app_id ON public.app_builds(app_id);
CREATE INDEX IF NOT EXISTS idx_app_builds_created_at ON public.app_builds(created_at DESC);

-- RLS Policies (Assuming basic authenticated access matches parent app logic)
ALTER TABLE public.app_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view builds for their apps" 
ON public.app_builds FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.apps 
        WHERE apps.id = app_builds.app_id 
        AND apps.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert builds for their apps" 
ON public.app_builds FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.apps 
        WHERE apps.id = app_builds.app_id 
        AND apps.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update builds for their apps" 
ON public.app_builds FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.apps 
        WHERE apps.id = app_builds.app_id 
        AND apps.user_id = auth.uid()
    )
);
