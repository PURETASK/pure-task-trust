-- =====================================================
-- PHASE 5: JOB TRACKING & EVENTS TABLES
-- =====================================================

-- Job offers
CREATE TABLE public.job_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  decline_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Job checkins
CREATE TABLE public.job_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  type text NOT NULL,
  lat numeric,
  lng numeric,
  distance_from_job_meters numeric,
  is_within_radius boolean,
  device_info jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Job events
CREATE TABLE public.job_events (
  id serial PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id),
  event_type job_event_type NOT NULL,
  actor_type text NOT NULL,
  actor_id text,
  payload jsonb NOT NULL DEFAULT '{}',
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Job photos
CREATE TABLE public.job_photos (
  id serial PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id),
  photo_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Job GPS logs
CREATE TABLE public.job_gps_logs (
  id serial PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id),
  type text,
  lat numeric,
  lng numeric,
  created_at timestamptz DEFAULT now()
);

-- Job time logs
CREATE TABLE public.job_time_logs (
  id serial PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id),
  segment_start timestamptz DEFAULT now(),
  segment_end timestamptz,
  seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Job status history
CREATE TABLE public.job_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  from_status text,
  to_status text NOT NULL,
  changed_by_type text,
  changed_by_user_id uuid,
  reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Job queue (background jobs)
CREATE TABLE public.job_queue (
  id serial PRIMARY KEY,
  queue_name text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  priority integer NOT NULL DEFAULT 0,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Photo compliance
CREATE TABLE public.photo_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  total_photos integer NOT NULL DEFAULT 0,
  before_photos integer NOT NULL DEFAULT 0,
  after_photos integer NOT NULL DEFAULT 0,
  meets_minimum boolean NOT NULL DEFAULT false,
  bonus_applied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- PHASE 6: DISPUTES & CANCELLATIONS
-- =====================================================

-- Disputes
CREATE TABLE public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  status dispute_status NOT NULL DEFAULT 'open',
  client_notes text NOT NULL,
  admin_notes text,
  reason_code text,
  description text,
  within_window boolean DEFAULT true,
  job_completed_at timestamptz,
  resolution_type text,
  resolution_notes text,
  refund_amount_credits integer,
  opened_by_user_id uuid,
  resolved_by_user_id uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Dispute actions
CREATE TABLE public.dispute_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid NOT NULL REFERENCES public.disputes(id),
  action text NOT NULL,
  actor_type text NOT NULL,
  actor_user_id uuid,
  details jsonb DEFAULT '{}',
  attachments jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cancellation events
CREATE TABLE public.cancellation_events (
  id bigserial PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  client_id uuid REFERENCES public.client_profiles(id),
  cleaner_id uuid REFERENCES public.cleaner_profiles(id),
  cancelled_by varchar NOT NULL,
  type varchar,
  reason_code varchar,
  t_cancel timestamptz NOT NULL,
  hours_before_start numeric,
  bucket varchar,
  is_emergency boolean NOT NULL DEFAULT false,
  grace_used boolean NOT NULL DEFAULT false,
  after_reschedule_declined boolean NOT NULL DEFAULT false,
  job_status_at_cancellation varchar,
  fee_pct integer NOT NULL DEFAULT 0,
  fee_credits integer NOT NULL DEFAULT 0,
  refund_credits integer NOT NULL DEFAULT 0,
  bonus_credits_to_client integer NOT NULL DEFAULT 0,
  cleaner_comp_credits integer NOT NULL DEFAULT 0,
  platform_comp_credits integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cancellation records
CREATE TABLE public.cancellation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  cancelled_by uuid NOT NULL,
  cancelled_by_role text NOT NULL,
  scheduled_start timestamptz NOT NULL,
  cancellation_time timestamptz NOT NULL DEFAULT now(),
  hours_before numeric NOT NULL,
  fee_percent numeric DEFAULT 0,
  penalty_credits integer,
  penalty_applied boolean NOT NULL DEFAULT false,
  is_grace_period boolean NOT NULL DEFAULT false,
  refund_credits integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Grace cancellations
CREATE TABLE public.grace_cancellations (
  id bigserial PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  job_id uuid REFERENCES public.jobs(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reschedule events
CREATE TABLE public.reschedule_events (
  id bigserial PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id),
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  cleaner_id uuid NOT NULL REFERENCES public.cleaner_profiles(id),
  requested_by varchar NOT NULL,
  requested_to varchar NOT NULL,
  t_request timestamptz NOT NULL,
  t_start_original timestamptz NOT NULL,
  t_start_new timestamptz NOT NULL,
  hours_before_original numeric NOT NULL,
  bucket reschedule_bucket NOT NULL,
  reason_code varchar,
  status reschedule_status NOT NULL DEFAULT 'pending',
  declined_by varchar,
  decline_reason_code varchar,
  is_reasonable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Reschedule reason codes
CREATE TABLE public.reschedule_reason_codes (
  id serial PRIMARY KEY,
  code varchar NOT NULL UNIQUE,
  requester_type varchar NOT NULL,
  reason_text text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- PHASE 7: MESSAGING TABLES
-- =====================================================

-- Message threads
CREATE TABLE public.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.jobs(id),
  client_id uuid REFERENCES public.client_profiles(id),
  cleaner_id uuid REFERENCES public.cleaner_profiles(id),
  subject text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.message_threads(id),
  sender_type sender_type NOT NULL,
  sender_id uuid,
  body text NOT NULL,
  sent_via text,
  external_id text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_gps_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grace_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reschedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reschedule_reason_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_offers
CREATE POLICY "Cleaners can view own offers" ON public.job_offers FOR SELECT 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Cleaners can update own offers" ON public.job_offers FOR UPDATE 
  USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all offers" ON public.job_offers FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for job_checkins
CREATE POLICY "Job participants can view checkins" ON public.job_checkins FOR SELECT 
  USING (job_id IN (SELECT id FROM public.jobs WHERE 
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Cleaners can insert checkins" ON public.job_checkins FOR INSERT 
  WITH CHECK (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all checkins" ON public.job_checkins FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for job_events
CREATE POLICY "Job participants can view events" ON public.job_events FOR SELECT 
  USING (job_id IN (SELECT id FROM public.jobs WHERE 
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all events" ON public.job_events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for job_photos
CREATE POLICY "Job participants can view photos" ON public.job_photos FOR SELECT 
  USING (job_id IN (SELECT id FROM public.jobs WHERE 
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Cleaners can insert photos" ON public.job_photos FOR INSERT 
  WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE 
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all photos" ON public.job_photos FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for job_gps_logs (same as photos)
CREATE POLICY "Job participants can view gps logs" ON public.job_gps_logs FOR SELECT 
  USING (job_id IN (SELECT id FROM public.jobs WHERE 
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all gps logs" ON public.job_gps_logs FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for job_time_logs
CREATE POLICY "Job participants can view time logs" ON public.job_time_logs FOR SELECT 
  USING (job_id IN (SELECT id FROM public.jobs WHERE 
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all time logs" ON public.job_time_logs FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for job_status_history
CREATE POLICY "Job participants can view history" ON public.job_status_history FOR SELECT 
  USING (job_id IN (SELECT id FROM public.jobs WHERE 
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all history" ON public.job_status_history FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for job_queue (admin only)
CREATE POLICY "Admins can manage job queue" ON public.job_queue FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for photo_compliance
CREATE POLICY "Job participants can view compliance" ON public.photo_compliance FOR SELECT 
  USING (job_id IN (SELECT id FROM public.jobs WHERE 
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all compliance" ON public.photo_compliance FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for disputes
CREATE POLICY "Clients can view own disputes" ON public.disputes FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Clients can create disputes" ON public.disputes FOR INSERT 
  WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Cleaners can view disputes for their jobs" ON public.disputes FOR SELECT 
  USING (job_id IN (SELECT id FROM public.jobs WHERE 
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all disputes" ON public.disputes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for dispute_actions
CREATE POLICY "Dispute participants can view actions" ON public.dispute_actions FOR SELECT 
  USING (dispute_id IN (SELECT id FROM public.disputes WHERE 
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all dispute actions" ON public.dispute_actions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cancellation_events
CREATE POLICY "Participants can view own cancellations" ON public.cancellation_events FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
         cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all cancellations" ON public.cancellation_events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for cancellation_records
CREATE POLICY "Users can view own cancellation records" ON public.cancellation_records FOR SELECT USING (auth.uid() = cancelled_by);
CREATE POLICY "Admins can manage all cancellation records" ON public.cancellation_records FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for grace_cancellations
CREATE POLICY "Clients can view own grace cancellations" ON public.grace_cancellations FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all grace cancellations" ON public.grace_cancellations FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for reschedule_events
CREATE POLICY "Participants can view own reschedules" ON public.reschedule_events FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
         cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all reschedules" ON public.reschedule_events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for reschedule_reason_codes (public read)
CREATE POLICY "Anyone can view reason codes" ON public.reschedule_reason_codes FOR SELECT USING (true);
CREATE POLICY "Admins can manage reason codes" ON public.reschedule_reason_codes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for message_threads
CREATE POLICY "Participants can view own threads" ON public.message_threads FOR SELECT 
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
         cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Participants can create threads" ON public.message_threads FOR INSERT 
  WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
              cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all threads" ON public.message_threads FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for messages
CREATE POLICY "Thread participants can view messages" ON public.messages FOR SELECT 
  USING (thread_id IN (SELECT id FROM public.message_threads WHERE 
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Thread participants can insert messages" ON public.messages FOR INSERT 
  WITH CHECK (thread_id IN (SELECT id FROM public.message_threads WHERE 
    client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all messages" ON public.messages FOR ALL USING (has_role(auth.uid(), 'admin'));