
-- Accept a pending job offer (cleaner confirms the booking)
CREATE OR REPLACE FUNCTION public.accept_job_offer_atomic(_user_id uuid, _job_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
  v_cleaner RECORD;
BEGIN
  SELECT * INTO v_job FROM jobs WHERE id = _job_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Job not found'; END IF;

  SELECT * INTO v_cleaner FROM cleaner_profiles WHERE id = v_job.cleaner_id;
  IF v_cleaner.user_id IS DISTINCT FROM _user_id THEN
    RAISE EXCEPTION 'Only the assigned cleaner can accept this job';
  END IF;

  IF v_job.status <> 'pending' THEN
    RAISE EXCEPTION 'Job is not pending (status=%)', v_job.status;
  END IF;

  UPDATE jobs
     SET status = 'confirmed',
         updated_at = now()
   WHERE id = _job_id;

  RETURN jsonb_build_object('job_id', _job_id, 'status', 'confirmed');
END;
$$;

-- Decline a pending job offer (releases the client's held credits)
CREATE OR REPLACE FUNCTION public.decline_job_offer_atomic(
  _user_id uuid,
  _job_id uuid,
  _reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
  v_cleaner RECORD;
  v_client RECORD;
  v_escrow numeric;
BEGIN
  SELECT * INTO v_job FROM jobs WHERE id = _job_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Job not found'; END IF;

  SELECT * INTO v_cleaner FROM cleaner_profiles WHERE id = v_job.cleaner_id;
  IF v_cleaner.user_id IS DISTINCT FROM _user_id THEN
    RAISE EXCEPTION 'Only the assigned cleaner can decline this job';
  END IF;

  IF v_job.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending offers can be declined (status=%)', v_job.status;
  END IF;

  SELECT * INTO v_client FROM client_profiles WHERE id = v_job.client_id;
  v_escrow := COALESCE(v_job.escrow_credits_reserved, 0);

  -- Release ALL held credits back to client (no fee on cleaner-decline)
  IF v_escrow > 0 AND v_client.user_id IS NOT NULL THEN
    UPDATE credit_accounts
       SET held_balance = GREATEST(0, held_balance - v_escrow),
           updated_at = now()
     WHERE user_id = v_client.user_id;
  END IF;

  UPDATE jobs
     SET status = 'cancelled',
         cancelled_at = now(),
         refund_credits = v_escrow,
         final_charge_credits = 0,
         metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
           'declined_by_cleaner', true,
           'declined_at', now(),
           'declined_by_cleaner_id', v_job.cleaner_id,
           'decline_reason', COALESCE(_reason, '')
         ),
         updated_at = now()
   WHERE id = _job_id;

  RETURN jsonb_build_object(
    'job_id', _job_id,
    'status', 'cancelled',
    'refunded_credits', v_escrow
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_job_offer_atomic(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_job_offer_atomic(uuid, uuid, text) TO authenticated;
