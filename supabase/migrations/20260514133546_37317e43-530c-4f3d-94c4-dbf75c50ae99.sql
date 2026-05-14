-- 1. New columns on jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS original_scheduled_start_at timestamptz,
  ADD COLUMN IF NOT EXISTS reschedule_count int NOT NULL DEFAULT 0;

-- Backfill: existing jobs use their current scheduled_start_at as the original anchor
UPDATE public.jobs
   SET original_scheduled_start_at = scheduled_start_at
 WHERE original_scheduled_start_at IS NULL;

-- Auto-set original_scheduled_start_at on insert
CREATE OR REPLACE FUNCTION public.set_original_scheduled_start_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.original_scheduled_start_at IS NULL THEN
    NEW.original_scheduled_start_at := NEW.scheduled_start_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_original_scheduled_start_at ON public.jobs;
CREATE TRIGGER trg_set_original_scheduled_start_at
BEFORE INSERT ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.set_original_scheduled_start_at();

-- 2. Reschedule guard trigger: prevent regular users from manually changing
--    original_scheduled_start_at or reschedule_count (only system/admin can).
CREATE OR REPLACE FUNCTION public.guard_jobs_reschedule_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_service_role BOOLEAN;
  is_admin BOOLEAN;
BEGIN
  is_service_role := (current_setting('request.jwt.claim.role', true) = 'service_role')
                  OR (current_setting('role', true) = 'service_role');
  IF is_service_role THEN
    RETURN NEW;
  END IF;

  is_admin := public.has_role(auth.uid(), 'admin'::app_role);
  IF is_admin THEN
    RETURN NEW;
  END IF;

  IF NEW.original_scheduled_start_at IS DISTINCT FROM OLD.original_scheduled_start_at THEN
    RAISE EXCEPTION 'original_scheduled_start_at can only be modified by the system';
  END IF;
  IF NEW.reschedule_count IS DISTINCT FROM OLD.reschedule_count THEN
    RAISE EXCEPTION 'reschedule_count can only be modified by the system';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_jobs_reschedule_fields ON public.jobs;
CREATE TRIGGER trg_guard_jobs_reschedule_fields
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.guard_jobs_reschedule_fields();

-- 3. Atomic reschedule: enforces cap + fee
CREATE OR REPLACE FUNCTION public.reschedule_job_atomic(
  _user_id uuid,
  _job_id uuid,
  _new_start timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
  v_client RECORD;
  v_anchor timestamptz;
  v_hours_before numeric;
  v_fee numeric := 0;
  v_escrow numeric;
  v_max_reschedules int := 3;
BEGIN
  SELECT * INTO v_job FROM jobs WHERE id = _job_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Job not found'; END IF;

  SELECT * INTO v_client FROM client_profiles WHERE id = v_job.client_id;
  IF v_client.user_id <> _user_id THEN
    RAISE EXCEPTION 'Only the job client can reschedule';
  END IF;

  IF v_job.status NOT IN ('pending','confirmed') THEN
    RAISE EXCEPTION 'Job cannot be rescheduled (status=%)', v_job.status;
  END IF;

  IF v_job.reschedule_count >= v_max_reschedules THEN
    RAISE EXCEPTION 'Reschedule limit reached (% of %). Please cancel instead.',
      v_job.reschedule_count, v_max_reschedules;
  END IF;

  IF _new_start <= now() THEN
    RAISE EXCEPTION 'New start time must be in the future';
  END IF;

  -- Anchor is the ORIGINAL scheduled time (anti-gaming)
  v_anchor := COALESCE(v_job.original_scheduled_start_at, v_job.scheduled_start_at);
  v_hours_before := EXTRACT(EPOCH FROM (v_anchor - now())) / 3600.0;

  v_escrow := COALESCE(v_job.escrow_credits_reserved, 0);

  -- Fee: 50% if within 2h of original start
  IF v_hours_before < 2 THEN
    v_fee := ROUND(v_escrow * 0.5);
  END IF;

  -- Charge fee now (deduct from current_balance, release rest of held)
  IF v_fee > 0 THEN
    UPDATE credit_accounts
      SET current_balance = current_balance - v_fee,
          held_balance = GREATEST(0, held_balance - v_fee),
          lifetime_spent = lifetime_spent + v_fee
      WHERE user_id = _user_id;
  END IF;

  -- Update job
  UPDATE jobs
     SET scheduled_start_at = _new_start,
         reschedule_count = reschedule_count + 1,
         updated_at = now()
   WHERE id = _job_id;

  -- Log event
  INSERT INTO reschedule_events (
    job_id, client_id, cleaner_id,
    requested_by, requested_to,
    t_request, t_start_original, t_start_new,
    hours_before_original, bucket, status, is_reasonable
  ) VALUES (
    _job_id, v_job.client_id, v_job.cleaner_id,
    'client', 'cleaner',
    now(), v_anchor, _new_start,
    v_hours_before,
    CASE
      WHEN v_hours_before < 24 THEN 'same_day'::reschedule_bucket
      WHEN v_hours_before < 48 THEN 'next_day'::reschedule_bucket
      WHEN v_hours_before < 168 THEN 'within_week'::reschedule_bucket
      ELSE 'future'::reschedule_bucket
    END,
    'pending'::reschedule_status,
    v_hours_before >= 2
  );

  RETURN jsonb_build_object(
    'fee_credits', v_fee,
    'reschedules_used', v_job.reschedule_count + 1,
    'reschedules_remaining', v_max_reschedules - (v_job.reschedule_count + 1)
  );
END;
$$;

-- 4. Atomic cancel: uses ORIGINAL anchor for fee tier
CREATE OR REPLACE FUNCTION public.cancel_job_atomic(
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
  v_client RECORD;
  v_anchor timestamptz;
  v_hours_before numeric;
  v_fee_pct numeric;
  v_fee numeric;
  v_refund numeric;
  v_escrow numeric;
BEGIN
  SELECT * INTO v_job FROM jobs WHERE id = _job_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Job not found'; END IF;

  SELECT * INTO v_client FROM client_profiles WHERE id = v_job.client_id;
  IF v_client.user_id <> _user_id THEN
    RAISE EXCEPTION 'Only the job client can cancel';
  END IF;

  IF v_job.status IN ('cancelled','completed','disputed') THEN
    RAISE EXCEPTION 'Job already %', v_job.status;
  END IF;

  v_anchor := COALESCE(v_job.original_scheduled_start_at, v_job.scheduled_start_at);
  v_hours_before := EXTRACT(EPOCH FROM (v_anchor - now())) / 3600.0;

  -- Fee tier (anchored to ORIGINAL start time)
  v_fee_pct := CASE
    WHEN v_hours_before >= 24 THEN 0.0
    WHEN v_hours_before >= 6  THEN 0.25
    WHEN v_hours_before >= 2  THEN 0.50
    ELSE 1.0
  END;

  v_escrow := COALESCE(v_job.escrow_credits_reserved, 0);
  v_fee := ROUND(v_escrow * v_fee_pct);
  v_refund := v_escrow - v_fee;

  -- Settle credit account
  UPDATE credit_accounts
    SET current_balance = current_balance - v_fee,
        held_balance = GREATEST(0, held_balance - v_escrow),
        lifetime_spent = lifetime_spent + v_fee
    WHERE user_id = _user_id;

  UPDATE jobs
     SET status = 'cancelled',
         cancelled_at = now(),
         final_charge_credits = v_fee,
         refund_credits = v_refund,
         updated_at = now()
   WHERE id = _job_id;

  RETURN jsonb_build_object(
    'fee_pct', v_fee_pct,
    'fee_credits', v_fee,
    'refund_credits', v_refund,
    'hours_before_original', v_hours_before
  );
END;
$$;