-- Ensure new cleaners always start at bronze tier with proper defaults
-- Update existing cleaners who have rates outside their tier range

-- First, ensure the default tier is bronze (already set, but let's be explicit)
ALTER TABLE public.cleaner_profiles 
  ALTER COLUMN tier SET DEFAULT 'bronze',
  ALTER COLUMN reliability_score SET DEFAULT 0,
  ALTER COLUMN hourly_rate_credits SET DEFAULT 20;

-- Create a function to validate and enforce tier-based hourly rate limits
CREATE OR REPLACE FUNCTION public.validate_cleaner_hourly_rate()
RETURNS TRIGGER AS $$
DECLARE
  cleaner_tier TEXT;
  min_rate INTEGER;
  max_rate INTEGER;
  current_score NUMERIC;
BEGIN
  -- Get the cleaner's current reliability score
  current_score := COALESCE(NEW.reliability_score, 0);
  
  -- Determine tier based on reliability score
  IF current_score >= 90 THEN
    cleaner_tier := 'platinum';
    min_rate := 50;
    max_rate := 100;
  ELSIF current_score >= 70 THEN
    cleaner_tier := 'gold';
    min_rate := 40;
    max_rate := 65;
  ELSIF current_score >= 50 THEN
    cleaner_tier := 'silver';
    min_rate := 30;
    max_rate := 50;
  ELSE
    cleaner_tier := 'bronze';
    min_rate := 20;
    max_rate := 35;
  END IF;
  
  -- Update tier based on score
  NEW.tier := cleaner_tier;
  
  -- Clamp hourly rate to tier's allowed range
  IF NEW.hourly_rate_credits < min_rate THEN
    NEW.hourly_rate_credits := min_rate;
  ELSIF NEW.hourly_rate_credits > max_rate THEN
    NEW.hourly_rate_credits := max_rate;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to validate on insert and update
DROP TRIGGER IF EXISTS validate_cleaner_rate_trigger ON public.cleaner_profiles;
CREATE TRIGGER validate_cleaner_rate_trigger
  BEFORE INSERT OR UPDATE ON public.cleaner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_cleaner_hourly_rate();

-- Fix any existing cleaners with incorrect tier or rates
UPDATE public.cleaner_profiles SET 
  tier = CASE 
    WHEN reliability_score >= 90 THEN 'platinum'
    WHEN reliability_score >= 70 THEN 'gold'
    WHEN reliability_score >= 50 THEN 'silver'
    ELSE 'bronze'
  END,
  hourly_rate_credits = CASE
    WHEN reliability_score >= 90 THEN LEAST(GREATEST(hourly_rate_credits, 50), 100)
    WHEN reliability_score >= 70 THEN LEAST(GREATEST(hourly_rate_credits, 40), 65)
    WHEN reliability_score >= 50 THEN LEAST(GREATEST(hourly_rate_credits, 30), 50)
    ELSE LEAST(GREATEST(hourly_rate_credits, 20), 35)
  END;