-- Créer des profils administrateurs de test directement
-- Note: Les utilisateurs devront s'inscrire normalement via l'interface, 
-- puis nous mettrons à jour leur rôle

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

-- Créer des exemples de données pour les tests
-- Insérer une ville d'exemple si elle n'existe pas
INSERT INTO public.cities (name, slug, country, description, latitude, longitude)
VALUES (
  'Lausanne',
  'lausanne',
  'Switzerland',
  'Capitale olympique située sur les rives du lac Léman',
  46.5197,
  6.6323
) ON CONFLICT (slug) DO NOTHING;

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
) VALUES (
  (SELECT id FROM cities WHERE slug = 'lausanne' LIMIT 1),
  'Vieille Ville de Lausanne',
  'vieille-ville-lausanne',
  'old_town',
  'Découvrez le charme historique de Lausanne',
  'easy',
  120,
  'building',
  '#8B5CF6'
), (
  (SELECT id FROM cities WHERE slug = 'lausanne' LIMIT 1),
  'Gastronomie Lausannoise',
  'gastronomie-lausanne',
  'gastronomy',
  'Savourez les spécialités locales',
  'medium',
  180,
  'utensils',
  '#F59E0B'
) ON CONFLICT (slug) DO NOTHING;