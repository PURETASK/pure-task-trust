-- Analytics events table for tracking user behavior
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}',
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying events by user and time
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- RLS: Users can insert their own events, admins can read all
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can read all analytics events"
ON public.analytics_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- A/B tests configuration table
CREATE TABLE public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  variants JSONB NOT NULL DEFAULT '["control", "variant_a"]',
  traffic_split JSONB DEFAULT '{"control": 50, "variant_a": 50}',
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active tests"
ON public.ab_tests
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage tests"
ON public.ab_tests
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- A/B test user assignments
CREATE TABLE public.ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  test_id UUID REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_test UNIQUE (user_id, test_id),
  CONSTRAINT unique_anonymous_test UNIQUE (anonymous_id, test_id)
);

CREATE INDEX idx_ab_test_assignments_test_id ON public.ab_test_assignments(test_id);

ALTER TABLE public.ab_test_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own assignments"
ON public.ab_test_assignments
FOR SELECT
USING (auth.uid() = user_id OR anonymous_id IS NOT NULL);

CREATE POLICY "Anyone can insert assignments"
ON public.ab_test_assignments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can read all assignments"
ON public.ab_test_assignments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Leads capture table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT,
  source TEXT DEFAULT 'website',
  page_path TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB DEFAULT '{}',
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage leads"
ON public.leads
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed initial A/B tests
INSERT INTO public.ab_tests (name, description, variants, traffic_split) VALUES
('hero_cta_text', 'Test different CTA button text on homepage', '["control", "variant_a", "variant_b"]', '{"control": 34, "variant_a": 33, "variant_b": 33}'),
('booking_flow_steps', 'Test simplified vs detailed booking flow', '["control", "simplified"]', '{"control": 50, "simplified": 50}'),
('pricing_display', 'Test hourly vs per-cleaning pricing display', '["control", "per_cleaning"]', '{"control": 50, "per_cleaning": 50}');