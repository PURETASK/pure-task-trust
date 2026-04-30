-- ============================================================
-- Phase C — Lock down SECURITY DEFINER function execution
-- ============================================================
-- Background: linter flagged 28 functions as "Public/Authenticated can
-- execute SECURITY DEFINER function". Of those, the following 11 are
-- internal (triggers, vault helpers, queue helpers, codegen helpers) and
-- must NOT be callable from the API.
--
-- The rest (has_role, get_user_role, is_ticket_owner,
-- cleaner_has_job_with_client, client_has_job_with_cleaner,
-- log_admin_action, create_booking_atomic, approve_job_atomic) are kept
-- callable because RLS policies and atomic flows rely on them, and they
-- each enforce their own internal authorization.

-- Vault helpers — service-role only
REVOKE EXECUTE ON FUNCTION public.vault_secret_exists(text)        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.vault_insert_cron_secret(text)   FROM PUBLIC, anon, authenticated;

-- Email queue helpers — service-role / cron only
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb)               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint)               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb)   FROM PUBLIC, anon, authenticated;

-- Trigger-only functions — Postgres invokes these via the trigger system,
-- never via the PostgREST API. Revoking EXECUTE has no effect on triggers
-- (they run as the trigger owner / definer) but stops API abuse.
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_agent_ticket_message()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_jobs_financial_writes()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_credit_account_writes()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_cleaner_hourly_rate()     FROM PUBLIC, anon, authenticated;

-- Internal codegen helper — referral codes are minted by handle_new_user
-- inside the DB; the API never needs to call this directly.
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
