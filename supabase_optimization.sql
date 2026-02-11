
-- Recommended Indexes for Web2App Builder

-- 1. Index on `apps.user_id` for faster Dashboard loading
-- This is critical because the dashboard filters by user_id constantly.
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON public.apps (user_id);

-- 2. Index on `apps.created_at` for sorting
-- The history modal orders projects by date descending.
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON public.apps (created_at DESC);

-- 3. Composite Index for Search in History
-- Optimizes searching by name or url within a user's apps.
CREATE INDEX IF NOT EXISTS idx_apps_search ON public.apps (name text_pattern_ops, website_url text_pattern_ops);

-- 4. Index on `profiles.id` (Primary Key is usually indexed, but ensure for Joins)
-- Supabase handles PK indexes automatically, but useful to verify if doing heavy joins.

-- 5. RLS Policies Check (Optional)
-- Ensure RLS policies use the index. 
-- Example: CREATE POLICY "Enable read for users based on user_id" ON "public"."apps" FOR SELECT USING (auth.uid() = user_id);
-- The index `idx_apps_user_id` directly optimizes this policy.
