-- Temporairement supprimer la contrainte unique sur les slugs
ALTER TABLE journey_categories DROP CONSTRAINT IF EXISTS journey_categories_slug_key;

-- Nettoyer complètement les catégories pour ne garder que les 5 standardisées
-- Supprimer toutes les anciennes catégories qui ne correspondent pas aux 5 standards
DELETE FROM journey_categories 
WHERE name NOT IN ('Patrimoine', 'Gastronomie', 'Nature', 'Vieille Ville', 'Art & Culture');

-- S'assurer que chaque ville a exactement les 5 catégories standardisées
-- D'abord supprimer les catégories en double en gardant la première occurrence
DELETE FROM journey_categories 
WHERE id NOT IN (
  SELECT DISTINCT ON (city_id, name) id
  FROM journey_categories 
  WHERE name IN ('Patrimoine', 'Gastronomie', 'Nature', 'Vieille Ville', 'Art & Culture')
  ORDER BY city_id, name, created_at ASC
);

-- Mettre à jour les catégories existantes pour avoir les bons attributs
UPDATE journey_categories 
SET 
  slug = CASE name
    WHEN 'Patrimoine' THEN 'patrimoine-culturel'
    WHEN 'Gastronomie' THEN 'gastronomie-locale' 
    WHEN 'Nature' THEN 'randonnees-nature'
    WHEN 'Vieille Ville' THEN 'vieille-ville'
    WHEN 'Art & Culture' THEN 'art-culture'
  END,
  description = CASE name
    WHEN 'Patrimoine' THEN 'Histoire et monuments'
    WHEN 'Gastronomie' THEN 'Spécialités locales'
    WHEN 'Nature' THEN 'Paysages naturels'
    WHEN 'Vieille Ville' THEN 'Centre historique'
    WHEN 'Art & Culture' THEN 'Musées et galeries'
  END,
  icon = CASE name
    WHEN 'Patrimoine' THEN 'building'
    WHEN 'Gastronomie' THEN 'utensils'
    WHEN 'Nature' THEN 'mountain'
    WHEN 'Vieille Ville' THEN 'building'
    WHEN 'Art & Culture' THEN 'camera'
  END,
  color = CASE name
    WHEN 'Patrimoine' THEN '#7C3AED'
    WHEN 'Gastronomie' THEN '#DC2626'
    WHEN 'Nature' THEN '#059669'
    WHEN 'Vieille Ville' THEN '#7C3AED'
    WHEN 'Art & Culture' THEN '#F59E0B'
  END,
  type = 'cultural',
  difficulty = 'easy',
  estimated_duration = 90
WHERE name IN ('Patrimoine', 'Gastronomie', 'Nature', 'Vieille Ville', 'Art & Culture');

-- Insérer les catégories manquantes pour chaque ville
INSERT INTO journey_categories (city_id, name, slug, description, icon, color, type, difficulty, estimated_duration)
SELECT 
  c.id as city_id,
  cat.name,
  cat.slug,
  cat.description,
  cat.icon,
  cat.color,
  'cultural' as type,
  'easy' as difficulty,
  90 as estimated_duration
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
  WHERE jc.city_id = c.id AND jc.name = cat.name
);

-- Mettre à jour les parcours orphelins pour qu'ils utilisent une catégorie valide
UPDATE journeys 
SET category_id = (
  SELECT jc.id 
  FROM journey_categories jc 
  WHERE jc.city_id = journeys.city_id 
  AND jc.name = 'Patrimoine'
  LIMIT 1
)
WHERE category_id IS NULL 
   OR category_id NOT IN (SELECT id FROM journey_categories);

-- Recréer la contrainte unique sur les slugs mais seulement par ville
ALTER TABLE journey_categories ADD CONSTRAINT journey_categories_city_slug_unique UNIQUE (city_id, slug);