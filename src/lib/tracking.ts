// Observability and tracking system
// Sends UI events to POST /events/ui

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
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

// Queue for batching events
let eventQueue: TrackingEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;
const FLUSH_INTERVAL = 2000; // 2 seconds
const MAX_QUEUE_SIZE = 10;

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
  const event: TrackingEvent = {
    event_type: eventType,
    trace_id: currentTraceId,
    session_id: SESSION_ID,
    timestamp: new Date().toISOString(),
    properties,
    page_url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  eventQueue.push(event);

  // Flush if queue is full
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushEvents();
  } else if (!flushTimeout) {
    // Schedule flush
    flushTimeout = setTimeout(flushEvents, FLUSH_INTERVAL);
  }
}

// Flush events to backend
async function flushEvents(): Promise<void> {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  try {
    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events: eventsToSend })], {
        type: 'application/json',
      });
      navigator.sendBeacon(`${API_BASE_URL}/events/ui`, blob);
    } else {
      // Fallback to fetch
      await fetch(`${API_BASE_URL}/events/ui`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend }),
        credentials: 'include',
        keepalive: true,
      });
    }
  } catch (error) {
    // Log error but don't crash the app
    console.error('Failed to send tracking events:', error);
    // Re-queue events on failure (with limit)
    if (eventQueue.length < MAX_QUEUE_SIZE * 2) {
      eventQueue.unshift(...eventsToSend);
    }
  }
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

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushEvents);
  window.addEventListener('pagehide', flushEvents);
}
