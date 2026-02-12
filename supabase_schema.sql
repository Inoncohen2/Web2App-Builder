
-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Syncs with Auth)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles (Drop first to avoid "policy already exists" errors)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Function to handle new user signup automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. APPS TABLE (Main Application Logic)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.apps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Core Identity
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  package_name TEXT,
  package_id TEXT, -- Sometimes used interchangeably with package_name in backend
  icon_url TEXT,
  
  -- Build Status & Metadata
  status TEXT DEFAULT 'idle', -- idle, building, ready, failed, cancelled
  build_format TEXT DEFAULT 'apk', -- apk, aab, source
  progress INTEGER DEFAULT 0,
  build_message TEXT,
  github_run_id BIGINT,
  notification_email TEXT,
  
  -- Artifacts
  apk_url TEXT,
  download_url TEXT,
  
  -- Top-Level Configuration Columns (Mirrored for performance/queries)
  primary_color TEXT DEFAULT '#000000',
  navigation BOOLEAN DEFAULT true,
  pull_to_refresh BOOLEAN DEFAULT true,
  orientation TEXT DEFAULT 'auto',
  enable_zoom BOOLEAN DEFAULT false,
  keep_awake BOOLEAN DEFAULT false,
  open_external_links BOOLEAN DEFAULT true,
  
  -- Full JSON Configuration (Stores everything including themeMode, splash settings, etc.)
  config JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON public.apps (user_id);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON public.apps (created_at DESC);

-- Turn on Row Level Security
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Policies for Apps
DROP POLICY IF EXISTS "Users can view their own apps" ON public.apps;
CREATE POLICY "Users can view their own apps" 
  ON public.apps FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own apps" ON public.apps;
CREATE POLICY "Users can insert their own apps" 
  ON public.apps FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own apps" ON public.apps;
CREATE POLICY "Users can update their own apps" 
  ON public.apps FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own apps" ON public.apps;
CREATE POLICY "Users can delete their own apps" 
  ON public.apps FOR DELETE 
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. STORAGE (For App Icons)
-- -----------------------------------------------------------------------------
-- Note: You usually create buckets in the UI, but this SQL sets up the row in the storage.buckets table.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-icons', 'app-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Allow public access to view icons
DROP POLICY IF EXISTS "Give public access to app-icons" ON storage.objects;
CREATE POLICY "Give public access to app-icons" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'app-icons');

-- Allow authenticated users to upload icons
DROP POLICY IF EXISTS "Allow authenticated uploads to app-icons" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to app-icons" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'app-icons' AND auth.role() = 'authenticated');

-- Allow users to update their own icons
DROP POLICY IF EXISTS "Allow users to update/delete icons" ON storage.objects;
CREATE POLICY "Allow users to update/delete icons" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'app-icons' AND auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 4. UTILITIES
-- -----------------------------------------------------------------------------

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_apps_updated ON public.apps;
CREATE TRIGGER on_apps_updated
  BEFORE UPDATE ON public.apps
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
