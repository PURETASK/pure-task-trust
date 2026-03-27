
-- 1. Remove password_hash column from admin_users (rely on Supabase Auth)
ALTER TABLE public.admin_users DROP COLUMN IF EXISTS password_hash;

-- 2. cleaner_public_profiles is a VIEW, enable security_invoker so it
--    respects the caller's RLS on the underlying cleaner_profiles table.
ALTER VIEW public.cleaner_public_profiles SET (security_invoker = on);
