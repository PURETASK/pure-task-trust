-- =====================================================
-- PHASE 10: NOTIFICATIONS
-- =====================================================

-- Notification preferences
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Notification templates
CREATE TABLE public.notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  channel notification_channel NOT NULL,
  subject text,
  body text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Notification log
CREATE TABLE public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL,
  channel text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payload jsonb NOT NULL DEFAULT '{}',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notification logs (alternative tracking)
CREATE TABLE public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL,
  channel text NOT NULL,
  recipient text NOT NULL,
  subject text,
  status text NOT NULL,
  provider_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notification failures
CREATE TABLE public.notification_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL,
  channel text NOT NULL,
  payload jsonb NOT NULL,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Device tokens
CREATE TABLE public.device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL,
  platform text NOT NULL,
  device_name text,
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- PHASE 11: REFERRALS
-- =====================================================

-- Referral codes
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'standard',
  reward_credits integer NOT NULL DEFAULT 20,
  referee_credits integer NOT NULL DEFAULT 10,
  uses_count integer NOT NULL DEFAULT 0,
  max_uses integer,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Referrals (tracking)
CREATE TABLE public.referrals_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referee_id uuid NOT NULL,
  referral_code text NOT NULL,
  referee_role text NOT NULL,
  referrer_reward integer NOT NULL DEFAULT 20,
  referee_reward integer NOT NULL DEFAULT 10,
  jobs_required integer NOT NULL DEFAULT 3,
  jobs_completed integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  rewarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- PHASE 12: ADMIN & AUDIT
-- =====================================================

-- Admin users
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text,
  full_name text,
  role text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Admin audit log
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  reason text,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit log (general)
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor_type actor_type_enum NOT NULL,
  actor_id uuid,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit logs (alternative)
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor_type text NOT NULL,
  actor_id uuid,
  resource_type text NOT NULL,
  resource_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- PHASE 13: SYSTEM & CONFIG
-- =====================================================

-- Feature flags
CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  description text,
  enabled boolean NOT NULL DEFAULT false,
  rollout_percentage integer,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- KPI daily
CREATE TABLE public.kpi_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL UNIQUE,
  jobs_created integer NOT NULL DEFAULT 0,
  jobs_completed integer NOT NULL DEFAULT 0,
  new_clients integer NOT NULL DEFAULT 0,
  new_cleaners integer NOT NULL DEFAULT 0,
  total_credits_purchased numeric NOT NULL DEFAULT 0,
  total_credits_used numeric NOT NULL DEFAULT 0,
  total_revenue_cents bigint NOT NULL DEFAULT 0,
  total_payouts_cents bigint NOT NULL DEFAULT 0,
  snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- KPI snapshots
CREATE TABLE public.kpi_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  total_jobs integer NOT NULL DEFAULT 0,
  completed_jobs integer NOT NULL DEFAULT 0,
  cancelled_jobs integer NOT NULL DEFAULT 0,
  disputed_jobs integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Backups
CREATE TABLE public.backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  data jsonb NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Backup runs
CREATE TABLE public.backup_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL,
  notes text,
  metadata jsonb,
  run_at timestamptz NOT NULL DEFAULT now()
);

-- Fraud alerts
CREATE TABLE public.fraud_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  metadata jsonb DEFAULT '{}',
  resolved_by uuid,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Integration events
CREATE TABLE public.integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_type text NOT NULL,
  external_id text,
  status text,
  error_message text,
  payload jsonb,
  related_client_id uuid,
  related_cleaner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Clients (legacy/alternative)
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  phone text,
  full_name text,
  stripe_customer_id text,
  status client_status_enum NOT NULL DEFAULT 'active',
  credit_balance integer NOT NULL DEFAULT 0,
  reliability_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaners (legacy/alternative)
CREATE TABLE public.cleaners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  bio text,
  hourly_rate numeric,
  rating numeric,
  status text NOT NULL DEFAULT 'inactive'
);

-- Customers (legacy)
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  address text,
  city text,
  state text,
  zipcode text
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all notification preferences" ON public.notification_preferences FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for notification_templates (admin only, public read)
CREATE POLICY "Anyone can view notification templates" ON public.notification_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage notification templates" ON public.notification_templates FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for notification_log
CREATE POLICY "Users can view own notification log" ON public.notification_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all notification logs" ON public.notification_log FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for notification_logs
CREATE POLICY "Users can view own notification logs" ON public.notification_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all notification logs alt" ON public.notification_logs FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for notification_failures (admin only)
CREATE POLICY "Admins can manage notification failures" ON public.notification_failures FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for device_tokens
CREATE POLICY "Users can manage own device tokens" ON public.device_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all device tokens" ON public.device_tokens FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_codes
CREATE POLICY "Users can view own referral codes" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own referral codes" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view active codes" ON public.referral_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all referral codes" ON public.referral_codes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for referrals_tracking
CREATE POLICY "Users can view own referrals" ON public.referrals_tracking FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
CREATE POLICY "Admins can manage all referrals" ON public.referrals_tracking FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for admin tables (admin only)
CREATE POLICY "Admins can manage admin users" ON public.admin_users FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage admin audit log" ON public.admin_audit_log FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage audit log" ON public.audit_log FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage audit logs" ON public.audit_logs FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for feature_flags
CREATE POLICY "Anyone can view feature flags" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for KPI tables (admin only)
CREATE POLICY "Admins can manage kpi_daily" ON public.kpi_daily FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage kpi_snapshots" ON public.kpi_snapshots FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for system tables (admin only)
CREATE POLICY "Admins can manage backups" ON public.backups FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage backup_runs" ON public.backup_runs FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage fraud_alerts" ON public.fraud_alerts FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage integration_events" ON public.integration_events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for legacy tables
CREATE POLICY "Users can view own client record" ON public.clients FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Admins can manage all clients" ON public.clients FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own cleaner record" ON public.cleaners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all cleaners" ON public.cleaners FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own customer record" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all customers" ON public.customers FOR ALL USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- FIX SECURITY WARNINGS: Set search_path on functions
-- =====================================================

-- Fix the existing functions that lack search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update handle_new_user to also create client/cleaner profile based on role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
  user_role app_role;
BEGIN
  -- Generate unique referral code
  LOOP
    ref_code := public.generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.referrals WHERE referral_code = ref_code);
  END LOOP;

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );

  -- Get the role from metadata or default to client
  user_role := COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'client');

  -- Create default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  -- Create credits record
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.id, 0);

  -- Create referral code for user
  INSERT INTO public.referrals (referrer_id, referral_code)
  VALUES (NEW.id, ref_code);

  -- Create client or cleaner profile based on role
  IF user_role = 'client' THEN
    INSERT INTO public.client_profiles (user_id, first_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
    
    INSERT INTO public.credit_accounts (user_id)
    VALUES (NEW.id);
  ELSIF user_role = 'cleaner' THEN
    INSERT INTO public.cleaner_profiles (user_id, first_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  END IF;

  -- Create notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;