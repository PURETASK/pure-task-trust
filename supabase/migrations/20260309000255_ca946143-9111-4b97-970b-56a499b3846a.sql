
-- Add dispute_lost_jobs column to cleaner_metrics
ALTER TABLE public.cleaner_metrics 
  ADD COLUMN IF NOT EXISTS dispute_lost_jobs INTEGER NOT NULL DEFAULT 0;

-- Add tier_demotion_warning_at to cleaner_profiles for 7-day grace period demotion protection
ALTER TABLE public.cleaner_profiles
  ADD COLUMN IF NOT EXISTS tier_demotion_warning_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
