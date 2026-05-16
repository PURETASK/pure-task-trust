-- Add auto-release for expired escrow (24h review window)
-- Mirrors approve_job_atomic but runs as the system for any client.

CREATE OR REPLACE FUNCTION public.auto_release_expired_jobs(_window_hours integer DEFAULT 24)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_job RECORD;
  v_client RECORD;
  v_cleaner_tier TEXT;
  v_hold NUMERIC;
  v_hours NUMERIC;
  v_rate NUMERIC;
  v_charged NUMERIC;
  v_fee_rate NUMERIC;
  v_platform_fee NUMERIC;
  v_net NUMERIC;
  v_released INT := 0;
  v_skipped INT := 0;
  v_errors JSONB := '[]'::jsonb;
BEGIN
  FOR v_job IN
    SELECT j.*
    FROM jobs j
    WHERE j.status = 'completed'
      AND j.final_charge_credits IS NULL
      AND COALESCE(j.check_out_at, j.actual_end_at) IS NOT NULL
      AND COALESCE(j.check_out_at, j.actual_end_at) < (now() - make_interval(hours => _window_hours))
      AND NOT EXISTS (
        SELECT 1 FROM disputes d
        WHERE d.job_id = j.id
          AND d.status IN ('open','pending','under_review')
      )
      AND NOT EXISTS (
        SELECT 1 FROM cleaner_earnings ce WHERE ce.job_id = j.id
      )
  LOOP
    BEGIN
      SELECT * INTO v_client FROM client_profiles WHERE id = v_job.client_id;
      IF v_client.user_id IS NULL THEN
        v_skipped := v_skipped + 1;
        CONTINUE;
      END IF;

      v_hold := COALESCE(v_job.escrow_credits_reserved, 0);
      v_hours := COALESCE(v_job.actual_hours, v_job.estimated_hours, 0);
      v_rate := CASE WHEN COALESCE(v_job.estimated_hours,0) > 0
                     THEN v_hold / v_job.estimated_hours ELSE 0 END;
      v_charged := ROUND(v_hours * v_rate);

      UPDATE credit_accounts
      SET current_balance = current_balance - v_charged,
          held_balance = GREATEST(0, held_balance - v_hold),
          lifetime_spent = lifetime_spent + v_charged
      WHERE user_id = v_client.user_id;

      UPDATE jobs SET final_charge_credits = v_charged WHERE id = v_job.id;

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
        VALUES (v_job.cleaner_id, v_job.id, v_charged, v_platform_fee, v_net);
      END IF;

      INSERT INTO job_status_history (job_id, to_status, reason, changed_by_type)
      VALUES (v_job.id, 'completed', 'Auto-released after ' || _window_hours || 'h review window', 'system');

      IF v_client.user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, data)
        VALUES (v_client.user_id, 'Payment auto-released',
                'Your 24-hour review window ended — payment has been released to your cleaner.',
                'job_auto_approved', jsonb_build_object('job_id', v_job.id));
      END IF;

      v_released := v_released + 1;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors || jsonb_build_object('job_id', v_job.id, 'error', SQLERRM);
    END;
  END LOOP;

  RETURN jsonb_build_object('released', v_released, 'skipped', v_skipped, 'errors', v_errors);
END;
$$;

REVOKE ALL ON FUNCTION public.auto_release_expired_jobs(integer) FROM PUBLIC, anon, authenticated;

-- Bump cron from daily to hourly so the window closes within an hour of expiry
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-complete-jobs') THEN
    PERFORM cron.unschedule('auto-complete-jobs');
  END IF;
  PERFORM cron.schedule(
    'auto-complete-jobs',
    '0 * * * *',
    $cron$
    SELECT net.http_post(
      url := 'https://ksoxwlxkbshohmhygqxk.supabase.co/functions/v1/auto-complete-jobs',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
      ),
      body := '{}'::jsonb
    );
    $cron$
  );
END$$;