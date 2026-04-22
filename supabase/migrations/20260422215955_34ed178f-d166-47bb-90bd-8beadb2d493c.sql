
-- Fix infinite recursion between cleaner_profiles and jobs policies.
-- Replace the recursive policy with one that uses a SECURITY DEFINER helper.

CREATE OR REPLACE FUNCTION public.client_has_job_with_cleaner(_client_user_id uuid, _cleaner_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM jobs j
    JOIN client_profiles cp ON cp.id = j.client_id
    WHERE j.cleaner_id = _cleaner_profile_id
      AND cp.user_id = _client_user_id
  )
$$;

DROP POLICY IF EXISTS "Clients can view cleaners on their jobs" ON public.cleaner_profiles;

CREATE POLICY "Clients can view cleaners on their jobs"
ON public.cleaner_profiles
FOR SELECT
TO authenticated
USING (public.client_has_job_with_cleaner(auth.uid(), id));
