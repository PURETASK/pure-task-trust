CREATE TABLE IF NOT EXISTS public.launch_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  state text,
  zip_code text,
  notify_marketing_opt_in boolean NOT NULL DEFAULT false,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email, state)
);

CREATE INDEX IF NOT EXISTS idx_launch_waitlist_state ON public.launch_waitlist(state);
CREATE INDEX IF NOT EXISTS idx_launch_waitlist_created ON public.launch_waitlist(created_at DESC);

ALTER TABLE public.launch_waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can add themselves to the waitlist (anonymous + authenticated)
CREATE POLICY "Anyone can join waitlist"
  ON public.launch_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read or manage the waitlist
CREATE POLICY "Admins can view waitlist"
  ON public.launch_waitlist
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update waitlist"
  ON public.launch_waitlist
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete waitlist"
  ON public.launch_waitlist
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));