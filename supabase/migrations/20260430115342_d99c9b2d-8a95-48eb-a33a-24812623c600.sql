-- Wave 1 / Primitive #3: funnel_events
-- Persistent sink for UI tracking + funnel step events. Replaces the
-- dead drop to /api/events/ui in src/lib/tracking.ts.

CREATE TABLE IF NOT EXISTS public.funnel_events (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id   UUID NOT NULL,
  trace_id     UUID NOT NULL,

  -- Funnel coordinates (NULL for ad-hoc track() events)
  funnel_name  TEXT,
  step_name    TEXT,
  step_index   INTEGER,

  -- Generic event envelope (mirrors tracking.ts)
  event_type   TEXT NOT NULL,
  properties   JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_url     TEXT,
  user_agent   TEXT,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hot-path indexes for funnel analytics
CREATE INDEX IF NOT EXISTS idx_funnel_events_funnel_step
  ON public.funnel_events (funnel_name, step_index, created_at DESC)
  WHERE funnel_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_funnel_events_user_recent
  ON public.funnel_events (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_funnel_events_session
  ON public.funnel_events (session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_funnel_events_event_type
  ON public.funnel_events (event_type, created_at DESC);

-- RLS: anyone (incl. anon) can INSERT their own activity, only admins can read
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert funnel events"
ON public.funnel_events
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  -- If user_id is provided, it must match the caller (or be null for anon)
  user_id IS NULL OR user_id = auth.uid()
);

CREATE POLICY "Admins can read all funnel events"
ON public.funnel_events
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can read their own funnel events"
ON public.funnel_events
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

COMMENT ON TABLE public.funnel_events IS
  'Persistent sink for UI tracking events and named funnel steps. Written by useFunnel() and lib/tracking.ts.';