
-- 1. Ensure new cleaner_profiles rows always default to reliability_score=0 and tier='bronze'
ALTER TABLE public.cleaner_profiles
  ALTER COLUMN reliability_score SET DEFAULT 0,
  ALTER COLUMN tier SET DEFAULT 'bronze';

-- 2. Backfill any existing NULL values
UPDATE public.cleaner_profiles
  SET reliability_score = 0 WHERE reliability_score IS NULL;
UPDATE public.cleaner_profiles
  SET tier = 'bronze' WHERE tier IS NULL;

-- 3. Fix the validate_cleaner_hourly_rate trigger so Bronze min is $25 (not $20)
CREATE OR REPLACE FUNCTION public.validate_cleaner_hourly_rate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  cleaner_tier TEXT;
  min_rate     INTEGER;
  max_rate     INTEGER;
  current_score NUMERIC;
BEGIN
  current_score := COALESCE(NEW.reliability_score, 0);

  IF current_score >= 90 THEN
    cleaner_tier := 'platinum'; min_rate := 50;  max_rate := 100;
  ELSIF current_score >= 70 THEN
    cleaner_tier := 'gold';     min_rate := 40;  max_rate := 65;
  ELSIF current_score >= 50 THEN
    cleaner_tier := 'silver';   min_rate := 30;  max_rate := 50;
  ELSE
    cleaner_tier := 'bronze';   min_rate := 25;  max_rate := 35;
  END IF;

  NEW.tier := cleaner_tier;

  IF NEW.hourly_rate_credits < min_rate THEN
    NEW.hourly_rate_credits := min_rate;
  ELSIF NEW.hourly_rate_credits > max_rate THEN
    NEW.hourly_rate_credits := max_rate;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Create the trigger that was missing (applies on INSERT + UPDATE)
DROP TRIGGER IF EXISTS trg_validate_cleaner_hourly_rate ON public.cleaner_profiles;
CREATE TRIGGER trg_validate_cleaner_hourly_rate
  BEFORE INSERT OR UPDATE ON public.cleaner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_cleaner_hourly_rate();
