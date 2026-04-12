
-- Table for homepage cleaning request form submissions
CREATE TABLE public.cleaning_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cleaning_type TEXT NOT NULL, -- 'basic', 'deep', 'move_out', 'other'
  custom_description TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  estimated_hours INTEGER DEFAULT 2,
  number_of_bedrooms INTEGER,
  number_of_bathrooms INTEGER,
  has_pets BOOLEAN DEFAULT false,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, matched, completed, cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cleaning_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create a request (supports guest submissions)
CREATE POLICY "Anyone can create cleaning requests"
ON public.cleaning_requests
FOR INSERT
WITH CHECK (true);

-- Authenticated users can view their own requests
CREATE POLICY "Users can view own cleaning requests"
ON public.cleaning_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can update their own requests
CREATE POLICY "Users can update own cleaning requests"
ON public.cleaning_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all cleaning requests"
ON public.cleaning_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE TRIGGER update_cleaning_requests_updated_at
BEFORE UPDATE ON public.cleaning_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
