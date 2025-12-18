-- =====================================================
-- PHASE 1: ENUM TYPES
-- =====================================================

-- Job status enum
CREATE TYPE job_status AS ENUM (
  'created', 'pending', 'confirmed', 'in_progress', 'completed', 
  'cancelled', 'disputed', 'no_show'
);

-- Cleaning type enum
CREATE TYPE cleaning_type AS ENUM ('basic', 'deep', 'move_out', 'move_in');

-- Dispute status enum
CREATE TYPE dispute_status AS ENUM ('open', 'investigating', 'resolved', 'closed');

-- Payout status enum
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Reschedule status enum
CREATE TYPE reschedule_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Client status enum
CREATE TYPE client_status_enum AS ENUM ('active', 'inactive', 'suspended', 'banned');

-- Client risk band enum
CREATE TYPE client_risk_band AS ENUM ('low', 'normal', 'elevated', 'high');

-- Availability recurrence enum
CREATE TYPE availability_recurrence_enum AS ENUM ('one_time', 'weekly', 'biweekly', 'monthly');

-- Notification channel enum
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push', 'in_app');

-- Actor type enum
CREATE TYPE actor_type_enum AS ENUM ('client', 'cleaner', 'admin', 'system');

-- Sender type enum
CREATE TYPE sender_type AS ENUM ('client', 'cleaner', 'admin', 'system');

-- Credit reason enum
CREATE TYPE credit_reason AS ENUM (
  'purchase', 'refund', 'job_payment', 'job_earned', 'bonus', 
  'referral', 'cancellation_fee', 'dispute_refund', 'promo', 'adjustment'
);

-- Credit transaction type enum
CREATE TYPE credit_transaction_type AS ENUM (
  'purchase', 'spend', 'refund', 'hold', 'release', 'transfer', 'bonus', 'adjustment'
);

-- Reschedule bucket enum
CREATE TYPE reschedule_bucket AS ENUM ('same_day', 'next_day', 'within_week', 'future');

-- Cleaner event type enum
CREATE TYPE cleaner_event_type AS ENUM (
  'job_completed', 'job_cancelled', 'no_show', 'late_arrival', 
  'early_departure', 'photo_compliance', 'positive_review', 'negative_review'
);

-- Client risk event type enum
CREATE TYPE client_risk_event_type AS ENUM (
  'late_cancellation', 'no_show', 'payment_failed', 'dispute_filed', 
  'dispute_lost', 'multiple_reschedules'
);

-- Reliability event type enum
CREATE TYPE reliability_event_type AS ENUM (
  'on_time', 'late', 'no_show', 'early_checkout', 'photo_compliant', 
  'photo_missing', 'positive_rating', 'negative_rating', 'cancellation'
);

-- Job event type enum
CREATE TYPE job_event_type AS ENUM (
  'created', 'assigned', 'confirmed', 'started', 'paused', 'resumed',
  'completed', 'cancelled', 'disputed', 'rescheduled', 'photo_uploaded'
);

-- =====================================================
-- PHASE 2: CORE TABLES
-- =====================================================

-- Cities
CREATE TABLE public.cities (
  id serial PRIMARY KEY,
  name text NOT NULL,
  state_region text,
  country_code text NOT NULL DEFAULT 'US',
  timezone text NOT NULL DEFAULT 'America/Los_Angeles',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Platform service areas
CREATE TABLE public.platform_service_areas (
  id serial PRIMARY KEY,
  name text NOT NULL,
  city_id integer NOT NULL REFERENCES public.cities(id),
  zip_codes text[] NOT NULL,
  base_multiplier numeric NOT NULL DEFAULT 1.0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Addresses
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text,
  postal_code text,
  country text NOT NULL DEFAULT 'US',
  lat numeric,
  lng numeric,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Client profiles (linked to auth.users)
CREATE TABLE public.client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  first_name text,
  last_name text,
  default_address text,
  stripe_customer_id text,
  push_token text,
  grace_cancellations_used integer DEFAULT 0,
  grace_cancellations_total integer DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner profiles (linked to auth.users)
CREATE TABLE public.cleaner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  first_name text,
  last_name text,
  bio text,
  hourly_rate_credits integer NOT NULL DEFAULT 0,
  base_rate_cph numeric,
  deep_addon_cph numeric,
  moveout_addon_cph numeric,
  avg_rating numeric,
  jobs_completed integer NOT NULL DEFAULT 0,
  reliability_score numeric NOT NULL DEFAULT 100.0,
  tier text NOT NULL DEFAULT 'bronze',
  low_flexibility_badge boolean NOT NULL DEFAULT false,
  payout_percent numeric DEFAULT 80,
  is_available boolean DEFAULT true,
  travel_radius_km numeric DEFAULT 50,
  minimum_payout_cents integer DEFAULT 2500,
  max_jobs_per_day integer DEFAULT 5,
  payout_schedule text DEFAULT 'weekly',
  instant_payout_enabled boolean DEFAULT false,
  background_check_required boolean DEFAULT true,
  background_check_status text DEFAULT 'not_started',
  accepts_high_risk boolean DEFAULT false,
  push_token text,
  latitude numeric,
  longitude numeric,
  stripe_account_id text,
  stripe_connect_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Properties
CREATE TABLE public.properties (
  id serial PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  service_area_id integer REFERENCES public.platform_service_areas(id),
  label text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state_region text,
  postal_code text,
  country_code text NOT NULL DEFAULT 'US',
  latitude numeric,
  longitude numeric,
  notes text,
  bedrooms integer,
  bathrooms numeric,
  square_feet integer,
  has_pets boolean DEFAULT false,
  has_kids boolean DEFAULT false,
  cleaning_score numeric NOT NULL DEFAULT 100,
  last_basic_at timestamptz,
  last_deep_at timestamptz,
  last_moveout_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner teams
CREATE TABLE public.cleaner_teams (
  id serial PRIMARY KEY,
  owner_cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  name text NOT NULL,
  description text,
  max_members integer NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Jobs
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  property_id integer REFERENCES public.properties(id),
  team_id integer REFERENCES public.cleaner_teams(id),
  cleaning_type cleaning_type NOT NULL,
  status job_status NOT NULL DEFAULT 'created',
  title text,
  notes text,
  cleaner_notes text,
  is_rush boolean DEFAULT false,
  rush_fee_credits integer DEFAULT 0,
  estimated_hours numeric,
  estimated_minutes integer,
  actual_hours numeric,
  actual_minutes integer,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  actual_start_at timestamptz,
  actual_end_at timestamptz,
  check_in_at timestamptz,
  check_out_at timestamptz,
  check_in_lat numeric,
  check_in_lng numeric,
  check_out_lat numeric,
  check_out_lng numeric,
  checkin_lat double precision,
  checkin_lng double precision,
  checkout_lat double precision,
  checkout_lng double precision,
  snapshot_base_rate_cph numeric,
  snapshot_addon_rate_cph numeric,
  snapshot_total_rate_cph numeric,
  escrow_credits_reserved numeric NOT NULL DEFAULT 0,
  credit_charge_credits numeric,
  final_charge_credits numeric,
  refund_credits numeric,
  base_rate_cents bigint,
  extra_fees_cents bigint,
  discount_cents bigint,
  total_charge_cents bigint,
  tasks_completed_json jsonb,
  metadata jsonb,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cities (public read)
CREATE POLICY "Cities are publicly readable" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Admins can manage cities" ON public.cities FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for service areas (public read)
CREATE POLICY "Service areas are publicly readable" ON public.platform_service_areas FOR SELECT USING (true);
CREATE POLICY "Admins can manage service areas" ON public.platform_service_areas FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for addresses
CREATE POLICY "Users can view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all addresses" ON public.addresses FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for client_profiles
CREATE POLICY "Users can view own client profile" ON public.client_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own client profile" ON public.client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own client profile" ON public.client_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Cleaners can view client profiles for their jobs" ON public.client_profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.client_id = client_profiles.id AND jobs.cleaner_id IN 
    (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all client profiles" ON public.client_profiles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_profiles
CREATE POLICY "Users can view own cleaner profile" ON public.cleaner_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cleaner profile" ON public.cleaner_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cleaner profile" ON public.cleaner_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can view available cleaners" ON public.cleaner_profiles FOR SELECT USING (is_available = true);
CREATE POLICY "Admins can manage all cleaner profiles" ON public.cleaner_profiles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for properties
CREATE POLICY "Clients can view own properties" ON public.properties FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Clients can insert own properties" ON public.properties FOR INSERT 
  WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Clients can update own properties" ON public.properties FOR UPDATE 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Cleaners can view properties for their jobs" ON public.properties FOR SELECT 
  USING (id IN (SELECT property_id FROM public.jobs WHERE cleaner_id IN 
    (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all properties" ON public.properties FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_teams
CREATE POLICY "Team owners can manage their teams" ON public.cleaner_teams FOR ALL 
  USING (owner_cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Public can view active teams" ON public.cleaner_teams FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all teams" ON public.cleaner_teams FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for jobs
CREATE POLICY "Clients can view own jobs" ON public.jobs FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Cleaners can view assigned jobs" ON public.jobs FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Clients can create jobs" ON public.jobs FOR INSERT 
  WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Cleaners can update assigned jobs" ON public.jobs FOR UPDATE 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Clients can update own jobs" ON public.jobs FOR UPDATE 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all jobs" ON public.jobs FOR ALL USING (has_role(auth.uid(), 'admin'));