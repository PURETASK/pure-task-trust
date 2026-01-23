-- Add profile_photo_url and onboarding_completed_at to cleaner_profiles
ALTER TABLE public.cleaner_profiles 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Create private storage bucket for identity documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('identity-documents', 'identity-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for identity-documents bucket
-- Cleaners can upload their own documents
CREATE POLICY "Cleaners can upload own identity documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'identity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Cleaners can view their own documents
CREATE POLICY "Cleaners can view own identity documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'identity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Cleaners can update their own documents
CREATE POLICY "Cleaners can update own identity documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'identity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Cleaners can delete their own documents
CREATE POLICY "Cleaners can delete own identity documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'identity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);