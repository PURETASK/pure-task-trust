CREATE OR REPLACE FUNCTION public.validate_cleaner_hourly_rate()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
DECLARE
  cleaner_tier TEXT;
  min_rate     INTEGER := 20;
  max_rate     INTEGER;
  current_score NUMERIC;
BEGIN
  current_score := COALESCE(NEW.reliability_score, 0);

  IF current_score >= 90 THEN
    cleaner_tier := 'platinum'; max_rate := 65;
  ELSIF current_score >= 70 THEN
    cleaner_tier := 'gold';     max_rate := 50;
  ELSIF current_score >= 50 THEN
    cleaner_tier := 'silver';   max_rate := 40;
  ELSE
    cleaner_tier := 'bronze';   max_rate := 30;
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