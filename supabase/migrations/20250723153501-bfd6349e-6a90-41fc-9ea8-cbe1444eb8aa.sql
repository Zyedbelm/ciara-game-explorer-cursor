-- Ajouter les catégories par défaut pour toutes les villes existantes qui n'en ont pas
-- Éviter les conflits en utilisant city_id + slug unique
INSERT INTO public.journey_categories (city_id, name, slug, description, type, difficulty, estimated_duration, icon, color)
SELECT 
  c.id,
  category_data.name,
  c.slug || '-' || category_data.slug as slug,
  category_data.description,
  category_data.type,
  category_data.difficulty,
  category_data.estimated_duration,
  category_data.icon,
  category_data.color
FROM cities c
CROSS JOIN (
  VALUES 
    ('Patrimoine Culturel', 'patrimoine-culturel', 'Découvrez l''histoire et la culture locale', 'patrimoine-culturel', 'easy', 120, 'landmark', '#8B4513'),
    ('Gastronomie Locale', 'gastronomie-locale', 'Savourez les spécialités culinaires', 'gastronomie-locale', 'easy', 90, 'utensils', '#DC2626'),
    ('Randonnées Nature', 'randonnees-nature', 'Explorez la nature environnante', 'randonnees-nature', 'medium', 180, 'mountain', '#059669'),
    ('Vieille Ville', 'vieille-ville', 'Promenade dans les quartiers historiques', 'vieille-ville', 'easy', 60, 'building', '#7C3AED'),
    ('Art et Culture', 'art-culture', 'Musées, galeries et sites culturels', 'art-culture', 'easy', 90, 'palette', '#F59E0B')
) AS category_data(name, slug, description, type, difficulty, estimated_duration, icon, color)
WHERE NOT EXISTS (
  SELECT 1 FROM journey_categories jc 
  WHERE jc.city_id = c.id AND jc.name = category_data.name
);