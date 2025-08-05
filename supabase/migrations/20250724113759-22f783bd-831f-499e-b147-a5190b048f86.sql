-- =====================================================
-- COMPREHENSIVE SECURITY REINFORCEMENT MIGRATION
-- =====================================================

-- 1. RESTORE AUTHENTICATION TRIGGERS
-- Missing trigger for profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. FIX POINTS SYSTEM SYNCHRONIZATION
-- Enhanced function for points calculation with better error handling
CREATE OR REPLACE FUNCTION public.update_user_total_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_points_calc integer;
  user_exists boolean;
BEGIN
  -- Verify user exists in profiles table
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = NEW.user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE LOG 'User % not found in profiles table, skipping points update', NEW.user_id;
    RETURN NEW;
  END IF;

  -- Calculate total points for the user
  SELECT COALESCE(SUM(points_earned), 0) 
  INTO total_points_calc
  FROM public.step_completions 
  WHERE user_id = NEW.user_id;
  
  -- Update the user's total points in profiles table with error handling
  UPDATE public.profiles 
  SET 
    total_points = total_points_calc,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE LOG 'Failed to update total points for user %', NEW.user_id;
    RETURN NEW;
  END IF;
  
  -- Log successful update
  RAISE LOG 'Updated total points for user %: % points', NEW.user_id, total_points_calc;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the trigger
    RAISE LOG 'Error updating total points for user %: %', NEW.user_id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Enhanced function for points deletion handling
CREATE OR REPLACE FUNCTION public.update_user_total_points_on_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_points_calc integer;
BEGIN
  -- Calculate total points for the user after deletion
  SELECT COALESCE(SUM(points_earned), 0) 
  INTO total_points_calc
  FROM public.step_completions 
  WHERE user_id = OLD.user_id;
  
  -- Update the user's total points in profiles table
  UPDATE public.profiles 
  SET 
    total_points = total_points_calc,
    updated_at = now()
  WHERE user_id = OLD.user_id;
  
  RAISE LOG 'Updated total points for user % after deletion: % points', OLD.user_id, total_points_calc;
  
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error updating total points after deletion for user %: %', OLD.user_id, SQLERRM;
    RETURN OLD;
END;
$$;

-- Create/recreate the triggers for points synchronization
DROP TRIGGER IF EXISTS update_user_points_trigger ON public.step_completions;
CREATE TRIGGER update_user_points_trigger
  AFTER INSERT OR UPDATE ON public.step_completions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_total_points();

DROP TRIGGER IF EXISTS update_user_points_on_delete_trigger ON public.step_completions;
CREATE TRIGGER update_user_points_on_delete_trigger
  AFTER DELETE ON public.step_completions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_total_points_on_delete();

-- 3. SECURE QUIZ SYSTEM - Prevent duplicate completions
CREATE OR REPLACE FUNCTION public.prevent_duplicate_step_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user has already completed this step
  IF EXISTS (
    SELECT 1 FROM public.step_completions 
    WHERE user_id = NEW.user_id 
    AND step_id = NEW.step_id
  ) THEN
    RAISE EXCEPTION 'Step already completed by user' 
      USING ERRCODE = 'unique_violation';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_duplicate_completion_trigger ON public.step_completions;
CREATE TRIGGER prevent_duplicate_completion_trigger
  BEFORE INSERT ON public.step_completions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_step_completion();

-- Add unique constraint to enforce at database level
ALTER TABLE public.step_completions 
DROP CONSTRAINT IF EXISTS unique_user_step_completion;

ALTER TABLE public.step_completions 
ADD CONSTRAINT unique_user_step_completion 
UNIQUE (user_id, step_id);

-- 4. ENHANCE SECURITY FUNCTIONS
-- Secure the get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(role::text, 'visitor') 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$$;

-- Secure the get_user_city_id function
CREATE OR REPLACE FUNCTION public.get_user_city_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT city_id 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$$;

-- 5. ENHANCE VALIDATION SECURITY
-- Add validation logging function
CREATE OR REPLACE FUNCTION public.log_step_validation(
  p_user_id uuid,
  p_step_id uuid,
  p_validation_method text,
  p_location jsonb DEFAULT NULL,
  p_success boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.analytics_events (
    event_type,
    event_name,
    user_id,
    step_id,
    properties
  ) VALUES (
    'validation',
    CASE WHEN p_success THEN 'step_validation_success' ELSE 'step_validation_failed' END,
    p_user_id,
    p_step_id,
    jsonb_build_object(
      'validation_method', p_validation_method,
      'location', p_location,
      'timestamp', now()
    )
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- 6. IMPLEMENT REWARD REDEMPTION SECURITY
-- Enhanced function to validate reward redemptions
CREATE OR REPLACE FUNCTION public.can_user_redeem_reward(p_reward_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  reward_record RECORD;
  user_redemptions_count INTEGER;
  total_redemptions_count INTEGER;
  user_points INTEGER;
BEGIN
  -- Get reward details
  SELECT max_redemptions, max_redemptions_per_user, is_active, points_required
  INTO reward_record
  FROM public.rewards
  WHERE id = p_reward_id;
  
  -- Check if reward exists and is active
  IF NOT FOUND OR NOT reward_record.is_active THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has enough points
  SELECT total_points INTO user_points
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  IF user_points < reward_record.points_required THEN
    RETURN FALSE;
  END IF;
  
  -- Check per-user limit if set
  IF reward_record.max_redemptions_per_user IS NOT NULL THEN
    SELECT COUNT(*)
    INTO user_redemptions_count
    FROM public.reward_redemptions
    WHERE reward_id = p_reward_id 
      AND user_id = p_user_id 
      AND status IN ('pending', 'used');
    
    IF user_redemptions_count >= reward_record.max_redemptions_per_user THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check global limit if set
  IF reward_record.max_redemptions IS NOT NULL THEN
    SELECT COUNT(*)
    INTO total_redemptions_count
    FROM public.reward_redemptions
    WHERE reward_id = p_reward_id 
      AND status IN ('pending', 'used');
    
    IF total_redemptions_count >= reward_record.max_redemptions THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 7. DATA CLEANUP AND ORPHAN REMOVAL
-- Enhanced cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log cleanup start
  PERFORM log_error('info', 'Starting orphaned data cleanup', '{}'::jsonb);
  
  -- Supprimer les journey_steps orphelins
  DELETE FROM public.journey_steps 
  WHERE journey_id NOT IN (SELECT id FROM public.journeys)
     OR step_id NOT IN (SELECT id FROM public.steps);
  
  -- Supprimer les quiz_questions orphelins
  DELETE FROM public.quiz_questions 
  WHERE step_id NOT IN (SELECT id FROM public.steps);
  
  -- Supprimer les content_documents orphelins
  DELETE FROM public.content_documents 
  WHERE step_id NOT IN (SELECT id FROM public.steps)
     OR (journey_id IS NOT NULL AND journey_id NOT IN (SELECT id FROM public.journeys))
     OR (city_id IS NOT NULL AND city_id NOT IN (SELECT id FROM public.cities));
  
  -- Supprimer les step_completions orphelins
  DELETE FROM public.step_completions 
  WHERE step_id NOT IN (SELECT id FROM public.steps)
     OR user_id NOT IN (SELECT user_id FROM public.profiles);
  
  -- Supprimer les user_journey_progress orphelins
  DELETE FROM public.user_journey_progress 
  WHERE journey_id NOT IN (SELECT id FROM public.journeys)
     OR user_id NOT IN (SELECT user_id FROM public.profiles);

  -- Log cleanup completion
  PERFORM log_error('info', 'Orphaned data cleanup completed', '{}'::jsonb);
  
  RAISE NOTICE 'Cleanup completed successfully';
END;
$$;

-- 8. ENHANCE MONITORING AND AUDIT
-- Create audit trigger for critical tables
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_audit_log (
      table_name,
      action,
      record_id,
      new_values,
      user_id,
      ip_address
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      NEW.id,
      to_jsonb(NEW),
      auth.uid(),
      inet_client_addr()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.admin_audit_log (
      table_name,
      action,
      record_id,
      old_values,
      new_values,
      user_id,
      ip_address
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid(),
      inet_client_addr()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.admin_audit_log (
      table_name,
      action,
      record_id,
      old_values,
      user_id,
      ip_address
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      OLD.id,
      to_jsonb(OLD),
      auth.uid(),
      inet_client_addr()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Apply audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_rewards_trigger ON public.rewards;
CREATE TRIGGER audit_rewards_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- 9. SECURITY CONFIGURATION UPDATES
-- Update security settings
INSERT INTO public.security_config (key, value, description) 
VALUES 
  ('max_login_attempts', '5', 'Maximum login attempts before lockout'),
  ('session_timeout_minutes', '60', 'Session timeout in minutes'),
  ('password_min_length', '8', 'Minimum password length'),
  ('require_email_verification', 'true', 'Require email verification for new accounts')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- 10. CREATE SYSTEM HEALTH CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  health_report jsonb := '{}';
  profile_count integer;
  points_sync_issues integer;
  orphaned_data integer;
BEGIN
  -- Check profile creation
  SELECT COUNT(*) INTO profile_count
  FROM public.profiles;
  
  -- Check points synchronization issues
  SELECT COUNT(*) INTO points_sync_issues
  FROM public.profiles p
  LEFT JOIN (
    SELECT user_id, COALESCE(SUM(points_earned), 0) as calculated_points
    FROM public.step_completions
    GROUP BY user_id
  ) sc ON p.user_id = sc.user_id
  WHERE p.total_points != COALESCE(sc.calculated_points, 0);
  
  -- Check for orphaned data
  SELECT COUNT(*) INTO orphaned_data
  FROM public.step_completions sc
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = sc.user_id);
  
  health_report := jsonb_build_object(
    'timestamp', now(),
    'total_profiles', profile_count,
    'points_sync_issues', points_sync_issues,
    'orphaned_completions', orphaned_data,
    'triggers_active', jsonb_build_object(
      'profile_creation', EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'),
      'points_update', EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_points_trigger'),
      'duplicate_prevention', EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_duplicate_completion_trigger')
    )
  );
  
  RETURN health_report;
END;
$$;

-- Create a scheduled maintenance function
CREATE OR REPLACE FUNCTION public.run_daily_maintenance()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result text := '';
BEGIN
  -- Run cleanup
  PERFORM public.cleanup_orphaned_data();
  result := result || 'Data cleanup completed. ';
  
  -- Clean old analytics
  result := result || public.cleanup_old_analytics() || '. ';
  
  -- Clean expired vouchers
  result := result || public.cleanup_expired_vouchers() || '. ';
  
  -- Update statistics
  ANALYZE public.profiles;
  ANALYZE public.step_completions;
  ANALYZE public.user_journey_progress;
  result := result || 'Database statistics updated.';
  
  RETURN result;
END;
$$;