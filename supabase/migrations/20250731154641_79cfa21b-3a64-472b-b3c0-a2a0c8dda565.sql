-- Step 1 & 2: Fix RLS policies and functions

-- First, let's fix the get_current_user_role function to handle null cases better
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(role::text, 'visitor') 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$function$;

-- Fix the get_user_city_id function
CREATE OR REPLACE FUNCTION public.get_user_city_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT city_id 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$function$;

-- Fix cities table RLS policies - remove conflicting policies first
DROP POLICY IF EXISTS "Cities are viewable by everyone" ON public.cities;
DROP POLICY IF EXISTS "Cities are viewable by everyone or admins" ON public.cities;
DROP POLICY IF EXISTS "Cities visible on homepage" ON public.cities;
DROP POLICY IF EXISTS "Admins can modify cities" ON public.cities;
DROP POLICY IF EXISTS "Only admins can modify cities" ON public.cities;
DROP POLICY IF EXISTS "Only super admins can archive cities" ON public.cities;

-- Create simplified, non-conflicting policies for cities
CREATE POLICY "Cities viewable by all" 
ON public.cities 
FOR SELECT 
USING (
  CASE 
    WHEN is_archived = true THEN 
      COALESCE(get_current_user_role(), 'visitor') = ANY (ARRAY['super_admin', 'tenant_admin'])
    ELSE true
  END
);

CREATE POLICY "Super admins can modify all cities" 
ON public.cities 
FOR UPDATE 
USING (COALESCE(get_current_user_role(), 'visitor') = 'super_admin');

CREATE POLICY "Tenant admins can modify their city" 
ON public.cities 
FOR UPDATE 
USING (
  COALESCE(get_current_user_role(), 'visitor') = 'tenant_admin' 
  AND id = get_user_city_id()
  AND is_archived = false
);

-- Fix profiles table RLS policies for better admin access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR COALESCE(get_current_user_role(), 'visitor') = ANY (ARRAY['super_admin', 'tenant_admin'])
);

CREATE POLICY "Users can update own basic profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (COALESCE(get_current_user_role(), 'visitor') = 'super_admin')
WITH CHECK (COALESCE(get_current_user_role(), 'visitor') = 'super_admin');

CREATE POLICY "Tenant admins can manage city users" 
ON public.profiles 
FOR ALL 
USING (
  COALESCE(get_current_user_role(), 'visitor') = 'tenant_admin' 
  AND (city_id = get_user_city_id() OR city_id IS NULL)
  AND user_id != auth.uid()
)
WITH CHECK (
  COALESCE(get_current_user_role(), 'visitor') = 'tenant_admin' 
  AND (city_id = get_user_city_id() OR city_id IS NULL)
  AND user_id != auth.uid()
);