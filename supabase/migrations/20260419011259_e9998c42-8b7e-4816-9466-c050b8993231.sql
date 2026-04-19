
-- Phase 1 — Aero Glow onboarding/booking foundation
-- Additive only; no destructive changes.

-- 1) Client contact extras + setup completion flag
ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS alternate_email text,
  ADD COLUMN IF NOT EXISTS preferred_contact_method text,
  ADD COLUMN IF NOT EXISTS sms_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS setup_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS setup_current_step text;

-- 2) Property profile extras for Aero home-details + access steps
ALTER TABLE public.property_profiles
  ADD COLUMN IF NOT EXISTS home_type text,
  ADD COLUMN IF NOT EXISTS floors integer,
  ADD COLUMN IF NOT EXISTS has_elevator boolean,
  ADD COLUMN IF NOT EXISTS gate_code text,
  ADD COLUMN IF NOT EXISTS doorman_notes text,
  ADD COLUMN IF NOT EXISTS pet_friendly_required boolean NOT NULL DEFAULT false;

-- 3) Structured cleaning preferences (one row per client/property)
CREATE TABLE IF NOT EXISTS public.cleaning_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.property_profiles(id) ON DELETE CASCADE,
  extra_attention_notes text,
  avoid_notes text,
  priorities text[] NOT NULL DEFAULT '{}',
  product_preferences text,
  allergy_notes text,
  scent_preference text,
  eco_preference boolean NOT NULL DEFAULT false,
  recurring_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cleaning_preferences_client ON public.cleaning_preferences(client_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_preferences_property ON public.cleaning_preferences(property_id);

ALTER TABLE public.cleaning_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients manage own cleaning prefs" ON public.cleaning_preferences;
CREATE POLICY "Clients manage own cleaning prefs"
  ON public.cleaning_preferences
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_profiles cp
      WHERE cp.id = cleaning_preferences.client_id
        AND cp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.client_profiles cp
      WHERE cp.id = cleaning_preferences.client_id
        AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Cleaners view prefs for assigned jobs" ON public.cleaning_preferences;
CREATE POLICY "Cleaners view prefs for assigned jobs"
  ON public.cleaning_preferences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.jobs j
      JOIN public.cleaner_profiles cp ON cp.id = j.cleaner_id
      WHERE j.client_id = cleaning_preferences.client_id
        AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage all cleaning prefs" ON public.cleaning_preferences;
CREATE POLICY "Admins manage all cleaning prefs"
  ON public.cleaning_preferences
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS update_cleaning_preferences_updated_at ON public.cleaning_preferences;
CREATE TRIGGER update_cleaning_preferences_updated_at
  BEFORE UPDATE ON public.cleaning_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
