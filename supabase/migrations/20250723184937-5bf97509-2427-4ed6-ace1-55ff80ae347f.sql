-- Nettoyer complètement les catégories pour ne garder que les 5 standardisées
-- Supprimer toutes les anciennes catégories qui ne correspondent pas aux 5 standards
DELETE FROM journey_categories 
WHERE name NOT IN ('Patrimoine', 'Gastronomie', 'Nature', 'Vieille Ville', 'Art & Culture');

-- S'assurer que chaque ville a exactement les 5 catégories standardisées
-- D'abord supprimer les catégories en double ou incorrectes
DELETE FROM journey_categories a USING (
  SELECT MIN(id) as id, city_id, name
  FROM journey_categories 
  WHERE name IN ('Patrimoine', 'Gastronomie', 'Nature', 'Vieille Ville', 'Art & Culture')
  GROUP BY city_id, name HAVING COUNT(*) > 1
) b
WHERE a.city_id = b.city_id AND a.name = b.name AND a.id != b.id;

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