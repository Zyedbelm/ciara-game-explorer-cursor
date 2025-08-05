-- Vérifier et recréer le trigger pour la création automatique de profils

-- D'abord, supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recréer la fonction handle_new_user avec une meilleure gestion d'erreur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Log pour debugging
  RAISE LOG 'Creating profile for user: %', NEW.id;
  
  INSERT INTO public.profiles (user_id, email, role, total_points, current_level, fitness_level, preferred_languages)
  VALUES (
    NEW.id, 
    NEW.email,
    'visitor'::user_role,
    0,
    1,
    3,
    ARRAY['fr'::text]
  );
  
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RAISE;
END;
$function$;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();