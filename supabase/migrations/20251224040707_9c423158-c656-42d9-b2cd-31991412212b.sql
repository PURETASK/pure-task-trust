-- Create bundle_offers table for package/bundle pricing
CREATE TABLE public.bundle_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  hours_included INTEGER NOT NULL DEFAULT 1,
  credits_price INTEGER NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bundle_offers ENABLE ROW LEVEL SECURITY;

-- Everyone can view active bundle offers
CREATE POLICY "Anyone can view active bundle offers"
ON public.bundle_offers
FOR SELECT
USING (is_active = true);

-- Admins can manage all bundle offers
CREATE POLICY "Admins can manage bundle offers"
ON public.bundle_offers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_bundle_offers_updated_at
BEFORE UPDATE ON public.bundle_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();