-- Fix security warnings - Update functions with proper search_path
-- Fix function search path for get_current_user_role
DROP FUNCTION IF EXISTS public.get_current_user_role();
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE(role::text, 'visitor') 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$function$

-- Fix function search path for get_user_city_id
DROP FUNCTION IF EXISTS public.get_user_city_id();
CREATE OR REPLACE FUNCTION public.get_user_city_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT city_id 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$function$