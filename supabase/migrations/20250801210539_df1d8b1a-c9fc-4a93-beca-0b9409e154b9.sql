-- Clean up and align Users and Profiles tables
-- Step 1: Clean up test accounts (keeping only accounts that look legitimate)

-- First, let's see what we have and identify test accounts
-- We'll delete users that:
-- 1. Have test-like emails (test@, temp@, example@, etc.)
-- 2. Have no profile and no meaningful activity
-- 3. Are clearly test accounts

-- Delete test users that have no profiles and test-like emails
DELETE FROM auth.users 
WHERE email SIMILAR TO '%(test|temp|example|demo|fake)%@%'
  AND id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL);

-- Step 2: Create missing profiles for legitimate existing users
-- Insert profiles for users who don't have them yet
INSERT INTO public.profiles (
  user_id, 
  email, 
  full_name,
  role, 
  total_points, 
  current_level, 
  fitness_level, 
  preferred_languages,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(
    TRIM(CONCAT(
      COALESCE(u.raw_user_meta_data ->> 'first_name', ''),
      ' ',
      COALESCE(u.raw_user_meta_data ->> 'last_name', '')
    )),
    SPLIT_PART(u.email, '@', 1)
  ) as full_name,
  'visitor'::public.user_role,
  0,
  1,
  3,
  ARRAY['fr'::text],
  NOW(),
  NOW()
FROM auth.users u
WHERE u.id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL)
  AND u.email IS NOT NULL
  AND u.email NOT SIMILAR TO '%(test|temp|example|demo|fake)%@%'
  AND u.deleted_at IS NULL;

-- Step 3: Verify and update the synchronization trigger
-- Make sure the handle_new_user function exists and works correctly
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
  -- Log for debugging
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
      ELSE SPLIT_PART(NEW.email, '@', 1)
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

-- Make sure the trigger exists and is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Validation and cleanup
-- Update any profiles that might have incomplete data
UPDATE public.profiles 
SET 
  email = u.email,
  updated_at = NOW()
FROM auth.users u 
WHERE profiles.user_id = u.id 
  AND (profiles.email IS NULL OR profiles.email != u.email);

-- Update full_name for profiles that don't have one
UPDATE public.profiles 
SET 
  full_name = COALESCE(
    NULLIF(TRIM(full_name), ''),
    SPLIT_PART(email, '@', 1)
  ),
  updated_at = NOW()
WHERE full_name IS NULL OR TRIM(full_name) = '';

-- Final validation: Log the results
DO $$
DECLARE
  user_count integer;
  profile_count integer;
  missing_profiles integer;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  SELECT COUNT(*) INTO missing_profiles 
  FROM auth.users u 
  WHERE u.deleted_at IS NULL 
    AND u.id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL);
  
  RAISE NOTICE 'Cleanup completed:';
  RAISE NOTICE '- Total users: %', user_count;
  RAISE NOTICE '- Total profiles: %', profile_count;
  RAISE NOTICE '- Missing profiles: %', missing_profiles;
  
  IF missing_profiles > 0 THEN
    RAISE WARNING 'There are still % users without profiles. Manual intervention may be needed.', missing_profiles;
  END IF;
END $$;