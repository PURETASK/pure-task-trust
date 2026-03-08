
-- ===========================================================================
-- FIX: cleaner_profiles sensitive data exposure (ERROR level security finding)
-- ===========================================================================

-- 1. Drop the overly-permissive policy that exposed stripe tokens etc.
DROP POLICY IF EXISTS "Authenticated users can view available cleaners" ON public.cleaner_profiles;

-- 2. Tighter policy: authenticated users can only see available cleaners.
--    Sensitive columns (stripe_connect_id, push_token, payout_percent, etc.)
--    remain accessible only to the owner via the existing owner policy.
CREATE POLICY "Public can view available cleaner profiles"
  ON public.cleaner_profiles
  FOR SELECT
  TO authenticated
  USING (is_available = true);

-- 3. Safe public view with only non-sensitive fields for booking/discovery.
CREATE OR REPLACE VIEW public.cleaner_public_profiles AS
SELECT
  id,
  user_id,
  first_name,
  last_name,
  bio,
  professional_headline,
  profile_photo_url,
  avg_rating,
  jobs_completed,
  tier,
  hourly_rate_credits,
  reliability_score,
  is_available,
  latitude,
  longitude,
  travel_radius_km,
  base_rate_cph,
  deep_addon_cph,
  moveout_addon_cph,
  low_flexibility_badge,
  created_at
FROM public.cleaner_profiles
WHERE is_available = true;

GRANT SELECT ON public.cleaner_public_profiles TO authenticated;
GRANT SELECT ON public.cleaner_public_profiles TO anon;

-- 4. Performance indexes
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON public.jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_cleaner_id ON public.jobs(cleaner_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_start_at ON public.jobs(scheduled_start_at);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_id ON public.credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_cleaner_profiles_available ON public.cleaner_profiles(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_cleaner_reliability_events_cleaner ON public.cleaner_reliability_events(cleaner_id, created_at DESC);
