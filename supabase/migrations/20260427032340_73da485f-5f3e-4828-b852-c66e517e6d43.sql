-- =====================================================
-- 1. Lock down financial columns on jobs table
-- =====================================================

CREATE OR REPLACE FUNCTION public.guard_jobs_financial_writes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
  is_service_role BOOLEAN;
BEGIN
  -- Service role (edge functions) bypasses all checks
  is_service_role := (current_setting('request.jwt.claim.role', true) = 'service_role')
                  OR (current_setting('role', true) = 'service_role');
  IF is_service_role THEN
    RETURN NEW;
  END IF;

  is_admin := public.has_role(auth.uid(), 'admin'::app_role);
  IF is_admin THEN
    RETURN NEW;
  END IF;

  -- Block changes to financial / settlement fields from regular users
  IF NEW.escrow_credits_reserved IS DISTINCT FROM OLD.escrow_credits_reserved THEN
    RAISE EXCEPTION 'escrow_credits_reserved can only be modified by the system';
  END IF;
  IF NEW.final_charge_credits IS DISTINCT FROM OLD.final_charge_credits THEN
    RAISE EXCEPTION 'final_charge_credits can only be modified by the system';
  END IF;
  IF NEW.credit_charge_credits IS DISTINCT FROM OLD.credit_charge_credits THEN
    RAISE EXCEPTION 'credit_charge_credits can only be modified by the system';
  END IF;
  IF NEW.refund_credits IS DISTINCT FROM OLD.refund_credits THEN
    RAISE EXCEPTION 'refund_credits can only be modified by the system';
  END IF;
  IF NEW.snapshot_base_rate_cph IS DISTINCT FROM OLD.snapshot_base_rate_cph
     OR NEW.snapshot_addon_rate_cph IS DISTINCT FROM OLD.snapshot_addon_rate_cph
     OR NEW.snapshot_total_rate_cph IS DISTINCT FROM OLD.snapshot_total_rate_cph THEN
    RAISE EXCEPTION 'rate snapshots can only be modified by the system';
  END IF;
  IF NEW.rush_fee_credits IS DISTINCT FROM OLD.rush_fee_credits THEN
    RAISE EXCEPTION 'rush_fee_credits can only be modified by the system';
  END IF;

  -- Status transition rules
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Client can only cancel or dispute their own jobs
    IF EXISTS (
      SELECT 1 FROM client_profiles cp
      WHERE cp.id = NEW.client_id AND cp.user_id = auth.uid()
    ) THEN
      IF NEW.status NOT IN ('cancelled', 'disputed') THEN
        RAISE EXCEPTION 'Clients can only cancel or dispute jobs (attempted: %)', NEW.status;
      END IF;
    -- Cleaner transitions: confirmed -> in_progress -> completed
    ELSIF EXISTS (
      SELECT 1 FROM cleaner_profiles cl
      WHERE cl.id = NEW.cleaner_id AND cl.user_id = auth.uid()
    ) THEN
      IF NEW.status = 'in_progress' AND OLD.status NOT IN ('confirmed','pending') THEN
        RAISE EXCEPTION 'Cleaners can only start jobs from confirmed/pending state';
      ELSIF NEW.status = 'completed' THEN
        -- Require both check-in and check-out for cleaner-driven completion
        IF NEW.check_in_at IS NULL OR NEW.check_out_at IS NULL THEN
          RAISE EXCEPTION 'Job completion requires recorded check-in and check-out';
        END IF;
        IF OLD.status <> 'in_progress' THEN
          RAISE EXCEPTION 'Job can only be completed from in_progress state';
        END IF;
      ELSIF NEW.status NOT IN ('confirmed','in_progress','completed') THEN
        RAISE EXCEPTION 'Cleaners cannot transition jobs to status %', NEW.status;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_jobs_financial_writes_trigger ON public.jobs;
CREATE TRIGGER guard_jobs_financial_writes_trigger
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.guard_jobs_financial_writes();

-- =====================================================
-- 2. Lock down credit_accounts: only service role / admin can touch balances
-- =====================================================

CREATE OR REPLACE FUNCTION public.guard_credit_account_writes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
  is_service_role BOOLEAN;
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

  -- Block any balance / lifetime field change from regular users
  IF NEW.current_balance IS DISTINCT FROM OLD.current_balance
     OR NEW.held_balance IS DISTINCT FROM OLD.held_balance
     OR NEW.lifetime_purchased IS DISTINCT FROM OLD.lifetime_purchased
     OR NEW.lifetime_spent IS DISTINCT FROM OLD.lifetime_spent
     OR NEW.lifetime_refunded IS DISTINCT FROM OLD.lifetime_refunded THEN
    RAISE EXCEPTION 'Credit balances can only be modified by the system';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_credit_account_writes_trigger ON public.credit_accounts;
CREATE TRIGGER guard_credit_account_writes_trigger
BEFORE UPDATE ON public.credit_accounts
FOR EACH ROW
EXECUTE FUNCTION public.guard_credit_account_writes();

-- =====================================================
-- 3. Block client-side INSERTs into cleaner_earnings (server-only writes)
-- =====================================================

DROP POLICY IF EXISTS "cleaner_earnings_no_client_insert" ON public.cleaner_earnings;
-- (No INSERT policy exists, so authenticated users already cannot insert.
--  We make this explicit by ensuring no permissive INSERT policy exists.)

-- =====================================================
-- 4. RPC: atomic booking creation (used by edge function via service role)
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  _user_id UUID,
  _cleaner_id UUID,
  _cleaning_type cleaning_type,
  _hours NUMERIC,
  _total_credits NUMERIC,
  _scheduled_start TIMESTAMPTZ,
  _notes TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_profile_id UUID;
  v_available NUMERIC;
  v_account RECORD;
  v_job_id UUID;
BEGIN
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
    escrow_credits_reserved, scheduled_start_at, notes, status
  ) VALUES (
    v_client_profile_id, _cleaner_id, _cleaning_type, _hours,
    _total_credits, _scheduled_start, _notes, 'pending'
  ) RETURNING id INTO v_job_id;

  UPDATE credit_accounts
  SET held_balance = held_balance + _total_credits
  WHERE user_id = _user_id;

  RETURN v_job_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_booking_atomic FROM PUBLIC, authenticated, anon;

-- =====================================================
-- 5. RPC: atomic job approval / completion settlement
-- =====================================================

CREATE OR REPLACE FUNCTION public.approve_job_atomic(
  _user_id UUID,
  _job_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
  v_client RECORD;
  v_cleaner_tier TEXT;
  v_hold NUMERIC;
  v_hours NUMERIC;
  v_rate NUMERIC;
  v_charged NUMERIC;
  v_refund NUMERIC;
  v_fee_rate NUMERIC;
  v_platform_fee NUMERIC;
  v_net NUMERIC;
BEGIN
  SELECT * INTO v_job FROM jobs WHERE id = _job_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Job not found'; END IF;

  SELECT * INTO v_client FROM client_profiles WHERE id = v_job.client_id;
  IF v_client.user_id <> _user_id THEN
    RAISE EXCEPTION 'Only the job client can approve';
  END IF;

  IF v_job.status NOT IN ('completed','in_progress') THEN
    RAISE EXCEPTION 'Job not eligible for approval (status=%)', v_job.status;
  END IF;

  v_hold := COALESCE(v_job.escrow_credits_reserved, 0);
  v_hours := COALESCE(v_job.actual_hours, v_job.estimated_hours, 0);
  v_rate := CASE WHEN COALESCE(v_job.estimated_hours,0) > 0
                 THEN v_hold / v_job.estimated_hours ELSE 0 END;
  v_charged := ROUND(v_hours * v_rate);
  v_refund := GREATEST(0, v_hold - v_charged);

  -- Settle credit account
  UPDATE credit_accounts
  SET current_balance = current_balance - v_charged,
      held_balance = GREATEST(0, held_balance - v_hold),
      lifetime_spent = lifetime_spent + v_charged
  WHERE user_id = _user_id;

  UPDATE jobs SET status = 'completed', final_charge_credits = v_charged
  WHERE id = _job_id;

  -- Cleaner earnings with tier-based platform fee
  IF v_job.cleaner_id IS NOT NULL THEN
    SELECT tier INTO v_cleaner_tier FROM cleaner_profiles WHERE id = v_job.cleaner_id;
    v_fee_rate := CASE COALESCE(v_cleaner_tier,'bronze')
                    WHEN 'platinum' THEN 0.15
                    WHEN 'gold'     THEN 0.18
                    WHEN 'silver'   THEN 0.22
                    ELSE 0.25 END;
    v_platform_fee := ROUND(v_charged * v_fee_rate);
    v_net := v_charged - v_platform_fee;

    INSERT INTO cleaner_earnings (cleaner_id, job_id, gross_credits, platform_fee_credits, net_credits)
    VALUES (v_job.cleaner_id, _job_id, v_charged, v_platform_fee, v_net);
  END IF;

  RETURN jsonb_build_object('credits_charged', v_charged, 'refund', v_refund);
END;
$$;

REVOKE ALL ON FUNCTION public.approve_job_atomic FROM PUBLIC, authenticated, anon;