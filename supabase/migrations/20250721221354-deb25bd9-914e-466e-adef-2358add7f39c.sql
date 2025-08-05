-- Fix security warnings for database functions by setting stable search_path
-- This addresses the "Function Search Path Mutable" warnings from the linter

-- Update get_current_user_role function with secure search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$function$;

-- Update update_updated_at_column function with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update get_translation function with secure search_path
CREATE OR REPLACE FUNCTION public.get_translation(translation_key text, lang text DEFAULT 'fr'::text)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT COALESCE(
    (SELECT value FROM ui_translations WHERE key = translation_key AND language = lang),
    (SELECT value FROM ui_translations WHERE key = translation_key AND language = 'fr'),
    translation_key
  );
$function$;

-- Update get_ai_system_prompt function with secure search_path
CREATE OR REPLACE FUNCTION public.get_ai_system_prompt(lang text DEFAULT 'fr'::text)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT CASE lang
    WHEN 'en' THEN 'You are CIARA, the intelligent assistant of the CIARA gamified tourism platform. You specialize in helping travelers and explorers. Respond in English.'
    WHEN 'de' THEN 'Sie sind CIARA, der intelligente Assistent der CIARA gamifizierten Tourismusplattform. Sie sind auf die Hilfe für Reisende und Entdecker spezialisiert. Antworten Sie auf Deutsch.'
    ELSE 'Tu es CIARA, l''assistant intelligent de la plateforme de tourisme gamifié CIARA. Tu es spécialisé dans l''aide aux voyageurs et explorateurs. Réponds en français.'
  END;
$function$;

-- Update update_user_role function with secure search_path
CREATE OR REPLACE FUNCTION public.update_user_role(user_email text, new_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.profiles 
  SET role = new_role,
      updated_at = now()
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'User with email % not found. Please create account first.', user_email;
  END IF;
END;
$function$;

-- Update handle_new_user function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Log pour debugging
  RAISE LOG 'Creating profile for user: %, email: %', NEW.id, NEW.email;
  
  -- Insérer le profil avec le type explicite du schéma public
  INSERT INTO public.profiles (user_id, email, role, total_points, current_level, fitness_level, preferred_languages)
  VALUES (
    NEW.id, 
    NEW.email,
    'visitor'::public.user_role,  -- Référence explicite au schéma public
    0,
    1,
    3,
    ARRAY['fr'::text]
  );
  
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %, SQLSTATE: %', NEW.id, SQLERRM, SQLSTATE;
    -- On retourne NEW même en cas d'erreur pour ne pas bloquer la création du user
    RETURN NEW;
END;
$function$;

-- Update update_profiles_updated_at function with secure search_path
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update exec_sql function with secure search_path (Note: This function should be carefully reviewed for security)
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  EXECUTE sql;
  RETURN 'SUCCESS';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$function$;