-- 1. addresses: add confirmation flag
ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS address_confirmed boolean NOT NULL DEFAULT false;

-- 2. property_profiles: drop unused home-detail columns
ALTER TABLE public.property_profiles
  DROP COLUMN IF EXISTS home_type,
  DROP COLUMN IF EXISTS bedrooms,
  DROP COLUMN IF EXISTS bathrooms,
  DROP COLUMN IF EXISTS sq_ft,
  DROP COLUMN IF EXISTS floors,
  DROP COLUMN IF EXISTS has_elevator;

-- 3. cleaning_preferences: drop unused preference columns
ALTER TABLE public.cleaning_preferences
  DROP COLUMN IF EXISTS scent_preference,
  DROP COLUMN IF EXISTS eco_preference,
  DROP COLUMN IF EXISTS priorities;