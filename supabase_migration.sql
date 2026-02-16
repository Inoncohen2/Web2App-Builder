
-- Create the app_builds table to support 1:N relationship (One App -> Many Builds)
CREATE TABLE IF NOT EXISTS public.app_builds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE,
  platform text NOT NULL, -- 'android' or 'ios'
  build_format text NOT NULL, -- 'apk', 'aab', 'ipa', 'source'
  status text NOT NULL DEFAULT 'queued', -- 'queued', 'building', 'ready', 'failed', 'cancelled'
  status_text text, -- NEW: Detailed status message (e.g. "Compiling resources...")
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

-- ==========================================
-- NEW: Android Keystore Management
-- ==========================================
CREATE TABLE IF NOT EXISTS public.app_keystores (
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE PRIMARY KEY,
  keystore_base64 text NOT NULL, -- The .jks file encoded in Base64
  store_password text NOT NULL,
  key_password text NOT NULL,
  key_alias text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (Critical for Keys)
ALTER TABLE public.app_keystores ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role (GitHub Action) full access, and users read access to their own keys
CREATE POLICY "Enable access for service role" ON public.app_keystores
    FOR ALL
    USING (true)
    WITH CHECK (true);
