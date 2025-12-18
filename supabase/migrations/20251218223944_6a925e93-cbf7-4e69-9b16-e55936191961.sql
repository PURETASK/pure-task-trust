-- =====================================================
-- PHASE 3: CREDITS & PAYMENTS TABLES
-- =====================================================

-- Credit accounts
CREATE TABLE public.credit_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_balance integer NOT NULL DEFAULT 0,
  held_balance integer NOT NULL DEFAULT 0,
  lifetime_purchased integer NOT NULL DEFAULT 0,
  lifetime_spent integer NOT NULL DEFAULT 0,
  lifetime_refunded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Credit ledger
CREATE TABLE public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_id uuid REFERENCES public.jobs(id),
  delta_credits integer NOT NULL,
  reason credit_reason NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Credit purchases
CREATE TABLE public.credit_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id text NOT NULL,
  credits_amount integer NOT NULL,
  price_usd numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Credit transactions
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  job_id uuid REFERENCES public.jobs(id),
  type credit_transaction_type NOT NULL,
  amount_credits numeric NOT NULL,
  balance_after numeric,
  note text,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Credit bonuses
CREATE TABLE public.credit_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bonus_type text NOT NULL,
  amount integer NOT NULL,
  week_of_year integer NOT NULL,
  year integer NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payment intents
CREATE TABLE public.payment_intents (
  id text PRIMARY KEY,
  client_id uuid,
  job_id text,
  cleaner_id text,
  purpose text NOT NULL DEFAULT 'wallet_topup',
  amount_cents bigint NOT NULL DEFAULT 0,
  credits_amount integer,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL,
  last_event_type text,
  raw jsonb NOT NULL,
  updated_at_utc timestamptz NOT NULL DEFAULT now()
);

-- Payment failures
CREATE TABLE public.payment_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.client_profiles(id),
  stripe_event_id text,
  stripe_payment_intent_id text,
  stripe_error_code text,
  stripe_error_message text,
  amount_cents bigint,
  currency text,
  raw_event jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner earnings
CREATE TABLE public.cleaner_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  gross_credits numeric NOT NULL,
  net_credits numeric NOT NULL,
  platform_fee_credits numeric NOT NULL DEFAULT 0,
  payout_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payouts
CREATE TABLE public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  amount_credits numeric NOT NULL,
  amount_usd numeric,
  status payout_status NOT NULL DEFAULT 'pending',
  external_ref text,
  processed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payout requests
CREATE TABLE public.payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  payout_id uuid REFERENCES public.payouts(id),
  amount_credits integer NOT NULL,
  amount_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  decided_by uuid,
  decided_at timestamptz,
  requested_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Payout adjustments
CREATE TABLE public.payout_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  payout_id uuid REFERENCES public.payouts(id),
  adjustment_type text NOT NULL,
  amount_cents integer NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  stripe_reversal_id text,
  initiated_by uuid,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payout retry queue
CREATE TABLE public.payout_retry_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id uuid NOT NULL REFERENCES public.payouts(id),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  stripe_account_id text,
  amount_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  next_retry_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- PHASE 4: SCHEDULING & AVAILABILITY TABLES
-- =====================================================

-- Availability blocks
CREATE TABLE public.availability_blocks (
  id bigserial PRIMARY KEY,
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  day_of_week integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner availability
CREATE TABLE public.cleaner_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  recurrence_type availability_recurrence_enum NOT NULL DEFAULT 'one_time',
  day_of_week smallint,
  date date,
  start_time_local time,
  end_time_local time,
  timezone text,
  is_blocked boolean NOT NULL DEFAULT false,
  notes text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Blackout periods
CREATE TABLE public.blackout_periods (
  id bigserial PRIMARY KEY,
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  start_ts timestamptz NOT NULL,
  end_ts timestamptz NOT NULL,
  reason varchar,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner time off
CREATE TABLE public.cleaner_time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_time time,
  end_time time,
  all_day boolean NOT NULL DEFAULT true,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaning subscriptions
CREATE TABLE public.cleaning_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  cleaner_id uuid REFERENCES public.cleaner_profiles(id),
  property_id integer REFERENCES public.properties(id),
  frequency text NOT NULL,
  day_of_week smallint,
  preferred_time time,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  credit_amount integer NOT NULL,
  cleaning_type text DEFAULT 'basic',
  base_hours numeric DEFAULT 3.0,
  timezone text DEFAULT 'America/Los_Angeles',
  status text NOT NULL DEFAULT 'active',
  jobs_created integer NOT NULL DEFAULT 0,
  next_job_date date,
  paused_reason text,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Calendar connections
CREATE TABLE public.calendar_connections (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL,
  provider text NOT NULL,
  external_id text NOT NULL,
  email text,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  sync_enabled boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Calendar events
CREATE TABLE public.calendar_events (
  id serial PRIMARY KEY,
  connection_id integer NOT NULL REFERENCES public.calendar_connections(id),
  job_id uuid REFERENCES public.jobs(id),
  external_event_id text NOT NULL,
  event_type text NOT NULL DEFAULT 'job',
  synced_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_retry_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blackout_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_accounts
CREATE POLICY "Users can view own credit account" ON public.credit_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all credit accounts" ON public.credit_accounts FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for credit_ledger
CREATE POLICY "Users can view own credit ledger" ON public.credit_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all credit ledger" ON public.credit_ledger FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for credit_purchases
CREATE POLICY "Users can view own purchases" ON public.credit_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON public.credit_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all purchases" ON public.credit_purchases FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for credit_transactions
CREATE POLICY "Clients can view own transactions" ON public.credit_transactions FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all transactions" ON public.credit_transactions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for credit_bonuses
CREATE POLICY "Users can view own bonuses" ON public.credit_bonuses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all bonuses" ON public.credit_bonuses FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for payment_intents
CREATE POLICY "Users can view own payment intents" ON public.payment_intents FOR SELECT USING (auth.uid()::text = client_id::text);
CREATE POLICY "Admins can manage all payment intents" ON public.payment_intents FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for payment_failures
CREATE POLICY "Clients can view own payment failures" ON public.payment_failures FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all payment failures" ON public.payment_failures FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_earnings
CREATE POLICY "Cleaners can view own earnings" ON public.cleaner_earnings FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all earnings" ON public.cleaner_earnings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for payouts
CREATE POLICY "Cleaners can view own payouts" ON public.payouts FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all payouts" ON public.payouts FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for payout_requests
CREATE POLICY "Cleaners can view own payout requests" ON public.payout_requests FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Cleaners can insert own payout requests" ON public.payout_requests FOR INSERT 
  WITH CHECK (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all payout requests" ON public.payout_requests FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for payout_adjustments
CREATE POLICY "Cleaners can view own payout adjustments" ON public.payout_adjustments FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all payout adjustments" ON public.payout_adjustments FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for payout_retry_queue (admin only)
CREATE POLICY "Admins can manage payout retry queue" ON public.payout_retry_queue FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for availability_blocks
CREATE POLICY "Cleaners can manage own availability" ON public.availability_blocks FOR ALL 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Public can view availability" ON public.availability_blocks FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all availability" ON public.availability_blocks FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_availability
CREATE POLICY "Cleaners can manage own availability" ON public.cleaner_availability FOR ALL 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Public can view availability" ON public.cleaner_availability FOR SELECT USING (true);
CREATE POLICY "Admins can manage all availability" ON public.cleaner_availability FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for blackout_periods
CREATE POLICY "Cleaners can manage own blackouts" ON public.blackout_periods FOR ALL 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all blackouts" ON public.blackout_periods FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_time_off
CREATE POLICY "Cleaners can manage own time off" ON public.cleaner_time_off FOR ALL 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all time off" ON public.cleaner_time_off FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaning_subscriptions
CREATE POLICY "Clients can manage own subscriptions" ON public.cleaning_subscriptions FOR ALL 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Cleaners can view assigned subscriptions" ON public.cleaning_subscriptions FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all subscriptions" ON public.cleaning_subscriptions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for calendar_connections
CREATE POLICY "Users can manage own connections" ON public.calendar_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all connections" ON public.calendar_connections FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for calendar_events
CREATE POLICY "Users can view own calendar events" ON public.calendar_events FOR SELECT 
  USING (connection_id IN (SELECT id FROM public.calendar_connections WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all calendar events" ON public.calendar_events FOR ALL USING (has_role(auth.uid(), 'admin'));