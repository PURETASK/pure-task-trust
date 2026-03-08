
-- Fix: recreate cleaner_public_profiles with security_invoker=true
-- so the view respects the querying user's RLS policies, not the creator's.
DROP VIEW IF EXISTS public.cleaner_public_profiles;

CREATE OR REPLACE VIEW public.cleaner_public_profiles
  WITH (security_invoker = true)
AS
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
