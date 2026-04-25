-- Verification status enum
DO $$ BEGIN
  CREATE TYPE public.cleaner_verification_status AS ENUM ('pending', 'clear', 'consider', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Add new columns (idempotent)
ALTER TABLE public.cleaner_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS home_address jsonb,
  ADD COLUMN IF NOT EXISTS emergency_contact jsonb,
  ADD COLUMN IF NOT EXISTS verification_status public.cleaner_verification_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS pet_friendly boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS brings_supplies boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_connect_onboarded boolean NOT NULL DEFAULT false;

-- Index for filtering active+verified cleaners in search
CREATE INDEX IF NOT EXISTS idx_cleaner_profiles_verification_status
  ON public.cleaner_profiles (verification_status);

CREATE INDEX IF NOT EXISTS idx_cleaner_profiles_specialties
  ON public.cleaner_profiles USING GIN (specialties);

CREATE INDEX IF NOT EXISTS idx_cleaner_profiles_languages
  ON public.cleaner_profiles USING GIN (languages);