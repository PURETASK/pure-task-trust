-- Remove duplicate SELECT policies on cleaner_profiles (keep only cleaner_profiles_select_owner and cleaner_profiles_select_admin)
DROP POLICY IF EXISTS "Cleaners can view own profile" ON public.cleaner_profiles;
DROP POLICY IF EXISTS "Users can view own cleaner profile" ON public.cleaner_profiles;
DROP POLICY IF EXISTS "Admins can view all cleaner profiles" ON public.cleaner_profiles;
DROP POLICY IF EXISTS "Admins can manage all cleaner profiles" ON public.cleaner_profiles;

-- Add a public read policy so clients can discover cleaners
CREATE POLICY "Anyone authenticated can view cleaner profiles"
  ON public.cleaner_profiles FOR SELECT
  TO authenticated
  USING (true);