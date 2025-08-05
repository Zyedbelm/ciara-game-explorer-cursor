-- Fix function search path for get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE(role::text, 'visitor') 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$function$;