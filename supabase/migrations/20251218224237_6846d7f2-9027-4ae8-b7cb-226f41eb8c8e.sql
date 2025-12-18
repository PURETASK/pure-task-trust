-- =====================================================
-- PHASE 8: CLEANER METRICS & RELIABILITY
-- =====================================================

-- Cleaner metrics
CREATE TABLE public.cleaner_metrics (
  cleaner_id uuid PRIMARY KEY REFERENCES public.cleaner_profiles(id),
  total_jobs_window integer NOT NULL DEFAULT 0,
  attended_jobs integer NOT NULL DEFAULT 0,
  no_show_jobs integer NOT NULL DEFAULT 0,
  on_time_checkins integer NOT NULL DEFAULT 0,
  photo_compliant_jobs integer NOT NULL DEFAULT 0,
  communication_ok_jobs integer NOT NULL DEFAULT 0,
  completion_ok_jobs integer NOT NULL DEFAULT 0,
  ratings_count integer NOT NULL DEFAULT 0,
  ratings_sum numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner events
CREATE TABLE public.cleaner_events (
  id bigserial PRIMARY KEY,
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  job_id uuid REFERENCES public.jobs(id),
  event_type cleaner_event_type NOT NULL,
  weight integer NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner reliability events
CREATE TABLE public.cleaner_reliability_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  job_id uuid REFERENCES public.jobs(id),
  event_type reliability_event_type NOT NULL,
  weight numeric NOT NULL DEFAULT 0,
  notes text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner reliability scores
CREATE TABLE public.cleaner_reliability_scores (
  cleaner_id uuid PRIMARY KEY REFERENCES public.cleaner_profiles(id),
  current_score numeric NOT NULL DEFAULT 100,
  total_events integer NOT NULL DEFAULT 0,
  last_event_at timestamptz,
  last_recalculated_at timestamptz NOT NULL DEFAULT now()
);

-- Reliability history
CREATE TABLE public.reliability_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  old_score numeric NOT NULL,
  new_score numeric NOT NULL,
  old_tier text NOT NULL,
  new_tier text NOT NULL,
  reason text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reliability snapshots
CREATE TABLE public.reliability_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  score integer NOT NULL,
  tier text,
  inputs jsonb NOT NULL,
  breakdown jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner tier history
CREATE TABLE public.cleaner_tier_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  from_tier text,
  to_tier text NOT NULL,
  reason text,
  triggered_by text,
  triggered_by_user_id uuid,
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner preferences
CREATE TABLE public.cleaner_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL UNIQUE REFERENCES public.cleaner_profiles(id),
  min_job_duration_h numeric NOT NULL DEFAULT 1.0,
  max_job_duration_h numeric NOT NULL DEFAULT 8.0,
  max_jobs_per_day integer NOT NULL DEFAULT 5,
  accepts_pets boolean NOT NULL DEFAULT true,
  accepts_deep_clean boolean NOT NULL DEFAULT true,
  accepts_move_out boolean NOT NULL DEFAULT true,
  has_own_supplies boolean NOT NULL DEFAULT false,
  has_vehicle boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner service areas
CREATE TABLE public.cleaner_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  zip_code text,
  city text,
  state text,
  latitude numeric,
  longitude numeric,
  radius_miles integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner goals
CREATE TABLE public.cleaner_goals (
  id serial PRIMARY KEY,
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  month date NOT NULL,
  goal_type text NOT NULL DEFAULT 'jobs',
  target_value integer NOT NULL,
  current_value integer NOT NULL DEFAULT 0,
  reward_credits integer NOT NULL,
  is_awarded boolean NOT NULL DEFAULT false,
  awarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner flex profiles
CREATE TABLE public.cleaner_flex_profiles (
  cleaner_id uuid PRIMARY KEY REFERENCES public.cleaner_profiles(id),
  reasonable_declines_14d integer NOT NULL DEFAULT 0,
  reasonable_declines_30d integer NOT NULL DEFAULT 0,
  low_flexibility_active boolean NOT NULL DEFAULT false,
  badge_assigned_at timestamptz,
  badge_removed_at timestamptz,
  last_evaluated_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner boosts
CREATE TABLE public.cleaner_boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  boost_type text NOT NULL DEFAULT 'standard',
  multiplier numeric NOT NULL DEFAULT 1.5,
  credits_spent integer NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  jobs_during integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner no-shows
CREATE TABLE public.cleaner_no_shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  bonus_credits integer NOT NULL DEFAULT 50,
  processed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cleaner weekly streaks
CREATE TABLE public.cleaner_weekly_streaks (
  id bigserial PRIMARY KEY,
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  week_start date NOT NULL,
  is_streak boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Flexibility decline events
CREATE TABLE public.flexibility_decline_events (
  id bigserial PRIMARY KEY,
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  reschedule_event_id bigint REFERENCES public.reschedule_events(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Background checks
CREATE TABLE public.background_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  provider text NOT NULL DEFAULT 'checkr',
  provider_id text,
  status text NOT NULL DEFAULT 'pending',
  report_url text,
  completed_at timestamptz,
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- PHASE 9: CLIENT RISK & FAVORITES
-- =====================================================

-- Client flex profiles
CREATE TABLE public.client_flex_profiles (
  client_id uuid PRIMARY KEY REFERENCES public.client_profiles(id),
  flex_score numeric NOT NULL DEFAULT 0.5,
  cancellations_30d integer NOT NULL DEFAULT 0,
  late_reschedules_30d integer NOT NULL DEFAULT 0,
  reschedules_30d integer NOT NULL DEFAULT 0,
  metadata jsonb,
  last_computed_at timestamptz NOT NULL DEFAULT now()
);

-- Client risk events
CREATE TABLE public.client_risk_events (
  id bigserial PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  job_id uuid REFERENCES public.jobs(id),
  event_type client_risk_event_type NOT NULL,
  weight integer NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Client risk scores
CREATE TABLE public.client_risk_scores (
  client_id uuid PRIMARY KEY REFERENCES public.client_profiles(id),
  risk_score numeric NOT NULL DEFAULT 0,
  risk_band client_risk_band NOT NULL DEFAULT 'normal',
  last_recomputed_at timestamptz NOT NULL DEFAULT now()
);

-- Favorite cleaners
CREATE TABLE public.favorite_cleaners (
  id serial PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, cleaner_id)
);

-- Match recommendations
CREATE TABLE public.match_recommendations (
  id bigserial PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  rank integer NOT NULL,
  match_score numeric NOT NULL,
  breakdown jsonb,
  generated_at timestamptz NOT NULL DEFAULT now()
);

-- Inconvenience logs
CREATE TABLE public.inconvenience_logs (
  id bigserial PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  score integer NOT NULL,
  caused_by varchar NOT NULL,
  reason_link varchar,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cleaner_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_reliability_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_reliability_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reliability_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reliability_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_tier_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_flex_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_no_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_weekly_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flexibility_decline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_flex_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inconvenience_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cleaner_metrics
CREATE POLICY "Cleaners can view own metrics" ON public.cleaner_metrics FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all metrics" ON public.cleaner_metrics FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_events
CREATE POLICY "Cleaners can view own events" ON public.cleaner_events FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all cleaner events" ON public.cleaner_events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_reliability_events
CREATE POLICY "Cleaners can view own reliability events" ON public.cleaner_reliability_events FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all reliability events" ON public.cleaner_reliability_events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_reliability_scores
CREATE POLICY "Cleaners can view own reliability score" ON public.cleaner_reliability_scores FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all reliability scores" ON public.cleaner_reliability_scores FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for reliability_history
CREATE POLICY "Cleaners can view own reliability history" ON public.reliability_history FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all reliability history" ON public.reliability_history FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for reliability_snapshots
CREATE POLICY "Cleaners can view own snapshots" ON public.reliability_snapshots FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all snapshots" ON public.reliability_snapshots FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_tier_history
CREATE POLICY "Cleaners can view own tier history" ON public.cleaner_tier_history FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all tier history" ON public.cleaner_tier_history FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_preferences
CREATE POLICY "Cleaners can manage own preferences" ON public.cleaner_preferences FOR ALL 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all preferences" ON public.cleaner_preferences FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_service_areas
CREATE POLICY "Cleaners can manage own service areas" ON public.cleaner_service_areas FOR ALL 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Public can view service areas" ON public.cleaner_service_areas FOR SELECT USING (true);
CREATE POLICY "Admins can manage all service areas" ON public.cleaner_service_areas FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_goals
CREATE POLICY "Cleaners can view own goals" ON public.cleaner_goals FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all goals" ON public.cleaner_goals FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_flex_profiles
CREATE POLICY "Cleaners can view own flex profile" ON public.cleaner_flex_profiles FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all flex profiles" ON public.cleaner_flex_profiles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_boosts
CREATE POLICY "Cleaners can manage own boosts" ON public.cleaner_boosts FOR ALL 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all boosts" ON public.cleaner_boosts FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_no_shows
CREATE POLICY "Participants can view no-shows" ON public.cleaner_no_shows FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()) OR
         client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all no-shows" ON public.cleaner_no_shows FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cleaner_weekly_streaks
CREATE POLICY "Cleaners can view own streaks" ON public.cleaner_weekly_streaks FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all streaks" ON public.cleaner_weekly_streaks FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for flexibility_decline_events
CREATE POLICY "Cleaners can view own decline events" ON public.flexibility_decline_events FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all decline events" ON public.flexibility_decline_events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for background_checks
CREATE POLICY "Cleaners can view own background checks" ON public.background_checks FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all background checks" ON public.background_checks FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for client_flex_profiles
CREATE POLICY "Clients can view own flex profile" ON public.client_flex_profiles FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all client flex profiles" ON public.client_flex_profiles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for client_risk_events
CREATE POLICY "Clients can view own risk events" ON public.client_risk_events FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all client risk events" ON public.client_risk_events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for client_risk_scores
CREATE POLICY "Clients can view own risk score" ON public.client_risk_scores FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all client risk scores" ON public.client_risk_scores FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for favorite_cleaners
CREATE POLICY "Clients can manage own favorites" ON public.favorite_cleaners FOR ALL 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all favorites" ON public.favorite_cleaners FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for match_recommendations
CREATE POLICY "Clients can view own recommendations" ON public.match_recommendations FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Cleaners can view their recommendations" ON public.match_recommendations FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all recommendations" ON public.match_recommendations FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for inconvenience_logs
CREATE POLICY "Participants can view own inconvenience logs" ON public.inconvenience_logs FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
         cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all inconvenience logs" ON public.inconvenience_logs FOR ALL USING (has_role(auth.uid(), 'admin'));