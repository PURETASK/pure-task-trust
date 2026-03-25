
-- Add AI bio + structured profile fields to cleaner_profiles
ALTER TABLE public.cleaner_profiles
  ADD COLUMN IF NOT EXISTS years_experience INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cleaning_types TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{English}',
  ADD COLUMN IF NOT EXISTS work_style TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS personality TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_bio TEXT,
  ADD COLUMN IF NOT EXISTS bio_score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bio_generated_at TIMESTAMPTZ;
