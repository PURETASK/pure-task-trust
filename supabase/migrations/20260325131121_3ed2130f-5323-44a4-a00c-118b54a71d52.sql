-- Add missing UPDATE policy for referral_codes (needed to increment uses_count)
CREATE POLICY "Users can update own referral codes"
  ON public.referral_codes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add missing INSERT policy for referrals_tracking (needed when applying a referral code)
CREATE POLICY "Users can create referral tracking"
  ON public.referrals_tracking
  FOR INSERT
  WITH CHECK (true);

-- Add UPDATE policy for referrals_tracking (needed to complete referrals)
CREATE POLICY "Users can update own referral tracking"
  ON public.referrals_tracking
  FOR UPDATE
  USING ((auth.uid() = referrer_id) OR (auth.uid() = referee_id));

-- Add UPDATE policy for referrals table (needed to mark referrals as completed)
CREATE POLICY "Users can update own referrals"
  ON public.referrals
  FOR UPDATE
  USING ((auth.uid() = referrer_id) OR (auth.uid() = referred_id));