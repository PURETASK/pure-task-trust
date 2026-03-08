
-- Fix the leads table: restrict INSERT to prevent spam/abuse
-- Leads are submitted via public contact form, so limit to required fields only
-- Replace WITH CHECK (true) with a reasonable constraint

DROP POLICY IF EXISTS "Anyone can insert leads safely" ON public.leads;

-- Allow public lead submissions but only if email is provided (basic sanity check)
CREATE POLICY "leads_public_insert"
  ON public.leads
  FOR INSERT
  TO public
  WITH CHECK (email IS NOT NULL AND length(trim(email)) > 0);
