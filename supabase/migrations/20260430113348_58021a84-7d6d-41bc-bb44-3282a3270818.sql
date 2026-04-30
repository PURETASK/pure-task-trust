-- ============================================================================
-- Wave 1, Primitive #1: Canonical admin audit log infrastructure
-- ============================================================================

-- 1. Add columns to capture success/failure of admin actions
ALTER TABLE public.admin_audit_log
  ADD COLUMN IF NOT EXISTS success boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS error_message text;

-- 2. Indexes for common admin audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_created
  ON public.admin_audit_log (admin_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action_created
  ON public.admin_audit_log (action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_entity
  ON public.admin_audit_log (entity_type, entity_id);

-- 3. Tighten RLS — audit log must be append-only and never editable/deletable
DROP POLICY IF EXISTS "Admins can manage admin audit log" ON public.admin_audit_log;

CREATE POLICY "Admins can read admin audit log"
  ON public.admin_audit_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- No INSERT policy on the table itself — all inserts must go through the
-- log_admin_action RPC below (which is SECURITY DEFINER). This prevents
-- malformed direct inserts and centralizes validation.

-- Explicitly deny UPDATE and DELETE on audit rows (immutability)
CREATE POLICY "Audit log is append-only — no updates"
  ON public.admin_audit_log
  FOR UPDATE
  USING (false);

CREATE POLICY "Audit log is append-only — no deletes"
  ON public.admin_audit_log
  FOR DELETE
  USING (false);

-- 4. Canonical RPC for writing admin audit entries
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action          text,
  _entity_type     text DEFAULT NULL,
  _entity_id       uuid DEFAULT NULL,
  _old_values      jsonb DEFAULT NULL,
  _new_values      jsonb DEFAULT NULL,
  _reason          text DEFAULT NULL,
  _success         boolean DEFAULT true,
  _error_message   text DEFAULT NULL,
  _metadata        jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_audit_id uuid;
BEGIN
  -- Reject non-admin callers (also rejects unauthenticated)
  IF v_admin_id IS NULL OR NOT public.has_role(v_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can write to the admin audit log';
  END IF;

  -- Action name must be present and non-trivial
  IF _action IS NULL OR length(trim(_action)) < 3 THEN
    RAISE EXCEPTION 'Audit action name is required (got: %)', coalesce(_action, '<null>');
  END IF;

  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    reason,
    success,
    error_message,
    metadata
  ) VALUES (
    v_admin_id,
    _action,
    _entity_type,
    _entity_id,
    _old_values,
    _new_values,
    _reason,
    coalesce(_success, true),
    _error_message,
    coalesce(_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

-- Allow authenticated users to call the function (the function itself
-- enforces admin-only access internally)
GRANT EXECUTE ON FUNCTION public.log_admin_action(
  text, text, uuid, jsonb, jsonb, text, boolean, text, jsonb
) TO authenticated;