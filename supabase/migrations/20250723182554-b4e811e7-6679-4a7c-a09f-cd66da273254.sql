-- Fix function search path for get_user_city_id
CREATE OR REPLACE FUNCTION public.get_user_city_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT city_id 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$function$;