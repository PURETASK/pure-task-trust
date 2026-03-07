
-- ============================================================
-- SECURITY: Tighten overly permissive public RLS policies
-- ============================================================

-- 1. cleaner_profiles: Replace "Public can view available cleaners" with
--    "Authenticated users can view available cleaners"
DROP POLICY IF EXISTS "Public can view available cleaners" ON public.cleaner_profiles;
CREATE POLICY "Authenticated users can view available cleaners"
  ON public.cleaner_profiles
  FOR SELECT
  TO authenticated
  USING (is_available = true OR auth.uid() = user_id);

-- 2. cleaner_additional_services: Require authentication to view
DROP POLICY IF EXISTS "Anyone can view cleaner services for booking" ON public.cleaner_additional_services;
CREATE POLICY "Authenticated users can view cleaner services for booking"
  ON public.cleaner_additional_services
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. cleaner_custom_services: Require authentication to view
DROP POLICY IF EXISTS "Anyone can view custom services for booking" ON public.cleaner_custom_services;
CREATE POLICY "Authenticated users can view custom services for booking"
  ON public.cleaner_custom_services
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. cleaner_teams: Require authentication to view
DROP POLICY IF EXISTS "Public can view active teams" ON public.cleaner_teams;
CREATE POLICY "Authenticated users can view active teams"
  ON public.cleaner_teams
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 5. referral_codes: Restrict to owner + active codes for authenticated users only
DROP POLICY IF EXISTS "Public can view active codes" ON public.referral_codes;
CREATE POLICY "Authenticated users can view active referral codes"
  ON public.referral_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_active = true);

-- 6. cleaner_service_areas: Require authentication during booking flows
DROP POLICY IF EXISTS "Public can view service areas" ON public.cleaner_service_areas;
CREATE POLICY "Authenticated users can view service areas"
  ON public.cleaner_service_areas
  FOR SELECT
  TO authenticated
  USING (true);
