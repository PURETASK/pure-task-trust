// API client layer with CSRF, idempotency, and trace headers

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Generate a unique trace ID for the session
const SESSION_TRACE_ID = crypto.randomUUID();

// Generate unique IDs
export const generateTraceId = () => crypto.randomUUID();
export const generateIdempotencyKey = () => `${Date.now()}-${crypto.randomUUID()}`;

// Get CSRF token from cookie or meta tag
const getCSRFToken = (): string | null => {
  // Try cookie first
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  if (match) return match[1];
  
  // Try meta tag
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute('content') || null;
};

// Base fetch wrapper with all required headers
export interface ApiFetchOptions extends RequestInit {
  includeCSRF?: boolean;
  idempotencyKey?: string;
  traceId?: string;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const {
    includeCSRF = false,
    idempotencyKey,
    traceId = generateTraceId(),
    ...fetchOptions
  } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Trace-Id': traceId,
    'X-Request-Id': generateTraceId(),
    'X-Session-Id': SESSION_TRACE_ID,
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add CSRF token for write operations
  if (includeCSRF || ['POST', 'PATCH', 'PUT', 'DELETE'].includes(fetchOptions.method?.toUpperCase() || '')) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  // Add idempotency key for critical operations
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Always include cookies for auth
    });

    const data = response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : null;

    if (!response.ok) {
      return {
        data: null,
        error: data?.message || data?.error || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return { data, error: null, status: response.status };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      status: 0,
    };
  }
}

// Helper for POST with idempotency
export async function postWithIdempotency<T = unknown>(
  endpoint: string,
  body: unknown,
  options: Omit<ApiFetchOptions, 'method' | 'body'> = {}
) {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
    idempotencyKey: options.idempotencyKey || generateIdempotencyKey(),
  });
}

// Job transition helper
export type JobStatus = 
  | 'requested'
  | 'accepted'
  | 'on_my_way'
  | 'in_progress'
  | 'awaiting_approval'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export async function transitionJob(jobId: string, newStatus: JobStatus, metadata?: Record<string, unknown>) {
  return postWithIdempotency(`/jobs/${jobId}/transition`, {
    status: newStatus,
    metadata,
    transitioned_at: new Date().toISOString(),
  });
}

// Credits helpers
export async function buyCredits(amount: number) {
  return postWithIdempotency('/credits/checkout', { amount });
}

export async function getCreditsBalance() {
  return apiFetch<{ available: number; held: number }>('/credits/balance');
}

// Job helpers
export async function createJob(jobData: {
  cleaner_id: string;
  cleaning_type: string;
  hours: number;
  addons?: string[];
  scheduled_date: string;
  address: string;
}) {
  return postWithIdempotency('/jobs', jobData);
}

export async function getJob(jobId: string) {
  return apiFetch(`/jobs/${jobId}`);
}

export async function approveJob(jobId: string) {
  return postWithIdempotency(`/jobs/${jobId}/approve`, {
    approved_at: new Date().toISOString(),
  });
}

export async function disputeJob(jobId: string, reason: string) {
  return postWithIdempotency(`/jobs/${jobId}/dispute`, {
    reason,
    disputed_at: new Date().toISOString(),
  });
}

// Messages helpers
export async function getJobMessages(jobId: string) {
  return apiFetch(`/messages/job/${jobId}`);
}

export async function sendMessage(jobId: string, content: string) {
  return postWithIdempotency(`/messages/job/${jobId}`, { content });
}
