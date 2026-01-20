-- Create ID verifications table
CREATE TABLE public.id_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id UUID NOT NULL REFERENCES public.cleaner_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  document_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.id_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Cleaners can view their own ID verifications"
ON public.id_verifications FOR SELECT
USING (cleaner_id IN (
  SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Cleaners can insert their own ID verifications"
ON public.id_verifications FOR INSERT
WITH CHECK (cleaner_id IN (
  SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
));

-- Team owners can view their team members' ID verifications
CREATE POLICY "Team owners can view team member ID verifications"
ON public.id_verifications FOR SELECT
USING (cleaner_id IN (
  SELECT tm.cleaner_id FROM public.team_members tm
  JOIN public.cleaner_teams ct ON tm.team_id = ct.id
  JOIN public.cleaner_profiles cp ON ct.owner_cleaner_id = cp.id
  WHERE cp.user_id = auth.uid()
));

-- Create index for faster lookups
CREATE INDEX idx_id_verifications_cleaner_id ON public.id_verifications(cleaner_id);

-- Add updated_at trigger
CREATE TRIGGER update_id_verifications_updated_at
BEFORE UPDATE ON public.id_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();