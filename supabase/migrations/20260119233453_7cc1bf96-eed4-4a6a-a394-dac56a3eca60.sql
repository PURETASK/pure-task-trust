-- Update cleaner_teams to allow unlimited members (set very high default)
ALTER TABLE public.cleaner_teams 
ALTER COLUMN max_members SET DEFAULT 999999;

-- Update existing teams to unlimited
UPDATE public.cleaner_teams SET max_members = 999999;