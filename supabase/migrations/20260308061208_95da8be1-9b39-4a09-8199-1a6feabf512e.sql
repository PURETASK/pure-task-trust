-- 1. FIX: cleaner_profiles - remove broad public policy exposing Stripe/push tokens
DROP POLICY IF EXISTS "Public can view available cleaner profiles" ON public.cleaner_profiles;
DROP POLICY IF EXISTS "Authenticated users can view available cleaners" ON public.cleaner_profiles;
DROP POLICY IF EXISTS "Cleaners can view own profile" ON public.cleaner_profiles;
CREATE POLICY "Cleaners can view own profile" ON public.cleaner_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can view all cleaner profiles" ON public.cleaner_profiles;
CREATE POLICY "Admins can view all cleaner profiles" ON public.cleaner_profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. Rebuild cleaner_public_profiles view (safe subset - no Stripe/push/payout data)
DROP VIEW IF EXISTS public.cleaner_public_profiles CASCADE;
CREATE OR REPLACE VIEW public.cleaner_public_profiles WITH (security_invoker = true) AS
  SELECT id, user_id, first_name, last_name, bio, professional_headline, profile_photo_url,
    avg_rating, jobs_completed, reliability_score, tier, hourly_rate_credits,
    base_rate_cph, deep_addon_cph, moveout_addon_cph, is_available,
    travel_radius_km, latitude, longitude, low_flexibility_badge, created_at, updated_at
  FROM public.cleaner_profiles;
GRANT SELECT ON public.cleaner_public_profiles TO authenticated;
GRANT SELECT ON public.cleaner_public_profiles TO anon;

-- 3. FIX: ab_test_assignments - remove catch-all (anonymous_id IS NOT NULL) exposing all rows
DROP POLICY IF EXISTS "Users can read own assignments" ON public.ab_test_assignments;
CREATE POLICY "Users can read own assignments" ON public.ab_test_assignments FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 4. FIX: add missing column that check-background-expiry edge function needs
ALTER TABLE public.background_checks ADD COLUMN IF NOT EXISTS expiry_warning_sent_at TIMESTAMPTZ DEFAULT NULL;

-- 5. Ensure job_status_history exists for full audit trail
CREATE TABLE IF NOT EXISTS public.job_status_history (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by_type TEXT NOT NULL DEFAULT 'system',
  changed_by_id UUID,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can view own job history" ON public.job_status_history;
CREATE POLICY "Authenticated can view own job history" ON public.job_status_history FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.jobs j WHERE j.id = job_id AND (
      j.client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
      j.cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()) OR
      public.has_role(auth.uid(), 'admin')
    )
  ));
DROP POLICY IF EXISTS "System can insert job history" ON public.job_status_history;
CREATE POLICY "System can insert job history" ON public.job_status_history FOR INSERT TO authenticated WITH CHECK (true);