-- Fix infinite recursion in client_profiles RLS policy
-- The issue: "Cleaners can view client profiles for their jobs" policy queries cleaner_profiles
-- which in turn might have policies querying back, creating recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Cleaners can view client profiles for their jobs" ON public.client_profiles;

-- Create a SECURITY DEFINER function to check if a cleaner has jobs with a client
-- This breaks the recursion by using a function with security definer
CREATE OR REPLACE FUNCTION public.cleaner_has_job_with_client(cleaner_user_id uuid, client_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM jobs j
    INNER JOIN cleaner_profiles cp ON cp.id = j.cleaner_id
    WHERE cp.user_id = cleaner_user_id
      AND j.client_id = client_profile_id
  )
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Cleaners can view client profiles for their jobs"
  ON public.client_profiles
  FOR SELECT
  USING (
    public.cleaner_has_job_with_client(auth.uid(), id)
  );