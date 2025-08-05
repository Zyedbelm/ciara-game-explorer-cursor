-- Corriger le pays pour les villes françaises
UPDATE public.cities 
SET country = 'France' 
WHERE name IN ('Carcassonne', 'Collioure', 'Gruissan', 'Narbonne', 'Sète');

-- Ajouter les 5 catégories standardisées pour chaque ville française qui n'en a pas
INSERT INTO public.journey_categories (city_id, name, slug, description, type, difficulty, estimated_duration, icon, color)
SELECT 
    c.id as city_id,
    unnest(ARRAY['Patrimoine Culturel', 'Gastronomie Locale', 'Randonnées Nature', 'Vieille Ville', 'Art et Culture']) as name,
    unnest(ARRAY['patrimoine-culturel', 'gastronomie-locale', 'randonnees-nature', 'vieille-ville', 'art-culture']) as slug,
    unnest(ARRAY['Découvrez l''histoire et la culture locale', 'Savourez les spécialités culinaires', 'Explorez la nature environnante', 'Promenade dans les quartiers historiques', 'Musées, galeries et sites culturels']) as description,
    unnest(ARRAY['patrimoine-culturel', 'gastronomie-locale', 'randonnees-nature', 'vieille-ville', 'art-culture']) as type,
    unnest(ARRAY['easy', 'easy', 'medium', 'easy', 'easy']) as difficulty,
    unnest(ARRAY[120, 90, 180, 60, 90]) as estimated_duration,
    unnest(ARRAY['building', 'utensils', 'mountain', 'building', 'camera']) as icon,
    unnest(ARRAY['#8B4513', '#DC2626', '#059669', '#7C3AED', '#F59E0B']) as color
FROM cities c
WHERE c.country = 'France'
AND NOT EXISTS (
    SELECT 1 FROM journey_categories jc 
    WHERE jc.city_id = c.id
);