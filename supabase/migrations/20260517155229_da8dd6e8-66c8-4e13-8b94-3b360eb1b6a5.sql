
-- =================================================================
-- CHG-001: consent_records
-- =================================================================
CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'terms_of_service','privacy_policy','cookie_policy',
    'aup','cancellation_policy','pro_ic_agreement',
    'fcra_disclosure','sms_transactional','sms_marketing',
    'cookies_functional','cookies_analytics','cookies_advertising',
    'ccpa_optout','gpc_signal','arbitration_optout','age_18_plus'
  )),
  document_version TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  exact_text_shown TEXT NOT NULL,
  consent_method TEXT NOT NULL CHECK (consent_method IN (
    'signup_clickwrap','settings_toggle','gpc_signal',
    'cookie_banner','sms_keyword','email_unsubscribe','api'
  )),
  ip_address INET,
  user_agent TEXT,
  geolocation_country TEXT,
  geolocation_region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_consent_user ON public.consent_records(user_id);
CREATE INDEX idx_consent_type ON public.consent_records(document_type);
CREATE INDEX idx_consent_created ON public.consent_records(created_at);
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own consent records" ON public.consent_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own consent records" ON public.consent_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all consent records" ON public.consent_records FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =================================================================
-- CHG-002: legal_documents
-- =================================================================
CREATE TABLE public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  version TEXT NOT NULL,
  effective_date DATE NOT NULL,
  content_markdown TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slug, version)
);
CREATE UNIQUE INDEX idx_legal_current ON public.legal_documents(slug) WHERE is_current = TRUE;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read legal documents" ON public.legal_documents FOR SELECT USING (true);
CREATE POLICY "Admins write legal documents" ON public.legal_documents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.legal_documents (slug, version, effective_date, content_markdown, is_current) VALUES
  ('terms-of-service','2.0','2026-05-17','Pending content sync from /docs/legal/terms-of-service.md',TRUE),
  ('privacy-policy','2.0','2026-05-17','Pending content sync',TRUE),
  ('cookie-policy','2.0','2026-05-17','Pending content sync',TRUE),
  ('aup','2.0','2026-05-17','Pending content sync',TRUE),
  ('cancellation-policy','2.0','2026-05-17','Pending content sync',TRUE),
  ('pro-ic-agreement','2.0','2026-05-17','Pending content',TRUE),
  ('fcra-disclosure','2.0','2026-05-17','Pending content',TRUE),
  ('sms-consent','2.0','2026-05-17','Pending content',TRUE),
  ('accessibility','2.0','2026-05-17','Pending content',TRUE),
  ('dmca','2.0','2026-05-17','Pending content',TRUE);

-- =================================================================
-- CHG-003: profiles additions
-- =================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS operating_state TEXT CHECK (operating_state IN ('CA','TX','FL')),
  ADD COLUMN IF NOT EXISTS sanctions_screened BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sanctions_screened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (account_status IN ('pending','active','suspended','terminated','closed')),
  ADD COLUMN IF NOT EXISTS closure_reason TEXT,
  ADD COLUMN IF NOT EXISTS closure_initiated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_eligible_after TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_email_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marketing_sms_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS gpc_signal_detected BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ccpa_opted_out_of_sale_share BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ccpa_optout_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS arbitration_opted_out BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS arbitration_optout_at TIMESTAMPTZ;

UPDATE public.profiles SET account_status = 'active' WHERE account_status = 'pending' AND created_at < now() - interval '1 minute';

-- =================================================================
-- CHG-004: pro_credentials
-- =================================================================
CREATE TABLE public.pro_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL CHECK (credential_type IN ('business_license','ein','commercial_general_liability')),
  document_url TEXT,
  document_number_encrypted TEXT,
  issuing_authority TEXT,
  effective_date DATE,
  expiration_date DATE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  cgl_per_occurrence_amount DECIMAL(12,2),
  cgl_aggregate_amount DECIMAL(12,2),
  cgl_additional_insured_confirmed BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, credential_type)
);
ALTER TABLE public.pro_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pros read own credentials" ON public.pro_credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Pros insert own credentials" ON public.pro_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Pros update own credentials" ON public.pro_credentials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all credentials" ON public.pro_credentials FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_pro_credentials_updated_at BEFORE UPDATE ON public.pro_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =================================================================
-- CHG-005: extend existing background_checks for FCRA workflow
-- =================================================================
ALTER TABLE public.background_checks
  ADD COLUMN IF NOT EXISTS checkr_candidate_id TEXT,
  ADD COLUMN IF NOT EXISTS checkr_report_id TEXT,
  ADD COLUMN IF NOT EXISTS initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS pre_adverse_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS adverse_action_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS applicant_response_received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS applicant_response_text TEXT,
  ADD COLUMN IF NOT EXISTS individualized_assessment_notes TEXT,
  ADD COLUMN IF NOT EXISTS next_recheck_due_date DATE,
  ADD COLUMN IF NOT EXISTS is_ongoing_monitoring BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_bg_check_recheck_due ON public.background_checks(next_recheck_due_date);

-- =================================================================
-- CHG-006: sms_consent_records
-- =================================================================
CREATE TABLE public.sms_consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('transactional','marketing')),
  consent_given BOOLEAN NOT NULL,
  exact_consent_text TEXT NOT NULL,
  consent_method TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revocation_method TEXT
);
CREATE INDEX idx_sms_consent_user_phone ON public.sms_consent_records(user_id, phone_number);
CREATE INDEX idx_sms_consent_active ON public.sms_consent_records(phone_number, consent_type) WHERE revoked_at IS NULL;
ALTER TABLE public.sms_consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own SMS consent" ON public.sms_consent_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own SMS consent" ON public.sms_consent_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all SMS consent" ON public.sms_consent_records FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =================================================================
-- CHG-007: compliance_audit_log
-- =================================================================
CREATE TABLE public.compliance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user','admin','system','vendor')),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_caudit_actor ON public.compliance_audit_log(actor_user_id);
CREATE INDEX idx_caudit_resource ON public.compliance_audit_log(resource_type, resource_id);
CREATE INDEX idx_caudit_action ON public.compliance_audit_log(action);
CREATE INDEX idx_caudit_created ON public.compliance_audit_log(created_at);
ALTER TABLE public.compliance_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own audit entries" ON public.compliance_audit_log FOR SELECT USING (auth.uid() = actor_user_id);
CREATE POLICY "Authenticated insert audit entries" ON public.compliance_audit_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins read all audit entries" ON public.compliance_audit_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));
