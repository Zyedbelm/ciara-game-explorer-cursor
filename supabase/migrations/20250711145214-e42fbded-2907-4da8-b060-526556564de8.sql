-- Créer le type user_role s'il n'existe pas
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'super_admin',
        'tenant_admin', 
        'content_manager',
        'analytics_viewer',
        'ciara_staff',
        'content_creator',
        'tech_support',
        'partner_admin',
        'partner_viewer',
        'visitor'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mettre à jour la fonction handle_new_user pour être plus robuste
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
$function$;

-- Créer le trigger s'il n'existe pas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mettre à jour les profils existants pour les super admins
UPDATE public.profiles 
SET role = 'super_admin'::user_role 
WHERE email IN ('zyed.elmeddeb@gmail.com', 'nocodeops85@gmail.com');