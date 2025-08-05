-- Add demo data for Sion
-- Get Sion city ID first
INSERT INTO journey_categories (city_id, name, slug, description, type, difficulty, estimated_duration, icon, color) VALUES
('75f4c469-eb8e-43f1-be1e-119c0f56c72e', 'Randonnées en montagne', 'randonnees-montagne', 'Explorez les magnifiques sentiers alpins autour de Sion', 'hiking', 'medium', 180, 'mountain', '#059669'),
('75f4c469-eb8e-43f1-be1e-119c0f56c72e', 'Patrimoine historique', 'patrimoine-historique', 'Découvrez l''histoire de la capitale valaisanne', 'old_town', 'easy', 90, 'castle', '#7C3AED'),
('75f4c469-eb8e-43f1-be1e-119c0f56c72e', 'Gastronomie valaisanne', 'gastronomie-valaisanne', 'Savourez les spécialités locales du Valais', 'gastronomy', 'easy', 120, 'utensils', '#DC2626');

-- Add some demo journeys for Sion
INSERT INTO journeys (city_id, category_id, name, description, difficulty, estimated_duration, distance_km, total_points, image_url, is_active, is_predefined) 
SELECT 
  '75f4c469-eb8e-43f1-be1e-119c0f56c72e',
  jc.id,
  CASE 
    WHEN jc.slug = 'randonnees-montagne' THEN 'Tour des châteaux de Sion'
    WHEN jc.slug = 'patrimoine-historique' THEN 'Visite de la vieille ville'
    WHEN jc.slug = 'gastronomie-valaisanne' THEN 'Circuit des caves et vignobles'
  END,
  CASE 
    WHEN jc.slug = 'randonnees-montagne' THEN 'Une randonnée spectaculaire avec vue sur les châteaux de Valère et Tourbillon'
    WHEN jc.slug = 'patrimoine-historique' THEN 'Parcours à travers les ruelles historiques et monuments de Sion'
    WHEN jc.slug = 'gastronomie-valaisanne' THEN 'Dégustation de vins et spécialités dans les caves locales'
  END,
  jc.difficulty,
  jc.estimated_duration,
  CASE 
    WHEN jc.slug = 'randonnees-montagne' THEN 5.2
    WHEN jc.slug = 'patrimoine-historique' THEN 2.8
    WHEN jc.slug = 'gastronomie-valaisanne' THEN 3.5
  END,
  CASE 
    WHEN jc.slug = 'randonnees-montagne' THEN 250
    WHEN jc.slug = 'patrimoine-historique' THEN 150
    WHEN jc.slug = 'gastronomie-valaisanne' THEN 200
  END,
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
  true,
  true
FROM journey_categories jc 
WHERE jc.city_id = '75f4c469-eb8e-43f1-be1e-119c0f56c72e';

-- Add some demo partners for Sion
INSERT INTO partners (city_id, name, category, description, address, phone, email, website, latitude, longitude, is_active) VALUES
('75f4c469-eb8e-43f1-be1e-119c0f56c72e', 'Restaurant Le Bistrot', 'restaurant', 'Cuisine traditionnelle valaisanne dans un cadre authentique', 'Rue du Grand-Pont 12, 1950 Sion', '+41 27 322 45 67', 'contact@bistrot-sion.ch', 'https://bistrot-sion.ch', 46.2319, 7.3581, true),
('75f4c469-eb8e-43f1-be1e-119c0f56c72e', 'Cave des Coteaux', 'wine', 'Dégustation de vins valaisans et produits du terroir', 'Avenue de la Gare 25, 1950 Sion', '+41 27 323 78 90', 'info@cavedescoceaux.ch', 'https://cavedescoceaux.ch', 46.2298, 7.3607, true),
('75f4c469-eb8e-43f1-be1e-119c0f56c72e', 'Hôtel Elite', 'hotel', 'Hôtel 4 étoiles au cœur de Sion avec vue sur les châteaux', 'Rue de la Dent-Blanche 5, 1950 Sion', '+41 27 322 03 27', 'reservation@hotel-elite.ch', 'https://hotel-elite.ch', 46.2337, 7.3589, true);

-- Add rewards for Sion partners
INSERT INTO rewards (partner_id, title, description, type, points_required, value_chf, terms_conditions, is_active)
SELECT 
  p.id,
  CASE 
    WHEN p.category = 'restaurant' THEN '15% de réduction'
    WHEN p.category = 'wine' THEN 'Dégustation gratuite'
    WHEN p.category = 'hotel' THEN 'Surclassement gratuit'
  END,
  CASE 
    WHEN p.category = 'restaurant' THEN 'Réduction de 15% sur l''addition (hors boissons)'
    WHEN p.category = 'wine' THEN 'Dégustation gratuite de 3 vins avec accompagnements'
    WHEN p.category = 'hotel' THEN 'Surclassement gratuit selon disponibilité'
  END,
  CASE 
    WHEN p.category = 'restaurant' THEN 'discount'
    WHEN p.category = 'wine' THEN 'free_item'
    WHEN p.category = 'hotel' THEN 'upgrade'
  END,
  CASE 
    WHEN p.category = 'restaurant' THEN 150
    WHEN p.category = 'wine' THEN 100
    WHEN p.category = 'hotel' THEN 300
  END,
  CASE 
    WHEN p.category = 'restaurant' THEN 25
    WHEN p.category = 'wine' THEN 20
    WHEN p.category = 'hotel' THEN 50
  END,
  'Valable du lundi au vendredi. Réservation obligatoire.',
  true
FROM partners p 
WHERE p.city_id = '75f4c469-eb8e-43f1-be1e-119c0f56c72e';