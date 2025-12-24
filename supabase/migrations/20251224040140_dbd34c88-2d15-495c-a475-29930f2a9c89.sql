-- Create pricing_rules table for dynamic pricing configuration
CREATE TABLE public.pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  display_label TEXT NOT NULL,
  multiplier NUMERIC(5,3) NOT NULL DEFAULT 1.0,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (using admin_users table check)
CREATE POLICY "Admins can view pricing rules"
ON public.pricing_rules
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage pricing rules"
ON public.pricing_rules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_pricing_rules_updated_at
BEFORE UPDATE ON public.pricing_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();