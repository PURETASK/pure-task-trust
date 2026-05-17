-- Legal acceptances log
CREATE TABLE public.legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('terms','privacy','cookies','acceptable_use')),
  document_version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_legal_acceptances_user ON public.legal_acceptances(user_id);
CREATE INDEX idx_legal_acceptances_doc ON public.legal_acceptances(document_type, document_version);

ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own acceptances"
  ON public.legal_acceptances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own acceptances"
  ON public.legal_acceptances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all acceptances"
  ON public.legal_acceptances FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Privacy / CCPA requests
CREATE TYPE public.privacy_request_type AS ENUM ('access','deletion','correction','opt_out','limit_sensitive','portability','other');
CREATE TYPE public.privacy_request_status AS ENUM ('received','verifying','in_progress','completed','denied','cancelled');

CREATE TABLE public.privacy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  request_type public.privacy_request_type NOT NULL,
  jurisdiction TEXT,
  details TEXT,
  status public.privacy_request_status NOT NULL DEFAULT 'received',
  admin_notes TEXT,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_privacy_requests_user ON public.privacy_requests(user_id);
CREATE INDEX idx_privacy_requests_status ON public.privacy_requests(status);
CREATE INDEX idx_privacy_requests_email ON public.privacy_requests(lower(email));

ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can submit a privacy request
CREATE POLICY "Anyone can submit privacy requests"
  ON public.privacy_requests FOR INSERT
  WITH CHECK (true);

-- Authenticated submitter can view their own requests
CREATE POLICY "Users view own privacy requests"
  ON public.privacy_requests FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Admins manage all
CREATE POLICY "Admins view all privacy requests"
  ON public.privacy_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update privacy requests"
  ON public.privacy_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_privacy_requests_updated_at
  BEFORE UPDATE ON public.privacy_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();