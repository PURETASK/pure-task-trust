-- Add professional_headline to cleaner_profiles
ALTER TABLE public.cleaner_profiles 
ADD COLUMN IF NOT EXISTS professional_headline TEXT;

-- Create cleaner_agreements table for terms/consent tracking
CREATE TABLE public.cleaner_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id UUID NOT NULL REFERENCES public.cleaner_profiles(id) ON DELETE CASCADE,
  agreement_type TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_cleaner_agreements_cleaner_id ON public.cleaner_agreements(cleaner_id);
CREATE INDEX idx_cleaner_agreements_type ON public.cleaner_agreements(agreement_type);

-- Enable RLS
ALTER TABLE public.cleaner_agreements ENABLE ROW LEVEL SECURITY;

-- Cleaners can view their own agreements
CREATE POLICY "Cleaners can view their own agreements"
ON public.cleaner_agreements
FOR SELECT
USING (
  cleaner_id IN (
    SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
  )
);

-- Cleaners can insert their own agreements
CREATE POLICY "Cleaners can insert their own agreements"
ON public.cleaner_agreements
FOR INSERT
WITH CHECK (
  cleaner_id IN (
    SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
  )
);

-- Admins can view all agreements
CREATE POLICY "Admins can view all agreements"
ON public.cleaner_agreements
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));