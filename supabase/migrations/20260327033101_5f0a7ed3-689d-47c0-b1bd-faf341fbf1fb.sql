
-- ============================================================
-- 1. cleaner_profiles: Remove overly permissive SELECT policies
-- ============================================================

-- Drop the anon wildcard policy
DROP POLICY IF EXISTS "Public can view cleaner profiles for discovery" ON public.cleaner_profiles;

-- Drop the broad authenticated wildcard policy
DROP POLICY IF EXISTS "Authenticated users can view cleaner profiles for discovery" ON public.cleaner_profiles;

-- The remaining policies already handle:
--   - "Cleaners can view own profile" / "cleaner_profiles_select_owner" (user_id = auth.uid())
--   - "Users can view own cleaner profile" (auth.uid() = user_id)
--   - Admin policies via has_role()

-- Add a scoped policy for authenticated users to read via the booking/discover flow
-- They can see basic profiles but only through the cleaner_public_profiles view (security_invoker=on).
-- For direct table access, authenticated users who are NOT the owner need admin role.

-- ============================================================
-- 2. cleaner_preferences: Remove broad authenticated SELECT
-- ============================================================

DROP POLICY IF EXISTS "cleaner_prefs_select_authenticated" ON public.cleaner_preferences;

-- Existing policies already cover:
--   - "Cleaners can manage own preferences" (owner)
--   - "cleaner_prefs_owner_all" (owner, authenticated)
--   - "Admins can manage all preferences" (admin)

-- ============================================================
-- 3. cleaner_additional_services: Remove anon/public wildcard SELECT
-- ============================================================

DROP POLICY IF EXISTS "additional_services_select_public" ON public.cleaner_additional_services;

-- Drop the broad authenticated wildcard too
DROP POLICY IF EXISTS "Authenticated users can view cleaner services for booking" ON public.cleaner_additional_services;

-- Add a scoped policy: authenticated users can view ENABLED services (for booking flow)
CREATE POLICY "Authenticated users can view enabled services for booking"
  ON public.cleaner_additional_services
  FOR SELECT
  TO authenticated
  USING (is_enabled = true);
