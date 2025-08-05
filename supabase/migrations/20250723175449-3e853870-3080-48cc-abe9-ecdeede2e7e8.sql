-- Enhanced security restrictions for Tenant Admins
-- Phase 1: Add trigger to prevent tenant admins from removing their own city assignment

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS validate_tenant_admin_city ON public.profiles;
DROP FUNCTION IF EXISTS public.validate_tenant_admin_city();

-- Create enhanced validation function
CREATE OR REPLACE FUNCTION public.validate_tenant_admin_city()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_role text;
  current_user_city_id uuid;
BEGIN
  -- Get current user's role and city
  SELECT role, city_id INTO current_user_role, current_user_city_id
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  -- Rule 1: Prevent tenant_admin from removing their own city assignment
  IF OLD.role = 'tenant_admin' AND OLD.city_id IS NOT NULL AND NEW.city_id IS NULL THEN
    RAISE EXCEPTION 'Cannot remove city assignment from an existing tenant_admin. Demote to visitor first.'
      USING ERRCODE = 'check_violation';
  END IF;
  
  -- Rule 2: Prevent users from changing their own role or city if they are tenant_admin
  IF OLD.user_id = auth.uid() AND OLD.role = 'tenant_admin' THEN
    -- Self-modification restrictions for tenant admins
    IF NEW.role != OLD.role THEN
      RAISE EXCEPTION 'Tenant admins cannot change their own role.'
        USING ERRCODE = 'check_violation';
    END IF;
    
    IF NEW.city_id != OLD.city_id THEN
      RAISE EXCEPTION 'Tenant admins cannot change their own city assignment.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  
  -- Rule 3: Tenant admins can only assign users to their own city
  IF current_user_role = 'tenant_admin' 
     AND NEW.city_id IS NOT NULL 
     AND NEW.city_id != current_user_city_id 
     AND OLD.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Tenant admins can only assign users to their own city: %', 
      (SELECT name FROM public.cities WHERE id = current_user_city_id)
      USING ERRCODE = 'check_violation';
  END IF;
  
  -- Rule 4: Tenant admins cannot promote users to tenant_admin role
  IF current_user_role = 'tenant_admin' 
     AND NEW.role = 'tenant_admin' 
     AND OLD.role != 'tenant_admin' THEN
    RAISE EXCEPTION 'Tenant admins cannot promote users to tenant_admin role.'
      USING ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for the validation
CREATE TRIGGER validate_tenant_admin_city
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_tenant_admin_city();

-- Create a function to check if a user can manage another user's profile
CREATE OR REPLACE FUNCTION public.can_manage_user_profile(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    -- Super admin can manage everyone
    WHEN get_current_user_role() = 'super_admin' THEN true
    -- Users cannot manage themselves beyond basic profile updates
    WHEN target_user_id = auth.uid() THEN false
    -- Tenant admin can manage users in their city only
    WHEN get_current_user_role() = 'tenant_admin' THEN 
      EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = target_user_id 
        AND (p.city_id = get_user_city_id() OR p.city_id IS NULL)
      )
    ELSE false
  END;
$$;