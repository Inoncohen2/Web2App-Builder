
-- העתק את הקוד הזה והרץ אותו ב-Supabase SQL Editor

-- 1. הוספת עמודות חסרות (אם לא קיימות)
ALTER TABLE public.apps 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS build_message TEXT,
ADD COLUMN IF NOT EXISTS github_run_id BIGINT,
ADD COLUMN IF NOT EXISTS build_format TEXT DEFAULT 'apk',
ADD COLUMN IF NOT EXISTS notification_email TEXT,
ADD COLUMN IF NOT EXISTS package_name TEXT,
ADD COLUMN IF NOT EXISTS download_url TEXT,
ADD COLUMN IF NOT EXISTS apk_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- 2. עדכון סטטוסים ישנים (טיפול בערכי NULL)
UPDATE public.apps SET status = 'idle' WHERE status IS NULL;

-- 3. יצירת אינדקסים לביצועים (Performance Optimization)

-- קריטי: טעינת הדאשבורד לפי משתמש (מונע איטיות כשיש הרבה משתמשים)
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON public.apps (user_id);

-- חשוב: מיון היסטוריית פרויקטים לפי תאריך (מהחדש לישן)
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON public.apps (created_at DESC);

-- מומלץ: חיפוש מהיר לפי שם אפליקציה או כתובת אתר (עבור ה-History Modal)
CREATE INDEX IF NOT EXISTS idx_apps_search ON public.apps (name text_pattern_ops, website_url text_pattern_ops);
