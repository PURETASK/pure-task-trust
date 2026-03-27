
-- 1. Fix OTP exposure: Remove user SELECT on phone_verifications
-- Verification is done server-side via verify-otp edge function, no client reads needed
DROP POLICY IF EXISTS "Users can view their own verifications" ON public.phone_verifications;
DROP POLICY IF EXISTS "Users can update their own verifications" ON public.phone_verifications;

-- 2. Fix user_roles privilege escalation: Remove overly permissive admin ALL policy
-- and replace with scoped policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;

-- Admin SELECT
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin UPDATE
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin DELETE
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- No INSERT policy for authenticated users - only service_role (trigger) can insert
-- The handle_new_user trigger runs as SECURITY DEFINER and bypasses RLS
