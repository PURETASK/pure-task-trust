-- Allow any authenticated user to view cleaner profiles (needed for public profile pages, booking, and Discover page)
CREATE POLICY "Authenticated users can view cleaner profiles for discovery"
  ON public.cleaner_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Also allow anon to see profiles (needed for unauthenticated visitors on /cleaner/:id)
CREATE POLICY "Public can view cleaner profiles for discovery"
  ON public.cleaner_profiles
  FOR SELECT
  TO anon
  USING (true);