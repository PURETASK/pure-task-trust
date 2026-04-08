CREATE POLICY "Public can view cleaner profiles via view"
ON public.cleaner_profiles FOR SELECT
TO anon
USING (true);