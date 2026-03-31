ALTER TABLE public.cleaner_profiles ADD COLUMN IF NOT EXISTS intro_video_url TEXT;
ALTER TABLE public.cleaner_profiles ADD COLUMN IF NOT EXISTS supplies_provided BOOLEAN DEFAULT true;
ALTER TABLE public.cleaner_profiles ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN DEFAULT false;