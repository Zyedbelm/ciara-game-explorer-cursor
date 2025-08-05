
-- Nettoyer et standardiser les catégories existantes
DELETE FROM journey_categories WHERE slug NOT IN (
  'patrimoine-culturel', 'gastronomie-locale', 'randonnees-nature', 'vieille-ville', 'art-culture'
);

-- Mettre à jour les catégories existantes pour avoir des noms cohérents et courts
UPDATE journey_categories SET 
  name = CASE 
    WHEN slug LIKE '%patrimoine%' THEN 'Patrimoine'
    WHEN slug LIKE '%gastronomie%' THEN 'Gastronomie'
    WHEN slug LIKE '%nature%' OR slug LIKE '%randonnee%' THEN 'Nature'
    WHEN slug LIKE '%vieille-ville%' OR slug LIKE '%ville%' THEN 'Vieille Ville'
    WHEN slug LIKE '%art%' OR slug LIKE '%culture%' THEN 'Art & Culture'
  END,
  icon = CASE 
    WHEN slug LIKE '%patrimoine%' THEN 'building'
    WHEN slug LIKE '%gastronomie%' THEN 'utensils'
    WHEN slug LIKE '%nature%' OR slug LIKE '%randonnee%' THEN 'mountain'
    WHEN slug LIKE '%vieille-ville%' OR slug LIKE '%ville%' THEN 'building'
    WHEN slug LIKE '%art%' OR slug LIKE '%culture%' THEN 'camera'
  END,
  color = CASE 
    WHEN slug LIKE '%patrimoine%' THEN '#7C3AED'
    WHEN slug LIKE '%gastronomie%' THEN '#DC2626'
    WHEN slug LIKE '%nature%' OR slug LIKE '%randonnee%' THEN '#059669'
    WHEN slug LIKE '%vieille-ville%' OR slug LIKE '%ville%' THEN '#7C3AED'
    WHEN slug LIKE '%art%' OR slug LIKE '%culture%' THEN '#F59E0B'
  END,
  description = CASE 
    WHEN slug LIKE '%patrimoine%' THEN 'Histoire et monuments'
    WHEN slug LIKE '%gastronomie%' THEN 'Spécialités locales'
    WHEN slug LIKE '%nature%' OR slug LIKE '%randonnee%' THEN 'Paysages naturels'
    WHEN slug LIKE '%vieille-ville%' OR slug LIKE '%ville%' THEN 'Centre historique'
    WHEN slug LIKE '%art%' OR slug LIKE '%culture%' THEN 'Musées et galeries'
  END
WHERE slug IN ('patrimoine-culturel', 'gastronomie-locale', 'randonnees-nature', 'vieille-ville', 'art-culture');

-- S'assurer que toutes les villes ont exactement ces 5 catégories
INSERT INTO journey_categories (city_id, name, slug, description, icon, color, type, difficulty, estimated_duration)
SELECT 
  c.id,
  cat.name,
  cat.slug,
  cat.description,
  cat.icon,
  cat.color,
  'cultural',
  'easy',
  90
FROM cities c
CROSS JOIN (
  VALUES 
    ('Patrimoine', 'patrimoine-culturel', 'Histoire et monuments', 'building', '#7C3AED'),
    ('Gastronomie', 'gastronomie-locale', 'Spécialités locales', 'utensils', '#DC2626'),
    ('Nature', 'randonnees-nature', 'Paysages naturels', 'mountain', '#059669'),
    ('Vieille Ville', 'vieille-ville', 'Centre historique', 'building', '#7C3AED'),
    ('Art & Culture', 'art-culture', 'Musées et galeries', 'camera', '#F59E0B')
) AS cat(name, slug, description, icon, color)
WHERE NOT EXISTS (
  SELECT 1 FROM journey_categories jc 
  WHERE jc.city_id = c.id AND jc.slug = cat.slug
);

-- Mettre à jour les parcours existants pour qu'ils utilisent les nouvelles catégories
UPDATE journeys 
SET category_id = (
  SELECT jc.id 
  FROM journey_categories jc 
  WHERE jc.city_id = journeys.city_id 
  AND jc.slug = 'patrimoine-culturel'
  LIMIT 1
)
WHERE category_id IS NULL OR category_id NOT IN (
  SELECT id FROM journey_categories WHERE slug IN (
    'patrimoine-culturel', 'gastronomie-locale', 'randonnees-nature', 'vieille-ville', 'art-culture'
  )
);
