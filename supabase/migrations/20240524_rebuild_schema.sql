
-- Full schema rebuild script
-- Run this in Supabase SQL Editor to restore the table structure if you deleted it.

-- 1. Create the table if it doesn't exist (ensures structure)
CREATE TABLE IF NOT EXISTS public.apps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- User & Identity
    user_id uuid NOT NULL,
    name text NOT NULL,
    package_name text,
    website_url text NOT NULL,
    icon_url text,
    
    -- Status & Metadata
    status text DEFAULT 'building',
    build_format text DEFAULT 'apk',
    notification_email text,
    github_run_id text,
    
    -- Config JSON
    config jsonb DEFAULT '{}'::jsonb,
    
    -- Legacy Config Columns (Kept for search/filtering)
    primary_color text,
    navigation boolean DEFAULT true,
    pull_to_refresh boolean DEFAULT true,
    orientation text DEFAULT 'auto',
    enable_zoom boolean DEFAULT false,
    keep_awake boolean DEFAULT false,
    open_external_links boolean DEFAULT true,

    -- Parallel Build Columns (Crucial for the new build system)
    apk_status text DEFAULT 'idle',
    apk_progress integer DEFAULT 0,
    apk_message text,
    apk_url text,
    download_url text,

    android_source_status text DEFAULT 'idle',
    android_source_progress integer DEFAULT 0,
    android_source_message text,
    android_source_url text,

    ios_ipa_status text DEFAULT 'idle',
    ios_ipa_progress integer DEFAULT 0,
    ios_ipa_message text,
    ios_ipa_url text,

    ios_source_status text DEFAULT 'idle',
    ios_source_progress integer DEFAULT 0,
    ios_source_message text,
    ios_source_url text
);

-- 2. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON public.apps(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON public.apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON public.apps(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies (Drop existing to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Users can view their own apps" ON public.apps;
DROP POLICY IF EXISTS "Users can insert their own apps" ON public.apps;
DROP POLICY IF EXISTS "Users can update their own apps" ON public.apps;
DROP POLICY IF EXISTS "Users can delete their own apps" ON public.apps;

CREATE POLICY "Users can view their own apps" ON public.apps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own apps" ON public.apps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own apps" ON public.apps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own apps" ON public.apps
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Profile Table (Optional, ensures it exists for the UserMenu/ProfileModal)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
