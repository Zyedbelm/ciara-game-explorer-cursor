-- Créer la table profiles si elle n'existe pas déjà
-- avec des champs supplémentaires pour CIARA

-- Créer les triggers pour automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role, total_points, current_level, fitness_level, preferred_languages)
  VALUES (
    new.id, 
    new.email,
    'visitor'::user_role,
    0,
    1,
    3,
    ARRAY['fr'::text]
  );
  RETURN new;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();