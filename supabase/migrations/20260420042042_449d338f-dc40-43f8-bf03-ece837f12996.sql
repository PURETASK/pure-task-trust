-- Fix: 'Clients manage own properties' policy was comparing auth.uid() to client_id,
-- but client_id is a client_profiles.id, not a user id. This blocked ALL property
-- inserts/updates during client onboarding (silently, via RLS).

DROP POLICY IF EXISTS "Clients manage own properties" ON public.property_profiles;

CREATE POLICY "Clients manage own properties"
ON public.property_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_profiles cp
    WHERE cp.id = property_profiles.client_id
      AND cp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_profiles cp
    WHERE cp.id = property_profiles.client_id
      AND cp.user_id = auth.uid()
  )
);

-- Admin escape hatch (mirrors other tables)
DROP POLICY IF EXISTS "Admins manage all properties" ON public.property_profiles;
CREATE POLICY "Admins manage all properties"
ON public.property_profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));