
-- Run this in your Supabase SQL Editor to support parallel builds

ALTER TABLE public.apps 
ADD COLUMN IF NOT EXISTS apk_status text DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS apk_progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS apk_message text,
-- download_url might already exist, but ensuring it does
ADD COLUMN IF NOT EXISTS download_url text,

ADD COLUMN IF NOT EXISTS android_source_status text DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS android_source_progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS android_source_message text,
ADD COLUMN IF NOT EXISTS android_source_url text,

ADD COLUMN IF NOT EXISTS ios_ipa_status text DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS ios_ipa_progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ios_ipa_message text,
ADD COLUMN IF NOT EXISTS ios_ipa_url text,

ADD COLUMN IF NOT EXISTS ios_source_status text DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS ios_source_progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ios_source_message text,
ADD COLUMN IF NOT EXISTS ios_source_url text;

-- Optional: Create an index for faster lookups if you query by these statuses
CREATE INDEX IF NOT EXISTS idx_apps_apk_status ON public.apps (apk_status);
