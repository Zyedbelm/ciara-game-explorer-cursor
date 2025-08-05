-- Créer des données d'exemple pour tester l'application
-- Fonction utilitaire pour mettre à jour le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION update_user_role(user_email text, new_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = new_role,
      updated_at = now()
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'User with email % not found. Please create account first.', user_email;
  END IF;
END;
$$;

-- Insérer une ville d'exemple si elle n'existe pas déjà
INSERT INTO public.cities (name, slug, country, description, latitude, longitude)
SELECT 'Lausanne', 'lausanne', 'Switzerland', 'Capitale olympique située sur les rives du lac Léman', 46.5197, 6.6323
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE slug = 'lausanne');

-- Créer des catégories de parcours d'exemple
INSERT INTO public.journey_categories (
  city_id,
  name,
  slug,
  type,
  description,
  difficulty,
  estimated_duration,
  icon,
  color
)
SELECT 
  cities.id,
  'Vieille Ville de Lausanne',
  'vieille-ville-lausanne',
  'old_town'::journey_type,
  'Découvrez le charme historique de Lausanne',
  'easy'::journey_difficulty,
  120,
  'building',
  '#8B5CF6'
FROM public.cities 
WHERE cities.slug = 'lausanne'
AND NOT EXISTS (SELECT 1 FROM public.journey_categories WHERE slug = 'vieille-ville-lausanne');

INSERT INTO public.journey_categories (
  city_id,
  name,
  slug,
  type,
  description,
  difficulty,
  estimated_duration,
  icon,
  color
)
SELECT 
  cities.id,
  'Gastronomie Lausannoise',
  'gastronomie-lausanne',
  'gastronomy'::journey_type,
  'Savourez les spécialités locales',
  'medium'::journey_difficulty,
  180,
  'utensils',
  '#F59E0B'
FROM public.cities 
WHERE cities.slug = 'lausanne'
AND NOT EXISTS (SELECT 1 FROM public.journey_categories WHERE slug = 'gastronomie-lausanne');