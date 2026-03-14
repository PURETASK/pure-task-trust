
-- ============================================================
-- Helper functions for CRON_SECRET vault storage + cron job updates
-- ============================================================

-- Check if a vault secret exists by name
CREATE OR REPLACE FUNCTION public.vault_secret_exists(secret_name TEXT)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM vault.secrets WHERE name = secret_name);
$$;

-- Insert cron_secret into vault (idempotent)
CREATE OR REPLACE FUNCTION public.vault_insert_cron_secret(secret_value TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'cron_secret') THEN
    PERFORM vault.create_secret(secret_value, 'cron_secret', 'CRON_SECRET for authenticating scheduled edge functions');
  END IF;
END;
$$;
