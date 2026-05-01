REVOKE EXECUTE ON FUNCTION public.get_my_cleaner_profile() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_my_cleaner_availability(boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_cleaner_profile() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_my_cleaner_availability(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_cleaner_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_my_cleaner_availability(boolean) TO authenticated;