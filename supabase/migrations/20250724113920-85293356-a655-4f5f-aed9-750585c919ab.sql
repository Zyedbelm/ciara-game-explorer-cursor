-- Fix remaining security issues from linter

-- 1. Fix functions that need search_path set
CREATE OR REPLACE FUNCTION public.send_ciara_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_name text;
BEGIN
  -- Extract full name from metadata
  user_name := COALESCE(
    TRIM(CONCAT(
      COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
    )),
    split_part(NEW.email, '@', 1)
  );
  
  -- Call the send-welcome-ciara edge function
  PERFORM
    net.http_post(
      url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/send-welcome-ciara',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'userName', user_name,
        'email', NEW.email,
        'loginUrl', 'https://ciara.lovable.app/'
      )
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE LOG 'Error sending welcome email for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Fix other functions that might need search_path
CREATE OR REPLACE FUNCTION public.can_manage_city(target_city_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' AND get_user_city_id() = target_city_id THEN true
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION public.validate_tenant_admin_city_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Ensure tenant_admin users always have a city assigned
    IF NEW.role = 'tenant_admin' AND NEW.city_id IS NULL THEN
        RAISE EXCEPTION 'Tenant admin users must have a city assignment'
            USING ERRCODE = 'check_violation';
    END IF;
    
    RETURN NEW;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.create_default_categories_for_city()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insérer les catégories par défaut pour la nouvelle ville
  INSERT INTO public.journey_categories (city_id, name, slug, description, type, difficulty, estimated_duration, icon, color)
  VALUES 
    (NEW.id, 'Patrimoine Culturel', 'patrimoine-culturel', 'Découvrez l''histoire et la culture locale', 'patrimoine-culturel', 'easy', 120, 'landmark', '#8B4513'),
    (NEW.id, 'Gastronomie Locale', 'gastronomie-locale', 'Savourez les spécialités culinaires', 'gastronomie-locale', 'easy', 90, 'utensils', '#DC2626'),
    (NEW.id, 'Randonnées Nature', 'randonnees-nature', 'Explorez la nature environnante', 'randonnees-nature', 'medium', 180, 'mountain', '#059669'),
    (NEW.id, 'Vieille Ville', 'vieille-ville', 'Promenade dans les quartiers historiques', 'vieille-ville', 'easy', 60, 'building', '#7C3AED'),
    (NEW.id, 'Art et Culture', 'art-culture', 'Musées, galeries et sites culturels', 'art-culture', 'easy', 90, 'palette', '#F59E0B');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;