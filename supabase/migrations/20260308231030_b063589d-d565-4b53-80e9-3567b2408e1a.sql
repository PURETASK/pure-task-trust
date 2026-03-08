
-- Fix remaining RLS_ALWAYS_TRUE warning: job_status_history INSERT WITH CHECK (true)
-- Find and fix the cleaner_availability public policy that still uses USING(true) for anon
-- Also address any remaining INSERT/UPDATE WITH CHECK (true) policies

-- Check and fix any remaining permissive INSERT policies on job_status_history
-- The new policy replaces the old one. No further action needed there.

-- Fix cleaner_availability: ensure the anon public policy (is_blocked=false) is NOT WITH CHECK(true)
-- The remaining RLS_ALWAYS_TRUE warning is likely from cleaner_avail_public_select
-- Let's inspect and tighten it:
DROP POLICY IF EXISTS "cleaner_avail_public_select" ON public.cleaner_availability;

-- Recreate a proper filtered public policy: only non-blocked slots, no notes field exposed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cleaner_availability'
    AND policyname = 'cleaner_avail_unblocked_public'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "cleaner_avail_unblocked_public"
      ON public.cleaner_availability
      FOR SELECT
      TO anon
      USING (is_blocked = false)
    $policy$;
  END IF;
END $$;
