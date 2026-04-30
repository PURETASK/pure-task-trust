-- Defense in depth: revoke EXECUTE from anon and PUBLIC so the function can
-- only be invoked by authenticated sessions (the function itself enforces
-- admin-only access via has_role() internally).
REVOKE EXECUTE ON FUNCTION public.log_admin_action(
  text, text, uuid, jsonb, jsonb, text, boolean, text, jsonb
) FROM PUBLIC, anon;

-- Re-grant only to authenticated (idempotent)
GRANT EXECUTE ON FUNCTION public.log_admin_action(
  text, text, uuid, jsonb, jsonb, text, boolean, text, jsonb
) TO authenticated;