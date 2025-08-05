-- Fonction pour créer des catégories par défaut pour une nouvelle ville
CREATE OR REPLACE FUNCTION public.create_default_categories_for_city()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer les catégories par défaut pour la nouvelle ville
  INSERT INTO public.journey_categories (city_id, name, slug, description, type, difficulty, estimated_duration, icon, color)
  VALUES 
    (NEW.id, 'Patrimoine Culturel', 'patrimoine-culturel', 'Découvrez l''histoire et la culture locale', 'patrimoine-culturel', 'easy', 120, 'landmark', '#8B4513'),
    (NEW.id, 'Gastronomie Locale', 'gastronomie-locale', 'Savourez les spécialités culinaires', 'gastronomie-locale', 'easy', 90, 'utensils', '#DC2626'),
    (NEW.id, 'Randonnées Nature', 'randonnees-nature', 'Explorez la nature environnante', 'randonnees-nature', 'medium', 180, 'mountain', '#059669'),
    (NEW.id, 'Vieille Ville', 'vieille-ville', 'Promenade dans les quartiers historiques', 'vieille-ville', 'easy', 60, 'building', '#7C3AED'),
    (NEW.id, 'Art et Culture', 'art-culture', 'Musées, galeries et sites culturels', 'art-culture', 'easy', 90, 'palette', '#F59E0B');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger qui s'exécute après l'insertion d'une nouvelle ville
CREATE TRIGGER trigger_create_default_categories
  AFTER INSERT ON public.cities
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories_for_city();

-- Ajouter les catégories manquantes pour Montreux (si elle existe déjà)
INSERT INTO public.journey_categories (city_id, name, slug, description, type, difficulty, estimated_duration, icon, color)
SELECT 
  c.id,
  category_data.name,
  category_data.slug,
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
WHERE c.slug = 'montreux'
  AND NOT EXISTS (
    SELECT 1 FROM journey_categories jc 
    WHERE jc.city_id = c.id AND jc.slug = category_data.slug
  );