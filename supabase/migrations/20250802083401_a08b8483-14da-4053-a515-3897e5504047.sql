-- Update the handle_new_user function to credit 10 welcome points
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
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
  
  -- Insert profile with synchronized names and 10 welcome points
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
    10, -- Credit 10 welcome points instead of 0
    1,
    3,
    ARRAY['fr'::text]
  );
  
  RAISE LOG 'Profile created successfully for user: % with full_name: % and 10 welcome points', NEW.id, full_name_value;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %, SQLSTATE: %', NEW.id, SQLERRM, SQLSTATE;
    -- Return NEW even on error to not block user creation
    RETURN NEW;
END;
$$;