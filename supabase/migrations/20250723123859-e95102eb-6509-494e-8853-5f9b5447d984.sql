-- Plan Implementation Migration
-- 1. Fix redirect URL in signup and email configuration
-- 2. Update handle_new_user trigger to sync first_name + last_name to full_name
-- 3. Disable duplicate rewards and keep only 10 varied ones

-- First, let's update the handle_new_user function to properly sync names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  first_name text;
  last_name text;
  full_name_value text;
BEGIN
  -- Log pour debugging
  RAISE LOG 'Creating profile for user: %, email: %', NEW.id, NEW.email;
  
  -- Extract names from metadata
  first_name := COALESCE(NEW.raw_user_meta_data ->> 'first_name', '');
  last_name := COALESCE(NEW.raw_user_meta_data ->> 'last_name', '');
  
  -- Build full name
  full_name_value := TRIM(
    CASE 
      WHEN first_name != '' AND last_name != '' THEN first_name || ' ' || last_name
      WHEN first_name != '' THEN first_name
      WHEN last_name != '' THEN last_name
      ELSE NULL
    END
  );
  
  -- Insert profile with synchronized names
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name,
    role, 
    total_points, 
    current_level, 
    fitness_level, 
    preferred_languages
  )
  VALUES (
    NEW.id, 
    NEW.email,
    full_name_value,
    'visitor'::public.user_role,
    0,
    1,
    3,
    ARRAY['fr'::text]
  );
  
  RAISE LOG 'Profile created successfully for user: % with full_name: %', NEW.id, full_name_value;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %, SQLSTATE: %', NEW.id, SQLERRM, SQLSTATE;
    -- Return NEW even on error to not block user creation
    RETURN NEW;
END;
$$;

-- Update existing profiles where full_name is null but we have email
UPDATE public.profiles 
SET full_name = TRIM(
  CASE 
    WHEN email LIKE '%@%' THEN SPLIT_PART(email, '@', 1)
    ELSE 'Utilisateur'
  END
)
WHERE full_name IS NULL OR full_name = '';

-- Disable duplicate rewards, keeping only 10 varied ones
UPDATE public.rewards SET is_active = false WHERE id NOT IN (
  SELECT DISTINCT ON (title, type, points_required) id
  FROM public.rewards
  WHERE is_active = true
  ORDER BY title, type, points_required, created_at
  LIMIT 10
);

-- Add email verification requirement function
CREATE OR REPLACE FUNCTION public.check_email_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if email is verified for new sessions
  IF NEW.email_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'Email must be verified before login'
      USING ERRCODE = 'invalid_authorization_specification';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a system setting to track production URL
INSERT INTO public.system_settings (key, value, description)
VALUES (
  'production_url', 
  '"https://ciara.lovable.app"'::jsonb,
  'Production URL for email redirects'
) ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Create email template configuration
INSERT INTO public.system_settings (key, value, description)
VALUES (
  'email_templates_enabled', 
  'true'::jsonb,
  'Whether to use custom CIARA email templates'
) ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();