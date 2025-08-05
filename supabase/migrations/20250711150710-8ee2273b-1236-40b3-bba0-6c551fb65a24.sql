-- Corriger la fonction handle_new_user pour utiliser le bon schéma

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();