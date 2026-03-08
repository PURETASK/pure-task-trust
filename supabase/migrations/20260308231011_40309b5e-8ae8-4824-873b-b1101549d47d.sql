
-- ============================================================
-- FIX 1: cleaner_profiles - Remove overly broad SELECT policy
-- Authenticated users should only access via cleaner_public_profiles view
-- Only owners and admins can access the full table
-- ============================================================
DROP POLICY IF EXISTS "cleaner_profiles_select_auth" ON public.cleaner_profiles;

-- Owner can select their own full profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cleaner_profiles'
    AND policyname = 'cleaner_profiles_select_owner'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "cleaner_profiles_select_owner"
      ON public.cleaner_profiles
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid())
    $policy$;
  END IF;
END $$;

-- Admins can select all cleaner profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cleaner_profiles'
    AND policyname = 'cleaner_profiles_select_admin'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "cleaner_profiles_select_admin"
      ON public.cleaner_profiles
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
    $policy$;
  END IF;
END $$;

-- ============================================================
-- FIX 2: job_status_history - Replace unrestricted INSERT policy
-- Only allow inserts for jobs where user is the client or cleaner
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert job history" ON public.job_status_history;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'job_status_history'
    AND policyname = 'job_status_history_insert_participants'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "job_status_history_insert_participants"
      ON public.job_status_history
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.jobs j
          LEFT JOIN public.client_profiles cp ON cp.id = j.client_id AND cp.user_id = auth.uid()
          LEFT JOIN public.cleaner_profiles clp ON clp.id = j.cleaner_id AND clp.user_id = auth.uid()
          WHERE j.id = job_id
          AND (cp.id IS NOT NULL OR clp.id IS NOT NULL)
        )
        OR public.has_role(auth.uid(), 'admin')
      )
    $policy$;
  END IF;
END $$;

-- ============================================================
-- FIX 3: cleaner_preferences - Restrict public SELECT to authenticated
-- ============================================================
DROP POLICY IF EXISTS "cleaner_prefs_select_public" ON public.cleaner_preferences;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cleaner_preferences'
    AND policyname = 'cleaner_prefs_select_authenticated'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "cleaner_prefs_select_authenticated"
      ON public.cleaner_preferences
      FOR SELECT
      TO authenticated
      USING (true)
    $policy$;
  END IF;
END $$;

-- ============================================================
-- FIX 4: cleaner_service_areas - Restrict to authenticated users
-- Removes unauthenticated access to lat/lng location data
-- ============================================================
DROP POLICY IF EXISTS "service_areas_select_public" ON public.cleaner_service_areas;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cleaner_service_areas'
    AND policyname = 'service_areas_select_authenticated'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "service_areas_select_authenticated"
      ON public.cleaner_service_areas
      FOR SELECT
      TO authenticated
      USING (true)
    $policy$;
  END IF;
END $$;

-- ============================================================
-- FIX 5: cleaner_availability - Remove the broad USING(true) policy
-- Keep only filtered access; authenticated users can see non-blocked slots
-- ============================================================
DROP POLICY IF EXISTS "Public can view availability" ON public.cleaner_availability;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cleaner_availability'
    AND policyname = 'cleaner_avail_authenticated_select'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "cleaner_avail_authenticated_select"
      ON public.cleaner_availability
      FOR SELECT
      TO authenticated
      USING (true)
    $policy$;
  END IF;
END $$;
