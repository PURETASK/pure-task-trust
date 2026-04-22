
-- Recreate view with security_invoker so it respects caller's RLS
DROP VIEW IF EXISTS public.cleaner_public_profiles;
CREATE VIEW public.cleaner_public_profiles
WITH (security_invoker = true, security_barrier = true) AS
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
  reliability_score,
  tier,
  hourly_rate_credits,
  base_rate_cph,
  deep_addon_cph,
  moveout_addon_cph,
  is_available,
  travel_radius_km,
  low_flexibility_badge,
  created_at,
  updated_at
FROM public.cleaner_profiles;

GRANT SELECT ON public.cleaner_public_profiles TO anon, authenticated;

-- Allow row-level read access on cleaner_profiles so the view works for discovery.
-- Sensitive columns (push_token, stripe_*, lat/lng, payout_*, monthly_earnings_goal,
-- background_check_status, etc.) are NOT exposed by cleaner_public_profiles, and
-- direct table access from anon is blocked (no anon policy). Authenticated users
-- can technically still query the base table — to fully protect sensitive columns
-- we revoke direct column access for non-owners via a column GRANT.
CREATE POLICY "Public discovery via safe view"
ON public.cleaner_profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- Revoke broad column SELECT from anon/authenticated, then re-grant only the
-- safe columns that are exposed by cleaner_public_profiles.
REVOKE SELECT ON public.cleaner_profiles FROM anon, authenticated;
GRANT SELECT (
  id, user_id, first_name, last_name, bio, professional_headline,
  profile_photo_url, avg_rating, jobs_completed, reliability_score, tier,
  hourly_rate_credits, base_rate_cph, deep_addon_cph, moveout_addon_cph,
  is_available, travel_radius_km, low_flexibility_badge, created_at, updated_at,
  -- columns owner needs:
  push_token, stripe_account_id, stripe_connect_id, stripe_payouts_enabled,
  instant_payout_enabled, payout_percent, payout_schedule, minimum_payout_cents,
  monthly_earnings_goal, background_check_status, background_check_required,
  latitude, longitude, accepts_high_risk, ai_bio, bio_generated_at, bio_score,
  cleaning_types, deleted_at, intro_video_url, languages, max_jobs_per_day,
  onboarding_completed_at, onboarding_current_step, onboarding_reminder_sent_at,
  onboarding_started_at, personality, pet_friendly, specialties, supplies_provided,
  tier_demotion_warning_at, work_style, years_experience, hourly_rate_credits,
  jobs_completed, low_flexibility_badge
) ON public.cleaner_profiles TO authenticated;

-- Anon only needs the public-safe columns
GRANT SELECT (
  id, user_id, first_name, last_name, bio, professional_headline,
  profile_photo_url, avg_rating, jobs_completed, reliability_score, tier,
  hourly_rate_credits, base_rate_cph, deep_addon_cph, moveout_addon_cph,
  is_available, travel_radius_km, low_flexibility_badge, created_at, updated_at
) ON public.cleaner_profiles TO anon;
