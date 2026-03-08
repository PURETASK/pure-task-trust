
-- CL-01: Add monthly earnings goal to cleaner_profiles
ALTER TABLE public.cleaner_profiles 
ADD COLUMN IF NOT EXISTS monthly_earnings_goal INTEGER DEFAULT NULL;

-- CL-02: Add preferences_json to client_profiles for client brief cards
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS preferences_json JSONB DEFAULT NULL;

-- CL-10: Create client_ratings table for two-way rating
-- cleaner_profiles.id and client_profiles.id are UUIDs
CREATE TABLE IF NOT EXISTS public.client_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id UUID NOT NULL REFERENCES public.cleaner_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  description_accuracy INTEGER CHECK (description_accuracy >= 1 AND description_accuracy <= 5),
  would_rebook BOOLEAN DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(job_id, cleaner_id)
);

ALTER TABLE public.client_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cleaners can insert client ratings"
  ON public.client_ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cleaner_profiles cp
      WHERE cp.id = cleaner_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Cleaners can view their ratings"
  ON public.client_ratings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cleaner_profiles cp
      WHERE cp.id = cleaner_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all client ratings"
  ON public.client_ratings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
