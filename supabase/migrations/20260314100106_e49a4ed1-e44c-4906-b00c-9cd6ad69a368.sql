
DO $$
DECLARE
  admin_user_id uuid;
  user_exists boolean;
BEGIN
  -- Check if user already exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'reeperzx7@icloud.com') INTO user_exists;

  IF NOT user_exists THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'reeperzx7@icloud.com',
      crypt('BaileeJane7!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Admin", "role": "admin"}',
      false,
      'authenticated',
      'authenticated'
    );
  ELSE
    -- Update password if user already exists
    UPDATE auth.users
    SET encrypted_password = crypt('BaileeJane7!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE email = 'reeperzx7@icloud.com';
  END IF;

  -- Resolve user id
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'reeperzx7@icloud.com';

  -- Profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (admin_user_id, 'reeperzx7@icloud.com', 'Admin')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;

  -- Force admin role
  DELETE FROM public.user_roles WHERE user_id = admin_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin');

  -- Credits account
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (admin_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Referral code
  INSERT INTO public.referrals (referrer_id, referral_code)
  VALUES (admin_user_id, public.generate_referral_code())
  ON CONFLICT DO NOTHING;

  -- Notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (admin_user_id)
  ON CONFLICT (user_id) DO NOTHING;

END $$;
