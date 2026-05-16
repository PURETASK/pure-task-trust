CREATE OR REPLACE FUNCTION public.create_booking_atomic(_user_id uuid, _cleaner_id uuid, _cleaning_type cleaning_type, _hours numeric, _total_credits numeric, _scheduled_start timestamp with time zone, _notes text, _square_footage integer DEFAULT NULL::integer, _dirtiness_level text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_client_profile_id UUID;
  v_available NUMERIC;
  v_account RECORD;
  v_job_id UUID;
BEGIN
  -- Reject past or missing scheduled start
  IF _scheduled_start IS NULL THEN
    RAISE EXCEPTION 'A scheduled start time is required';
  END IF;
  IF _scheduled_start <= now() THEN
    RAISE EXCEPTION 'Scheduled start time must be in the future';
  END IF;

  SELECT id INTO v_client_profile_id
  FROM client_profiles WHERE user_id = _user_id;

  IF v_client_profile_id IS NULL THEN
    RAISE EXCEPTION 'Client profile not found';
  END IF;

  SELECT current_balance, held_balance INTO v_account
  FROM credit_accounts WHERE user_id = _user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credit account not found';
  END IF;

  v_available := v_account.current_balance - v_account.held_balance;
  IF v_available < _total_credits THEN
    RAISE EXCEPTION 'Insufficient credits (have %, need %)', v_available, _total_credits;
  END IF;

  INSERT INTO jobs (
    client_id, cleaner_id, cleaning_type, estimated_hours,
    escrow_credits_reserved, scheduled_start_at, notes, status,
    square_footage, dirtiness_level
  ) VALUES (
    v_client_profile_id, _cleaner_id, _cleaning_type, _hours,
    _total_credits, _scheduled_start, _notes, 'pending',
    _square_footage, _dirtiness_level
  ) RETURNING id INTO v_job_id;

  UPDATE credit_accounts
  SET held_balance = held_balance + _total_credits
  WHERE user_id = _user_id;

  RETURN v_job_id;
END;
$function$;