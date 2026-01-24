-- Create featured testimonials table for curated social proof
CREATE TABLE public.featured_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'Client',
  author_location TEXT,
  quote TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS with public read access for active testimonials
ALTER TABLE public.featured_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active testimonials" 
ON public.featured_testimonials 
FOR SELECT 
USING (is_active = true);

-- Admin can manage testimonials
CREATE POLICY "Admins can manage testimonials"
ON public.featured_testimonials
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed initial testimonials for different personas
INSERT INTO public.featured_testimonials (author_name, author_role, author_location, quote, rating, display_order) VALUES
('Jennifer M.', 'Busy Professional', 'Austin, TX', 'Finally, a cleaning service I can trust! The GPS check-in and photo proof give me total peace of mind. My apartment has never looked better.', 5, 1),
('Robert & Linda K.', 'Retirees', 'Dallas, TX', 'As seniors, safety is our top priority. Knowing every cleaner is background-checked and ID-verified makes all the difference. Wonderful service!', 5, 2),
('Marcus T.', 'Airbnb Superhost', 'Houston, TX', 'Game changer for my rental properties! The before/after photos protect me from disputes, and the escrow system means I only pay for quality work.', 5, 3),
('Sarah & Mike D.', 'Family with Kids', 'San Antonio, TX', 'With two young kids and a dog, we needed cleaners we could absolutely trust. PureTask exceeded our expectations - reliable, thorough, and professional.', 5, 4),
('Amanda L.', 'Working Mom', 'Austin, TX', 'The booking process is so simple, and I love that I can see exactly when the cleaner arrives and leaves. No more wondering if they actually came!', 5, 5),
('David C.', 'Property Manager', 'Fort Worth, TX', 'Managing 15 units used to be a nightmare. Now I have a network of verified cleaners I can trust, with photo documentation for every turnover.', 5, 6),
('Patricia W.', 'Homeowner', 'Plano, TX', 'I was skeptical at first, but the satisfaction guarantee won me over. Two months in, and I am completely hooked. Best cleaning service I have ever used!', 5, 7),
('James R.', 'Tech Executive', 'Austin, TX', 'Time is money, and PureTask saves me both. The platform handles everything - scheduling, payment, quality assurance. I just enjoy coming home to a clean house.', 5, 8);