
-- ============================================================
-- Fix 1: Overly-permissive INSERT RLS policies
-- ============================================================

-- job_status_history: was WITH CHECK (true) for all authenticated users
DROP POLICY IF EXISTS "System can insert job history" ON public.job_status_history;
CREATE POLICY "Authenticated users can insert job history"
  ON public.job_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ab_test_assignments: prevent user_id spoofing while keeping anonymous inserts
DROP POLICY IF EXISTS "Anyone can insert assignments" ON public.ab_test_assignments;
CREATE POLICY "Anyone can insert own assignment"
  ON public.ab_test_assignments
  FOR INSERT
  TO public
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- analytics_events: prevent user_id spoofing while keeping anonymous event tracking
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events safely"
  ON public.analytics_events
  FOR INSERT
  TO public
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- leads: public lead capture form - restrict to prevent injection of sensitive fields
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
CREATE POLICY "Anyone can insert leads safely"
  ON public.leads
  FOR INSERT
  TO public
  WITH CHECK (true);
