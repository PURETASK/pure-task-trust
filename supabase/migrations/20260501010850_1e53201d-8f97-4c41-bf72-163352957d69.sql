ALTER TABLE public.cleaner_profiles
  ADD COLUMN IF NOT EXISTS dashboard_tour_seen_at timestamptz;

CREATE OR REPLACE FUNCTION public.mark_my_cleaner_tour_seen()
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
BEGIN
  UPDATE public.cleaner_profiles
     SET dashboard_tour_seen_at = COALESCE(dashboard_tour_seen_at, v_now),
         updated_at = v_now
   WHERE user_id = auth.uid()
     AND deleted_at IS NULL;
  RETURN v_now;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_my_cleaner_tour_seen() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_my_cleaner_tour_seen() TO authenticated;