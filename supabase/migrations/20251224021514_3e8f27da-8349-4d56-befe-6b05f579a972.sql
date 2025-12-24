-- Fix clients table RLS policies
-- The current policy uses auth.uid() = id which is wrong since id is not the user_id

-- Drop the incorrect policy if it exists
DROP POLICY IF EXISTS "Users can view own client record" ON public.clients;

-- Create correct policy that joins to client_profiles or uses a proper user_id reference
-- First, let's check if clients table has a user_id or if we need to work around it
-- Based on the schema, clients doesn't have a user_id, so we need to ensure only authenticated users can see their own data
-- Since clients.id is the primary key (not user_id), we need a different approach

-- For clients table - make it accessible only through authenticated queries that match the email
CREATE POLICY "Users can view own client record by email" 
ON public.clients 
FOR SELECT 
USING (email = auth.email());

-- For INSERT - allow users to create their own client record
CREATE POLICY "Users can create own client record" 
ON public.clients 
FOR INSERT 
WITH CHECK (email = auth.email());

-- For UPDATE - allow users to update their own client record
CREATE POLICY "Users can update own client record" 
ON public.clients 
FOR UPDATE 
USING (email = auth.email());

-- Fix payment_intents table RLS policies
-- The current policy compares auth.uid() to client_id which is a profile ID, not user ID

DROP POLICY IF EXISTS "Users can view own payment intents" ON public.payment_intents;

-- Create proper policy that joins through client_profiles to get user_id
CREATE POLICY "Users can view own payment intents" 
ON public.payment_intents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.client_profiles cp 
    WHERE cp.id = payment_intents.client_id 
    AND cp.user_id = auth.uid()
  )
);

-- Restrict admin_users table - only admins can access
-- Ensure no public access at all
DROP POLICY IF EXISTS "Admin users can view themselves" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Create restrictive policy - only the admin themselves can view their record
CREATE POLICY "Admins can view own record" 
ON public.admin_users 
FOR SELECT 
USING (
  email = auth.email() AND is_active = true
);

-- No INSERT/UPDATE/DELETE policies for admin_users - these should be managed via service role only