
-- Arbitration opt-out (must be within 30 days of signup per CFPB-style window)
CREATE OR REPLACE FUNCTION public.request_arbitration_optout()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_signup_at timestamptz;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT created_at INTO v_signup_at FROM public.profiles WHERE id = v_user_id;
  IF v_signup_at IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF now() > v_signup_at + interval '30 days' THEN
    RAISE EXCEPTION '30-day arbitration opt-out window has expired';
  END IF;

  UPDATE public.profiles
     SET arbitration_opted_out = TRUE,
         arbitration_optout_at = COALESCE(arbitration_optout_at, now()),
         updated_at = now()
   WHERE id = v_user_id;

  RETURN jsonb_build_object('opted_out_at', now(), 'window_expires_at', v_signup_at + interval '30 days');
END;
$$;

-- Account closure with 30-day grace period
CREATE OR REPLACE FUNCTION public.request_account_closure(_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.profiles
     SET account_status = 'closed',
         closure_reason = _reason,
         closure_initiated_at = now(),
         deletion_eligible_after = now() + interval '30 days',
         updated_at = now()
   WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'closed_at', now(),
    'deletion_eligible_after', now() + interval '30 days'
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.request_arbitration_optout() FROM anon;
REVOKE EXECUTE ON FUNCTION public.request_account_closure(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.request_arbitration_optout() TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_account_closure(text) TO authenticated;
