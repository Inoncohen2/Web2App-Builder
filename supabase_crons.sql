
-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 1. CLEANUP JOB
-- Runs every day at 3:00 AM
-- Deletes 'guest' apps (no user_id) created more than 24 hours ago to save space.
SELECT cron.schedule(
  'cleanup-guest-apps',
  '0 3 * * *', 
  $$
    DELETE FROM public.apps 
    WHERE user_id IS NULL 
    AND created_at < now() - interval '24 hours';
  $$
);

-- 2. SYNC BUILDS JOB
-- Runs every 10 minutes
-- Calls the Edge Function to check GitHub status for stuck builds.
-- IMPORTANT: Replace [YOUR_PROJECT_REF] and [YOUR_SERVICE_ROLE_KEY] with your actual Supabase project details.
SELECT cron.schedule(
  'sync-build-status',
  '*/10 * * * *',
  $$
    select
      net.http_post(
          url:='https://[YOUR_PROJECT_REF].supabase.co/functions/v1/sync-builds',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer [YOUR_SERVICE_ROLE_KEY]"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);
