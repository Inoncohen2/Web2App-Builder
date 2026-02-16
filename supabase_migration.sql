
-- Create the app_builds table to support 1:N relationship (One App -> Many Builds)
CREATE TABLE IF NOT EXISTS public.app_builds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE,
  platform text NOT NULL, -- 'android' or 'ios'
  build_format text NOT NULL, -- 'apk', 'aab', 'ipa', 'source'
  status text NOT NULL DEFAULT 'queued', -- 'queued', 'building', 'ready', 'failed', 'cancelled'
  github_run_id bigint,
  download_url text,
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for faster querying by app_id (Dashboard load)
CREATE INDEX IF NOT EXISTS idx_app_builds_app_id ON public.app_builds(app_id);

-- Index for platform checks
CREATE INDEX IF NOT EXISTS idx_app_builds_platform ON public.app_builds(app_id, platform);

-- Enable Realtime for this table
alter publication supabase_realtime add table public.app_builds;
