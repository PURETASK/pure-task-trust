
-- 1. User Sessions
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT,
  browser TEXT,
  ip_address TEXT,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_current BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sessions" ON public.user_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.user_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.user_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON public.user_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. Refund Requests
CREATE TABLE public.refund_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id),
  amount_credits INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  decided_by UUID,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view own refunds" ON public.refund_requests FOR SELECT TO authenticated USING (auth.uid() = client_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients create refunds" ON public.refund_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins update refunds" ON public.refund_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_refund_requests_updated_at BEFORE UPDATE ON public.refund_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Cleaner Client Notes
CREATE TABLE public.cleaner_client_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cleaner_id UUID NOT NULL,
  client_id UUID NOT NULL,
  property_id UUID,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cleaner_id, client_id, property_id)
);
ALTER TABLE public.cleaner_client_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cleaners manage own notes" ON public.cleaner_client_notes FOR ALL TO authenticated USING (auth.uid() = cleaner_id);
CREATE TRIGGER update_cleaner_client_notes_updated_at BEFORE UPDATE ON public.cleaner_client_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Cleaner Certifications
CREATE TABLE public.cleaner_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cleaner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  document_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cleaner_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view verified certs" ON public.cleaner_certifications FOR SELECT TO authenticated USING (is_verified = true OR auth.uid() = cleaner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Cleaners create own certs" ON public.cleaner_certifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = cleaner_id);
CREATE POLICY "Cleaners update own certs" ON public.cleaner_certifications FOR UPDATE TO authenticated USING (auth.uid() = cleaner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Cleaners delete own certs" ON public.cleaner_certifications FOR DELETE TO authenticated USING (auth.uid() = cleaner_id);
CREATE TRIGGER update_cleaner_certifications_updated_at BEFORE UPDATE ON public.cleaner_certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Cleaning Presets
CREATE TABLE public.cleaning_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  property_id UUID,
  name TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cleaning_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients manage own presets" ON public.cleaning_presets FOR ALL TO authenticated USING (auth.uid() = client_id);
CREATE TRIGGER update_cleaning_presets_updated_at BEFORE UPDATE ON public.cleaning_presets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Satisfaction Pulses
CREATE TABLE public.satisfaction_pulses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id),
  rating TEXT NOT NULL CHECK (rating IN ('thumbs_up', 'thumbs_down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, job_id)
);
ALTER TABLE public.satisfaction_pulses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients manage own pulses" ON public.satisfaction_pulses FOR ALL TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Admins view all pulses" ON public.satisfaction_pulses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. Property Profiles
CREATE TABLE public.property_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  address_id UUID REFERENCES public.addresses(id),
  name TEXT NOT NULL DEFAULT 'My Property',
  sq_ft INTEGER,
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  pet_info TEXT,
  has_pets BOOLEAN NOT NULL DEFAULT false,
  access_instructions TEXT,
  parking_notes TEXT,
  special_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.property_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients manage own properties" ON public.property_profiles FOR ALL TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Cleaners view assigned properties" ON public.property_profiles FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    INNER JOIN public.cleaner_profiles cp ON cp.id = j.cleaner_id
    WHERE j.client_id = property_profiles.client_id
    AND cp.user_id = auth.uid()
  )
);
CREATE TRIGGER update_property_profiles_updated_at BEFORE UPDATE ON public.property_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Webhook Event Log
CREATE TABLE public.webhook_event_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'stripe',
  event_type TEXT NOT NULL,
  event_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'received',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.webhook_event_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view webhook logs" ON public.webhook_event_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. Health Check Logs
CREATE TABLE public.health_check_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  status TEXT NOT NULL,
  latency_ms INTEGER,
  error_message TEXT,
  metadata JSONB,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_check_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view health logs" ON public.health_check_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. Data Export Requests
CREATE TABLE public.data_export_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  file_url TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own exports" ON public.data_export_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users request own exports" ON public.data_export_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all exports" ON public.data_export_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 11. Soft Delete columns
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.cleaner_profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.client_profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Indexes for soft delete filtering
CREATE INDEX IF NOT EXISTS idx_jobs_deleted_at ON public.jobs(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cleaner_profiles_deleted_at ON public.cleaner_profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON public.reviews(deleted_at) WHERE deleted_at IS NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_webhook_event_log_created ON public.webhook_event_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_check_logs_checked ON public.health_check_logs(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_satisfaction_pulses_job ON public.satisfaction_pulses(job_id);
CREATE INDEX IF NOT EXISTS idx_property_profiles_client ON public.property_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_presets_client ON public.cleaning_presets(client_id);
CREATE INDEX IF NOT EXISTS idx_cleaner_certifications_cleaner ON public.cleaner_certifications(cleaner_id);
