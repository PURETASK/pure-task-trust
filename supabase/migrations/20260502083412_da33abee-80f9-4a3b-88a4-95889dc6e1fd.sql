
-- 1) Drop the blanket public SELECT policy on cleaner_profiles.
-- The safe `cleaner_public_profiles` view (already used by the app for
-- discovery) is granted to anon/authenticated and exposes only non-sensitive
-- columns. Owner / admin / "client has job with cleaner" SELECT policies
-- remain in place for legitimate full-row reads.
DROP POLICY IF EXISTS "Public discovery via safe view" ON public.cleaner_profiles;

-- 2) Tighten notifications INSERT policy: users may only target themselves.
-- Service role bypasses RLS, so system notifications still work.
DROP POLICY IF EXISTS "Authenticated insert for notifications" ON public.notifications;

CREATE POLICY "Users can insert their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3) Tighten job-photos bucket INSERT: only the assigned cleaner / client
-- (or admins) can upload, and only into the folder named after the job_id.
DROP POLICY IF EXISTS "Authenticated users can upload job photos" ON storage.objects;

CREATE POLICY "Job participants can upload job photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'job-photos'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.jobs j
      LEFT JOIN public.client_profiles cp ON cp.id = j.client_id
      LEFT JOIN public.cleaner_profiles cl ON cl.id = j.cleaner_id
      WHERE j.id::text = (storage.foldername(storage.objects.name))[1]
        AND (cp.user_id = auth.uid() OR cl.user_id = auth.uid())
    )
  )
);

-- 4) Brute-force protection scaffolding for phone OTP.
ALTER TABLE public.phone_verifications
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 0;
