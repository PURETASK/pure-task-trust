-- Allow all authenticated users to READ platform config (admin-only writes already in place).
-- Settings are non-secret operational values (fees, windows, thresholds) shown in client UI.
DROP POLICY IF EXISTS "Authenticated users can read platform config" ON public.platform_config;
CREATE POLICY "Authenticated users can read platform config"
ON public.platform_config
FOR SELECT
TO authenticated
USING (true);

-- Seed additional configuration keys used by the app.
INSERT INTO public.platform_config (key, value, description) VALUES
  ('rush_fee_credits',              '40',   'Flat rush fee in credits for same-day bookings'),
  ('same_day_min_notice_hours',     '6',    'Minimum hours of notice required for same-day bookings'),
  ('escrow_review_window_hours',    '24',   'Hours after job completion before escrow auto-releases'),
  ('cancel_fee_pct_lt_2h',          '100',  'Cancellation fee % when cancelling <2h before start'),
  ('cancel_fee_pct_lt_12h',         '50',   'Cancellation fee % when cancelling <12h before start'),
  ('cancel_fee_pct_lt_24h',         '25',   'Cancellation fee % when cancelling <24h before start'),
  ('no_show_minutes',               '45',   'Minutes after scheduled start before cleaner is marked no-show'),
  ('direct_charge_fee_pct',         '15',   'Platform fee % for direct credit-card charges (non-credit)'),
  ('reliability_threshold_silver',  '50',   'Reliability score required for Silver tier'),
  ('reliability_threshold_gold',    '70',   'Reliability score required for Gold tier'),
  ('reliability_threshold_platinum','90',   'Reliability score required for Platinum tier'),
  ('hourly_rate_min_credits',       '20',   'Minimum cleaner hourly rate (credits/hr)'),
  ('hourly_rate_max_bronze',        '30',   'Max cleaner hourly rate for Bronze tier'),
  ('hourly_rate_max_silver',        '40',   'Max cleaner hourly rate for Silver tier'),
  ('hourly_rate_max_gold',          '50',   'Max cleaner hourly rate for Gold tier'),
  ('hourly_rate_max_platinum',      '65',   'Max cleaner hourly rate for Platinum tier')
ON CONFLICT (key) DO NOTHING;