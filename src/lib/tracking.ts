// Observability and tracking system
// Sends UI events to the `funnel_events` table via `lib/funnel-sink.ts`.
// Previously POSTed to /api/events/ui which did not exist (silent drop).

import { recordFunnelEvent } from './funnel-sink';

const SESSION_ID = crypto.randomUUID();
let currentTraceId = crypto.randomUUID();

export type EventType =
  | 'ui.screen_viewed'
  | 'ui.action_clicked'
  | 'ui.api_request.started'
  | 'ui.api_request.completed'
  | 'ui.api_request.failed'
  | 'ui.error'
  | 'ui.navigation'
  | 'ui.form_submitted'
  | 'ui.modal_opened'
  | 'ui.modal_closed';

export interface TrackingEvent {
  event_type: EventType;
  trace_id: string;
  session_id: string;
  timestamp: string;
  properties: Record<string, unknown>;
  page_url?: string;
  user_agent?: string;
}

// Generate new trace ID for user actions
export function startNewTrace(): string {
  currentTraceId = crypto.randomUUID();
  return currentTraceId;
}

export function getCurrentTraceId(): string {
  return currentTraceId;
}

export function getSessionId(): string {
  return SESSION_ID;
}

// Core tracking function
export function track(eventType: EventType, properties: Record<string, unknown> = {}): void {
  recordFunnelEvent({
    session_id: SESSION_ID,
    trace_id: currentTraceId,
    event_type: eventType,
    properties,
    page_url: typeof window !== 'undefined' ? window.location.href : null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  });
}

// Convenience functions
export function trackScreenView(screenName: string, properties: Record<string, unknown> = {}): void {
  startNewTrace(); // New trace for each screen view
  track('ui.screen_viewed', { screen_name: screenName, ...properties });
}

export function trackClick(actionName: string, properties: Record<string, unknown> = {}): void {
  track('ui.action_clicked', { action_name: actionName, ...properties });
}

export function trackApiRequest(
  status: 'started' | 'completed' | 'failed',
  endpoint: string,
  properties: Record<string, unknown> = {}
): void {
  track(`ui.api_request.${status}`, { endpoint, ...properties });
}

export function trackError(error: Error | string, properties: Record<string, unknown> = {}): void {
  track('ui.error', {
    error_message: error instanceof Error ? error.message : error,
    error_stack: error instanceof Error ? error.stack : undefined,
    ...properties,
  });
}

export function trackNavigation(from: string, to: string): void {
  track('ui.navigation', { from, to });
}

export function trackFormSubmit(formName: string, properties: Record<string, unknown> = {}): void {
  track('ui.form_submitted', { form_name: formName, ...properties });
}

export function trackModal(action: 'opened' | 'closed', modalName: string): void {
  track(action === 'opened' ? 'ui.modal_opened' : 'ui.modal_closed', { modal_name: modalName });
}
