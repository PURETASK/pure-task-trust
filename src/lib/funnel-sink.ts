/**
 * Wave 1 / Primitive #3 — Funnel Event Sink
 * ----------------------------------------------------------------------------
 * Backing store for `useFunnel()` and `lib/tracking.ts`.
 *
 * Why this exists:
 *   - `lib/tracking.ts` was POSTing to `/api/events/ui` — a non-existent
 *     endpoint. Every UI event was silently dropped (P0: no funnel data).
 *   - This sink writes to `public.funnel_events` (RLS allows anon insert,
 *     admin read) so the events actually persist and can be analyzed.
 *
 * Design notes:
 *   - Batches events (max 10 / 2s) like the old sink did.
 *   - Uses `supabase.from(...).insert(...)` directly — no edge function hop.
 *   - Drops events silently on failure (analytics must never break the UI).
 */
import { supabase } from '@/integrations/supabase/client';

export interface FunnelEventInsert {
  user_id?: string | null;
  session_id: string;
  trace_id: string;
  funnel_name?: string | null;
  step_name?: string | null;
  step_index?: number | null;
  event_type: string;
  properties?: Record<string, unknown>;
  page_url?: string | null;
  user_agent?: string | null;
}

const FLUSH_INTERVAL_MS = 2000;
const MAX_QUEUE_SIZE = 10;

let queue: FunnelEventInsert[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flush(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;

  const batch = queue.splice(0, queue.length);
  try {
    // Stamp current user_id at flush time if not provided
    const { data: auth } = await supabase.auth.getSession();
    const uid = auth.session?.user.id ?? null;

    const rows = batch.map((e) => ({
      user_id: e.user_id ?? uid,
      session_id: e.session_id,
      trace_id: e.trace_id,
      funnel_name: e.funnel_name ?? null,
      step_name: e.step_name ?? null,
      step_index: e.step_index ?? null,
      event_type: e.event_type,
      properties: e.properties ?? {},
      page_url: e.page_url ?? null,
      user_agent: e.user_agent ?? null,
    }));

    const { error } = await supabase
      .from('funnel_events' as any)
      .insert(rows);

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[funnel-sink] insert failed:', error.message);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[funnel-sink] flush exception:', err);
  }
}

export function recordFunnelEvent(event: FunnelEventInsert): void {
  queue.push(event);
  if (queue.length >= MAX_QUEUE_SIZE) {
    void flush();
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => void flush(), FLUSH_INTERVAL_MS);
  }
}

// Best-effort flush on tab hide / unload
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => void flush());
  window.addEventListener('beforeunload', () => void flush());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush();
  });
}
