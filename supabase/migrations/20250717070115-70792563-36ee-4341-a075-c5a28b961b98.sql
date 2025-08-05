-- Partie 2 corrigée: Catégories et étapes avec les bonnes énumérations

-- 2. Ajouter plus de catégories de parcours pour chaque ville
WITH city_data AS (
  SELECT id, name FROM public.cities WHERE slug IN ('sion', 'lausanne', 'geneve', 'montreux')
)
INSERT INTO public.journey_categories (city_id, name, slug, description, type, difficulty, estimated_duration, icon, color) 
SELECT 
  cd.id,
  category_data.name,
  category_data.slug,
  category_data.description,
  category_data.type::journey_type,
  category_data.difficulty::journey_difficulty,
  category_data.estimated_duration,
  category_data.icon,
  category_data.color
FROM city_data cd
CROSS JOIN (VALUES
  ('Patrimoine historique', 'patrimoine', 'Découvrez l''histoire fascinante de la région', 'culture', 'easy', 120, 'castle', '#8B5CF6'),
  ('Nature et randonnées', 'nature-randonnees', 'Explorez les sentiers et paysages naturels', 'nature', 'medium', 180, 'mountain', '#10B981'),
  ('Gastronomie locale', 'gastronomie', 'Savourez les spécialités culinaires', 'gastronomy', 'easy', 90, 'utensils', '#F59E0B'),
  ('Art et culture', 'art-culture', 'Immergez-vous dans l''art et la culture', 'art', 'easy', 100, 'palette', '#EF4444'),
  ('Shopping et artisanat', 'shopping', 'Découvrez les commerces et artisans locaux', 'shopping', 'easy', 75, 'shopping-bag', '#6366F1'),
  ('Ville et patrimoine', 'ville', 'Explorez le centre historique', 'old_town', 'easy', 150, 'building', '#8B5CF6')
) AS category_data(name, slug, description, type, difficulty, estimated_duration, icon, color)
WHERE NOT EXISTS (
  SELECT 1 FROM public.journey_categories jc2 
  WHERE jc2.city_id = cd.id AND jc2.slug = category_data.slug
);

-- 3. Créer plus d'étapes diversifiées pour chaque ville
WITH city_steps AS (
  SELECT 
    c.id as city_id,
    c.name as city_name,
    c.latitude as city_lat,
    c.longitude as city_lng
  FROM public.cities c
  WHERE c.slug IN ('sion', 'lausanne', 'geneve', 'montreux')
)
INSERT INTO public.steps (city_id, name, description, type, latitude, longitude, address, points_awarded, validation_radius, has_quiz, images) 
SELECT 
  cs.city_id,
  step_data.name || ' - ' || cs.city_name,
  step_data.description,
  step_data.type::step_type,
  cs.city_lat + step_data.lat_offset,
  cs.city_lng + step_data.lng_offset,
  step_data.address || ', ' || cs.city_name,
  step_data.points_awarded,
  step_data.validation_radius,
  step_data.has_quiz,
  step_data.images
FROM city_steps cs
CROSS JOIN (VALUES
  ('Cathédrale Notre-Dame', 'Magnifique cathédrale gothique au cœur de la ville', 'monument', 0.002, 0.001, 'Place de la Cathédrale', 25, 30, true, ARRAY['https://images.unsplash.com/photo-1519204588530-0cde67d4c763?w=800']),
  ('Musée d''histoire', 'Plongez dans l''histoire locale à travers des expositions captivantes', 'museum', 0.001, 0.002, 'Rue du Musée 12', 30, 25, true, ARRAY['https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800']),
  ('Place du marché', 'Découvrez les produits locaux et l''ambiance du marché', 'landmark', -0.001, 0.001, 'Place du Marché', 20, 40, false, ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800']),
  ('Belvédère', 'Vue spectaculaire sur la ville et les montagnes', 'viewpoint', 0.004, 0.002, 'Colline du Belvédère', 50, 35, false, ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']),
  ('Restaurant typique', 'Savourez la cuisine locale dans ce restaurant authentique', 'restaurant', -0.002, 0.003, 'Rue Gastronomique 8', 35, 20, true, ARRAY['https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800']),
  ('Centre d''activités', 'Participez à des activités locales traditionnelles', 'activity', 0.001, -0.001, 'Rue de l''Animation 15', 40, 15, true, ARRAY['https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800']),
  ('Fontaine historique', 'Fontaine emblématique datant du 18ème siècle', 'monument', 0.002, -0.001, 'Place de la Fontaine', 15, 20, false, ARRAY['https://images.unsplash.com/photo-1554213352-5ffe6534af08?w=800']),
  ('Café traditionnel', 'Dégustez un café dans l''ambiance authentique d''un établissement centenaire', 'restaurant', -0.003, 0.001, 'Rue du Café 5', 20, 15, false, ARRAY['https://images.unsplash.com/photo-1501747315-3aa946dd12d6?w=800'])
) AS step_data(name, description, type, lat_offset, lng_offset, address, points_awarded, validation_radius, has_quiz, images);