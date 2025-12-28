-- Create table for cleaner additional services pricing
CREATE TABLE public.cleaner_additional_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cleaner_id UUID NOT NULL REFERENCES public.cleaner_profiles(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  price INTEGER NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cleaner_id, service_id)
);

-- Create table for cleaner custom services
CREATE TABLE public.cleaner_custom_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cleaner_id UUID NOT NULL REFERENCES public.cleaner_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cleaner_additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_custom_services ENABLE ROW LEVEL SECURITY;

-- RLS policies for cleaner_additional_services
CREATE POLICY "Cleaners can view their own services"
ON public.cleaner_additional_services
FOR SELECT
USING (
  cleaner_id IN (
    SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Cleaners can insert their own services"
ON public.cleaner_additional_services
FOR INSERT
WITH CHECK (
  cleaner_id IN (
    SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Cleaners can update their own services"
ON public.cleaner_additional_services
FOR UPDATE
USING (
  cleaner_id IN (
    SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Cleaners can delete their own services"
ON public.cleaner_additional_services
FOR DELETE
USING (
  cleaner_id IN (
    SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
  )
);

-- Public read access for booking flow
CREATE POLICY "Anyone can view cleaner services for booking"
ON public.cleaner_additional_services
FOR SELECT
USING (is_enabled = true);

-- RLS policies for cleaner_custom_services
CREATE POLICY "Cleaners can view their own custom services"
ON public.cleaner_custom_services
FOR SELECT
USING (
  cleaner_id IN (
    SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Cleaners can insert their own custom services"
ON public.cleaner_custom_services
FOR INSERT
WITH CHECK (
  cleaner_id IN (
    SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Cleaners can update their own custom services"
ON public.cleaner_custom_services
FOR UPDATE
USING (
  cleaner_id IN (
    SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Cleaners can delete their own custom services"
ON public.cleaner_custom_services
FOR DELETE
USING (
  cleaner_id IN (
    SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()
  )
);

-- Public read access for booking flow
CREATE POLICY "Anyone can view custom services for booking"
ON public.cleaner_custom_services
FOR SELECT
USING (is_enabled = true);

-- Create triggers for updated_at
CREATE TRIGGER update_cleaner_additional_services_updated_at
BEFORE UPDATE ON public.cleaner_additional_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cleaner_custom_services_updated_at
BEFORE UPDATE ON public.cleaner_custom_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();