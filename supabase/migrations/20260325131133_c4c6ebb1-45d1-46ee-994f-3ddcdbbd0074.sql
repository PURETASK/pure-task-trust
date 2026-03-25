-- Fix the overly permissive INSERT policy for referrals_tracking
-- A referral tracking record must reference a valid authenticated user as either referrer or referee
DROP POLICY IF EXISTS "Users can create referral tracking" ON public.referrals_tracking;
CREATE POLICY "Users can create referral tracking"
  ON public.referrals_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referee_id);