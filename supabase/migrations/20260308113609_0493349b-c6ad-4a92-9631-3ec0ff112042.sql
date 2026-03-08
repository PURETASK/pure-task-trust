
CREATE TABLE IF NOT EXISTS public.platform_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage platform config"
ON public.platform_config
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.platform_config (key, value, description) VALUES
  ('platform_fee_pct_bronze', '20', 'Platform fee % for Bronze tier cleaners'),
  ('platform_fee_pct_silver', '18', 'Platform fee % for Silver tier cleaners'),
  ('platform_fee_pct_gold', '16', 'Platform fee % for Gold tier cleaners'),
  ('platform_fee_pct_platinum', '15', 'Platform fee % for Platinum tier cleaners'),
  ('cancellation_grace_hours', '24', 'Free cancellation window in hours'),
  ('instant_payout_fee_pct', '5', 'Instant payout fee %'),
  ('credit_to_usd_rate', '1.0', 'Credits to USD exchange rate'),
  ('feature_instant_payout', 'true', 'Enable instant payout feature'),
  ('feature_marketplace_jobs', 'true', 'Enable open marketplace'),
  ('feature_referral_program', 'true', 'Enable referral rewards program')
ON CONFLICT (key) DO NOTHING;
