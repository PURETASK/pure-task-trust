CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ref_code TEXT;
  requested_role TEXT;
  safe_role app_role;
BEGIN
  -- Generate unique referral code
  LOOP
    ref_code := public.generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.referrals WHERE referral_code = ref_code);
  END LOOP;

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );

  -- Only allow non-privileged roles from client-supplied metadata.
  -- Admin/moderator accounts must be provisioned via service-role scripts.
  requested_role := NEW.raw_user_meta_data ->> 'role';
  IF requested_role IN ('client', 'cleaner') THEN
    safe_role := requested_role::app_role;
  ELSE
    safe_role := 'client';
  END IF;

  -- Create role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, safe_role);

  -- Create credits record
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.id, 0);

  -- Create referral code for user
  INSERT INTO public.referrals (referrer_id, referral_code)
  VALUES (NEW.id, ref_code);

  -- Create client or cleaner profile based on role
  IF safe_role = 'client' THEN
    INSERT INTO public.client_profiles (user_id, first_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
    
    INSERT INTO public.credit_accounts (user_id)
    VALUES (NEW.id);
  ELSIF safe_role = 'cleaner' THEN
    INSERT INTO public.cleaner_profiles (user_id, first_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  END IF;

  -- Create notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$function$