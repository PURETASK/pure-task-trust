/**
 * Wave 1 / Primitive #3 — useFunnel()
 * ----------------------------------------------------------------------------
 * Declarative funnel instrumentation hook.
 *
 * Why this exists:
 *   - Multiple P0 findings: "we don't know where users drop off in booking,
 *     onboarding, payment". Without funnel events we can't measure conversion
 *     or A/B test changes.
 *   - Replaces ad-hoc `track('ui.action_clicked', { action_name: 'next_step_2' })`
 *     calls with a typed, ordered sequence so analytics queries become trivial:
 *
 *       SELECT step_name, COUNT(DISTINCT session_id)
 *       FROM funnel_events
 *       WHERE funnel_name = 'booking'
 *       GROUP BY step_name, step_index
 *       ORDER BY step_index;
 *
 * How it works:
 *   - Hook is called once with a funnel name and ordered step list.
 *   - Returns `{ trackStep, trackComplete, trackAbandon }` callbacks.
 *   - Each call writes one row to `public.funnel_events` via the sink.
 *   - Auto-emits `started` on first step, plus carries session_id + trace_id
 *     for cross-event correlation.
 *
 * Usage:
 *   const funnel = useFunnel('booking', [
 *     'service', 'datetime', 'scope', 'cleaner', 'review', 'payment'
 *   ]);
 *
 *   // When user advances:
 *   funnel.trackStep('datetime', { service_type: 'standard' });
 *
 *   // On confirmation:
 *   funnel.trackComplete({ total_credits: 145, cleaner_id });
 *
 *   // On exit / unmount without complete:
 *   funnel.trackAbandon('user_navigated_away', { last_step: step });
 */
import { useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  recordFunnelEvent,
  type FunnelEventInsert,
} from '@/lib/funnel-sink';
import { getSessionId, getCurrentTraceId, startNewTrace } from '@/lib/tracking';

export interface FunnelHandle {
  /** Record advancement to a specific step. Auto-handles step_index lookup. */
  trackStep: (stepName: string, properties?: Record<string, unknown>) => void;
  /** Record successful completion of the entire funnel. */
  trackComplete: (properties?: Record<string, unknown>) => void;
  /** Record an abandonment (user left, error, etc.). */
  trackAbandon: (reason: string, properties?: Record<string, unknown>) => void;
  /** Manual event under the same funnel umbrella (e.g. validation errors). */
  trackEvent: (
    eventType: string,
    properties?: Record<string, unknown>,
  ) => void;
  /** Begin a fresh trace (use when re-entering the funnel). */
  resetTrace: () => string;
}

export function useFunnel(
  funnelName: string,
  steps: readonly string[] = [],
): FunnelHandle {
  const { user } = useAuth();
  const startedRef = useRef(false);

  // Cache: stepName -> step_index for O(1) lookup
  const stepIndex = useMemo(() => {
    const m = new Map<string, number>();
    steps.forEach((s, i) => m.set(s, i));
    return m;
  }, [steps]);

  const baseEnvelope = useCallback((): Pick<
    FunnelEventInsert,
    'user_id' | 'session_id' | 'trace_id' | 'funnel_name' | 'page_url' | 'user_agent'
  > => ({
    user_id: user?.id ?? null,
    session_id: getSessionId(),
    trace_id: getCurrentTraceId(),
    funnel_name: funnelName,
    page_url: typeof window !== 'undefined' ? window.location.href : null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  }), [user?.id, funnelName]);

  const trackStep = useCallback(
    (stepName: string, properties: Record<string, unknown> = {}) => {
      // Emit a synthetic 'started' on the very first step
      if (!startedRef.current) {
        startedRef.current = true;
        recordFunnelEvent({
          ...baseEnvelope(),
          step_name: '__started__',
          step_index: -1,
          event_type: 'funnel.started',
          properties: { entry_step: stepName },
        });
      }

      recordFunnelEvent({
        ...baseEnvelope(),
        step_name: stepName,
        step_index: stepIndex.get(stepName) ?? null,
        event_type: 'funnel.step',
        properties,
      });
    },
    [baseEnvelope, stepIndex],
  );

  const trackComplete = useCallback(
    (properties: Record<string, unknown> = {}) => {
      recordFunnelEvent({
        ...baseEnvelope(),
        step_name: '__completed__',
        step_index: steps.length,
        event_type: 'funnel.completed',
        properties,
      });
      startedRef.current = false; // allow re-entry
    },
    [baseEnvelope, steps.length],
  );

  const trackAbandon = useCallback(
    (reason: string, properties: Record<string, unknown> = {}) => {
      if (!startedRef.current) return; // never started → don't log abandon
      recordFunnelEvent({
        ...baseEnvelope(),
        step_name: '__abandoned__',
        step_index: null,
        event_type: 'funnel.abandoned',
        properties: { reason, ...properties },
      });
      startedRef.current = false;
    },
    [baseEnvelope],
  );

  const trackEvent = useCallback(
    (eventType: string, properties: Record<string, unknown> = {}) => {
      recordFunnelEvent({
        ...baseEnvelope(),
        step_name: null,
        step_index: null,
        event_type,
        properties,
      });
    },
    [baseEnvelope],
  );

  const resetTrace = useCallback(() => {
    startedRef.current = false;
    return startNewTrace();
  }, []);

  return { trackStep, trackComplete, trackAbandon, trackEvent, resetTrace };
}
