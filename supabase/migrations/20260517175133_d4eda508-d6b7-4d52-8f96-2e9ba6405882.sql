
-- SMS suppression list (STOP keyword, manual opt-outs)
CREATE TABLE IF NOT EXISTS public.sms_suppressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 TEXT NOT NULL UNIQUE,
  suppression_type TEXT NOT NULL DEFAULT 'stop_keyword',
  source TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sms_suppressions_phone ON public.sms_suppressions(phone_e164);

ALTER TABLE public.sms_suppressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sms suppressions"
  ON public.sms_suppressions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- SMS audit log (outbound + inbound)
CREATE TABLE IF NOT EXISTS public.sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  direction TEXT NOT NULL CHECK (direction IN ('outbound','inbound')),
  to_e164 TEXT,
  from_e164 TEXT,
  body TEXT NOT NULL,
  consent_type TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  twilio_sid TEXT,
  suppression_reason TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sms_messages_user ON public.sms_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created ON public.sms_messages(created_at DESC);

ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sms messages"
  ON public.sms_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own sms messages"
  ON public.sms_messages FOR SELECT
  USING (auth.uid() = user_id);
