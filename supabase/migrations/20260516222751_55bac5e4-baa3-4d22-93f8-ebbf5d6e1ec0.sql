
-- 1. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('dispute-photos', 'dispute-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own dispute folder
CREATE POLICY "Users upload dispute photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'dispute-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow clients, cleaners, and admins to view dispute photos for their disputes
CREATE POLICY "Participants view dispute photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'dispute-photos'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.disputes d
      JOIN public.jobs j ON j.id = d.job_id
      LEFT JOIN public.cleaner_profiles cp ON cp.id = j.cleaner_id
      LEFT JOIN public.client_profiles clp ON clp.id = j.client_id
      WHERE (storage.foldername(name))[2] = d.id::text
        AND (cp.user_id = auth.uid() OR clp.user_id = auth.uid())
    )
  )
);

-- 2. New dispute columns
ALTER TABLE public.disputes
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS status_updates JSONB DEFAULT '[]'::jsonb;

-- 3. Let cleaner view & respond to disputes on their own jobs
DROP POLICY IF EXISTS "Cleaners can view their disputes" ON public.disputes;
CREATE POLICY "Cleaners can view their disputes"
ON public.disputes FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.cleaner_profiles cp ON cp.id = j.cleaner_id
    WHERE j.id = disputes.job_id AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Cleaners can update their disputes" ON public.disputes;
CREATE POLICY "Cleaners can update their disputes"
ON public.disputes FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.cleaner_profiles cp ON cp.id = j.cleaner_id
    WHERE j.id = disputes.job_id AND cp.user_id = auth.uid()
  )
);
