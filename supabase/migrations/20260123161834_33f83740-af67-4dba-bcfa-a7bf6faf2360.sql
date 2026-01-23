-- Add onboarding progress persistence column
ALTER TABLE public.cleaner_profiles 
ADD COLUMN IF NOT EXISTS onboarding_current_step TEXT DEFAULT 'terms';

-- Add reminder tracking columns
ALTER TABLE public.cleaner_profiles
ADD COLUMN IF NOT EXISTS onboarding_reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for abandoned onboarding queries
CREATE INDEX IF NOT EXISTS idx_cleaner_profiles_abandoned_onboarding 
ON public.cleaner_profiles (onboarding_completed_at, onboarding_started_at, onboarding_reminder_sent_at)
WHERE onboarding_completed_at IS NULL;