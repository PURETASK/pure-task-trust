/**
 * Wave 1 / Primitive #1 — Admin Audit Log Wrapper
 * ----------------------------------------------------------------------------
 * Single source of truth for writing entries into `admin_audit_log`.
 *
 * Why a wrapper:
 *   - Replaces 5+ direct `.from('admin_audit_log').insert(...)` call sites
 *     that silently swallowed errors (P0 finding from AdminPlatformConfig:
 *     "Audit + upsert not transactional — audit can drop silently").
 *   - Routes through the SECURITY DEFINER `log_admin_action` RPC, which:
 *       1. Verifies the caller is actually an admin server-side
 *       2. Validates `action` is non-trivial
 *       3. Returns the audit row id so callers can attach it to follow-up
 *          actions if needed
 *   - Standardises the audit row shape so `AdminAuditLog` and reports stay
 *     consistent.
 *
 * Two helpers exported:
 *   - `logAdminAction(...)` — fire a single audit entry. Throws on failure.
 *   - `withAdminAuditLog(action, entry, fn)` — runs `fn`, then audits
 *     success/failure with old/new values automatically. Re-throws after
 *     auditing so callers can show toasts / handle errors normally.
 *
 * Usage:
 *   await logAdminAction({
 *     action: 'platform_config_updated',
 *     entity_type: 'platform_config',
 *     entity_id: key,
 *     new_values: { [key]: value },
 *     reason: 'Edited via Platform Config panel',
 *   });
 *
 *   const result = await withAdminAuditLog(
 *     'fraud_alert_resolved',
 *     { entity_type: 'fraud_alert', entity_id: alertId },
 *     async () => {
 *       const { error } = await supabase
 *         .from('fraud_alerts')
 *         .update({ status: 'resolved' })
 *         .eq('id', alertId);
 *       if (error) throw error;
 *       return { ok: true };
 *     }
 *   );
 */

import { supabase } from '@/integrations/supabase/client';

/** Shape of a single audit entry. Matches the `log_admin_action` RPC args. */
export interface AdminAuditEntry {
  /** Required. Snake_case verb_noun, e.g. `platform_config_updated`. Min 3 chars. */
  action: string;
  /** Optional. Domain object type, e.g. `platform_config`, `fraud_alert`, `dispute`. */
  entity_type?: string | null;
  /** Optional. UUID of the affected row. */
  entity_id?: string | null;
  /** Optional. Snapshot of values BEFORE the change. */
  old_values?: Record<string, unknown> | null;
  /** Optional. Snapshot of values AFTER the change. */
  new_values?: Record<string, unknown> | null;
  /** Optional. Human-readable reason / context. */
  reason?: string | null;
  /** Optional. Free-form metadata (audience size, channel, etc.). */
  metadata?: Record<string, unknown> | null;
}

/** Result of `withAdminAuditLog`. */
export interface AuditedResult<T> {
  /** The value returned by the wrapped function. */
  value: T;
  /** The id of the audit row that was written. */
  audit_id: string;
}

/**
 * Write a single admin audit entry via the secure RPC.
 * Throws if the RPC fails (caller MUST handle the rejection — silent
 * `try { ... } catch {}` is an anti-pattern this wrapper is designed to
 * eliminate).
 */
export async function logAdminAction(entry: AdminAuditEntry): Promise<string> {
  if (!entry.action || entry.action.trim().length < 3) {
    throw new Error(`logAdminAction: 'action' must be at least 3 chars (got: ${entry.action})`);
  }

  const { data, error } = await supabase.rpc('log_admin_action', {
    _action: entry.action,
    _entity_type: entry.entity_type ?? null,
    _entity_id: entry.entity_id ?? null,
    _old_values: (entry.old_values as any) ?? null,
    _new_values: (entry.new_values as any) ?? null,
    _reason: entry.reason ?? null,
    _success: true,
    _error_message: null,
    _metadata: (entry.metadata as any) ?? {},
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[audit] log_admin_action failed:', error, entry);
    throw new Error(`Audit log write failed: ${error.message}`);
  }

  return data as unknown as string;
}

/**
 * Best-effort variant: write an audit entry, but never throw.
 * Use only when the audit write is genuinely optional (e.g. inside a
 * catch block that is already reporting the original error). Logs to
 * console on failure.
 */
export async function tryLogAdminAction(entry: AdminAuditEntry): Promise<string | null> {
  try {
    return await logAdminAction(entry);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[audit] tryLogAdminAction swallowed:', e);
    return null;
  }
}

/**
 * Run an admin mutation, then audit it (success OR failure).
 * On failure, writes an audit row with `success=false` and `error_message`
 * set, then re-throws the original error so callers can react normally.
 *
 * The audit write is fire-and-forget on the failure path so a broken audit
 * RPC can't mask the underlying mutation error.
 */
export async function withAdminAuditLog<T>(
  action: string,
  entry: Omit<AdminAuditEntry, 'action'>,
  fn: () => Promise<T>,
): Promise<AuditedResult<T>> {
  try {
    const value = await fn();
    const audit_id = await logAdminAction({ action, ...entry });
    return { value, audit_id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Best-effort: record the failed attempt without masking the real error.
    void supabase.rpc('log_admin_action', {
      _action: action,
      _entity_type: entry.entity_type ?? null,
      _entity_id: entry.entity_id ?? null,
      _old_values: (entry.old_values as any) ?? null,
      _new_values: (entry.new_values as any) ?? null,
      _reason: entry.reason ?? null,
      _success: false,
      _error_message: message,
      _metadata: (entry.metadata as any) ?? {},
    });
    throw err;
  }
}