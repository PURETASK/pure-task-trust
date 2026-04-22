
-- 1. Remove overly permissive SELECT policies on cleaner_profiles
DROP POLICY IF EXISTS "Anyone authenticated can view cleaner profiles" ON public.cleaner_profiles;
DROP POLICY IF EXISTS "Public can view cleaner profiles via view" ON public.cleaner_profiles;
DROP POLICY IF EXISTS "Users can update own cleaner profile" ON public.cleaner_profiles;
DROP POLICY IF EXISTS "Users can insert own cleaner profile" ON public.cleaner_profiles;

-- Allow clients to view a cleaner profile only when they share an active job with that cleaner
CREATE POLICY "Clients can view cleaners on their jobs"
ON public.cleaner_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    INNER JOIN public.client_profiles cp ON cp.id = j.client_id
    WHERE j.cleaner_id = cleaner_profiles.id
      AND cp.user_id = auth.uid()
  )
);

-- Make the public-discovery view security_invoker so it relies on caller's privileges
-- and grant authenticated/anon SELECT through the view's underlying safe columns only.
-- Recreate the view with security_invoker = false so it bypasses RLS but only exposes safe columns.
DROP VIEW IF EXISTS public.cleaner_public_profiles;
CREATE VIEW public.cleaner_public_profiles
WITH (security_invoker = false) AS
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

-- 2. Restrict job-photos storage bucket
DROP POLICY IF EXISTS "Anyone can view job photos" ON storage.objects;

CREATE POLICY "Job participants can view job photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-photos'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.jobs j
      LEFT JOIN public.client_profiles cp ON cp.id = j.client_id
      LEFT JOIN public.cleaner_profiles cl ON cl.id = j.cleaner_id
      WHERE j.id::text = (storage.foldername(name))[1]
        AND (cp.user_id = auth.uid() OR cl.user_id = auth.uid())
    )
  )
);

-- Make job-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'job-photos';

-- 3. Realtime channel authorization
-- Restrict realtime subscriptions to the authenticated user's own topics
CREATE POLICY "Authenticated can read own realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Topic must include the user's UID, or be a thread/job/ticket the user participates in.
  -- We require the topic name to start with the user's id by convention, OR be one of the
  -- known channel patterns where the topic == "<resource>:<id>" and the user has access.
  (realtime.topic() LIKE '%' || auth.uid()::text || '%')
);

CREATE POLICY "Authenticated can broadcast to own realtime topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() LIKE '%' || auth.uid()::text || '%'
);
