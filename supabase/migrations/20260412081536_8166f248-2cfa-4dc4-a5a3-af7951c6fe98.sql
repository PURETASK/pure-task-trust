-- MFA settings per user
CREATE TABLE public.mfa_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  method TEXT NOT NULL DEFAULT 'none' CHECK (method IN ('none', 'totp', 'email', 'both')),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own MFA settings"
  ON public.mfa_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MFA settings"
  ON public.mfa_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own MFA settings"
  ON public.mfa_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_mfa_settings_updated_at
  BEFORE UPDATE ON public.mfa_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TOTP secrets (encrypted server-side)
CREATE TABLE public.totp_secrets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  encrypted_secret TEXT NOT NULL,
  recovery_codes TEXT[] NOT NULL DEFAULT '{}',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.totp_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own TOTP secrets"
  ON public.totp_secrets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own TOTP secrets"
  ON public.totp_secrets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own TOTP secrets"
  ON public.totp_secrets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- MFA challenges (verification codes)
CREATE TABLE public.mfa_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('totp', 'email')),
  code_hash TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mfa_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own MFA challenges"
  ON public.mfa_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MFA challenges"
  ON public.mfa_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own MFA challenges"
  ON public.mfa_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_mfa_challenges_user_expires ON public.mfa_challenges (user_id, expires_at);