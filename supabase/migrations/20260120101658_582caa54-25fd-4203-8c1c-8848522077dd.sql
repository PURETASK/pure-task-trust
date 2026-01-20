-- Create phone_verifications table to track OTP codes
CREATE TABLE public.phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verification attempts
CREATE POLICY "Users can view their own verifications"
ON public.phone_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create verification attempts for themselves
CREATE POLICY "Users can create their own verifications"
ON public.phone_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own verifications (for marking as verified)
CREATE POLICY "Users can update their own verifications"
ON public.phone_verifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Add phone_number and phone_verified columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX idx_phone_verifications_user_id ON public.phone_verifications(user_id);
CREATE INDEX idx_phone_verifications_phone ON public.phone_verifications(phone_number);
CREATE INDEX idx_profiles_phone ON public.profiles(phone_number);