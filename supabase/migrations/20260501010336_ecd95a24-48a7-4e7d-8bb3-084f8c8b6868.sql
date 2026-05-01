CREATE OR REPLACE FUNCTION public.get_my_cleaner_profile()
RETURNS public.cleaner_profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cp.*
  FROM public.cleaner_profiles cp
  WHERE cp.user_id = auth.uid()
    AND cp.deleted_at IS NULL
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.set_my_cleaner_availability(_is_available boolean)
RETURNS TABLE(id uuid, user_id uuid, is_available boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.cleaner_profiles cp
  SET is_available = _is_available,
      updated_at = now()
  WHERE cp.user_id = auth.uid()
    AND cp.deleted_at IS NULL
  RETURNING cp.id, cp.user_id, cp.is_available
$$;

REVOKE ALL ON FUNCTION public.get_my_cleaner_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_my_cleaner_availability(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_cleaner_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_my_cleaner_availability(boolean) TO authenticated;