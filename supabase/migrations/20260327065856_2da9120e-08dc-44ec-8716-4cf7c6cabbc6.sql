-- Allow admins to view all id_verifications
CREATE POLICY "Admins can view all ID verifications"
  ON public.id_verifications
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update id_verifications (for approving/rejecting)
CREATE POLICY "Admins can update all ID verifications"
  ON public.id_verifications
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add admin storage policy for identity-documents bucket
CREATE POLICY "Admins can view all identity documents"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'identity-documents' AND public.has_role(auth.uid(), 'admin'));
