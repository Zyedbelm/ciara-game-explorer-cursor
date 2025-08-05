-- CIARA Content Improvement Plan - Simplified Implementation
-- Phase 1: Clean up test data and duplicates

-- Remove test steps with obvious test names
DELETE FROM public.quiz_questions WHERE step_id IN (
  SELECT id FROM public.steps WHERE 
  name ILIKE '%test%' OR 
  name ILIKE '%nom de létape%' OR 
  name ILIKE '%trwtwrt%' OR
  name ILIKE '%demo%' OR
  name ILIKE '%exemple%'
);

DELETE FROM public.journey_steps WHERE step_id IN (
  SELECT id FROM public.steps WHERE 
  name ILIKE '%test%' OR 
  name ILIKE '%nom de létape%' OR 
  name ILIKE '%trwtwrt%' OR
  name ILIKE '%demo%' OR
  name ILIKE '%exemple%'
);

DELETE FROM public.content_documents WHERE step_id IN (
  SELECT id FROM public.steps WHERE 
  name ILIKE '%test%' OR 
  name ILIKE '%nom de létape%' OR 
  name ILIKE '%trwtwrt%' OR
  name ILIKE '%demo%' OR
  name ILIKE '%exemple%'
);

DELETE FROM public.steps WHERE 
  name ILIKE '%test%' OR 
  name ILIKE '%nom de létape%' OR 
  name ILIKE '%trwtwrt%' OR
  name ILIKE '%demo%' OR
  name ILIKE '%exemple%';

-- Phase 2: Create new steps for Carcassonne (only if they don't exist)
INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, has_quiz, type, address) 
SELECT 
  c.id,
  'Remparts de la Cité',
  'Explorez les impressionnantes fortifications médiévales de Carcassonne, classées au patrimoine mondial de l''UNESCO. Ces remparts du XIIIe siècle offrent une vue exceptionnelle sur la ville basse.',
  43.2061,
  2.3659,
  25,
  50,
  true,
  'monument',
  'Cité de Carcassonne, 11000 Carcassonne'
FROM public.cities c 
WHERE c.name = 'Carcassonne'
  AND NOT EXISTS (
    SELECT 1 FROM public.steps s 
    WHERE s.city_id = c.id AND s.name = 'Remparts de la Cité'
  );

INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, has_quiz, type, address) 
SELECT 
  c.id,
  'Basilique Saint-Nazaire',
  'Découvrez ce joyau de l''art gothique languedocien avec ses magnifiques verrières et sculptures. Cette basilique témoigne de l''évolution architecturale du XIIe au XIVe siècle.',
  43.2067,
  2.3651,
  20,
  40,
  true,
  'monument',
  'Place Auguste Pierre Pont, 11000 Carcassonne'
FROM public.cities c 
WHERE c.name = 'Carcassonne'
  AND NOT EXISTS (
    SELECT 1 FROM public.steps s 
    WHERE s.city_id = c.id AND s.name = 'Basilique Saint-Nazaire'
  );

INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, has_quiz, type, address) 
SELECT 
  c.id,
  'Marché aux Fleurs',
  'Plongez dans l''ambiance provençale du marché local où se mélangent saveurs du terroir, artisanat et traditions. Un lieu vivant au cœur de la bastide Saint-Louis.',
  43.2125,
  2.3508,
  15,
  30,
  true,
  'commerce',
  'Place Carnot, 11000 Carcassonne'
FROM public.cities c 
WHERE c.name = 'Carcassonne'
  AND NOT EXISTS (
    SELECT 1 FROM public.steps s 
    WHERE s.city_id = c.id AND s.name = 'Marché aux Fleurs'
  );

-- Create new steps for Collioure (only if they don't exist)
INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, has_quiz, type, address) 
SELECT 
  c.id,
  'Château Royal',
  'Forteresse des rois de Majorque puis bastion de Vauban, ce château offre une plongée dans 700 ans d''histoire méditerranéenne. Sa position stratégique domine la baie de Collioure.',
  42.5264,
  3.0836,
  25,
  40,
  true,
  'monument',
  'Rue du Château, 66190 Collioure'
FROM public.cities c 
WHERE c.name = 'Collioure'
  AND NOT EXISTS (
    SELECT 1 FROM public.steps s 
    WHERE s.city_id = c.id AND s.name = 'Château Royal'
  );

INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, has_quiz, type, address) 
SELECT 
  c.id,
  'Église Notre-Dame-des-Anges',
  'Cette église emblématique avec son clocher-phare unique au monde a inspiré de nombreux peintres. Son intérieur baroque contraste avec la simplicité de son architecture extérieure.',
  42.5269,
  3.0829,
  20,
  35,
  true,
  'monument',
  'Place de l''Église, 66190 Collioure'
FROM public.cities c 
WHERE c.name = 'Collioure'
  AND NOT EXISTS (
    SELECT 1 FROM public.steps s 
    WHERE s.city_id = c.id AND s.name = 'Église Notre-Dame-des-Anges'
  );

INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, has_quiz, type, address) 
SELECT 
  c.id,
  'Chemin du Fauvisme',
  'Suivez les pas de Matisse, Derain et Dufy qui révolutionnèrent la peinture en créant le mouvement fauve à Collioure. 20 reproductions jalonnent ce parcours artistique unique.',
  42.5251,
  3.0845,
  30,
  50,
  true,
  'culture',
  'Quai de l''Amirauté, 66190 Collioure'
FROM public.cities c 
WHERE c.name = 'Collioure'
  AND NOT EXISTS (
    SELECT 1 FROM public.steps s 
    WHERE s.city_id = c.id AND s.name = 'Chemin du Fauvisme'
  );

-- Phase 3: Enhance existing steps with better descriptions and points
UPDATE public.steps 
SET 
  description = CASE 
    WHEN description IS NULL OR LENGTH(description) < 50 THEN 
      'Découvrez ce lieu emblématique qui raconte l''histoire et la culture locale. Un point d''intérêt incontournable pour comprendre l''âme de la destination.'
    ELSE description
  END,
  points_awarded = CASE 
    WHEN points_awarded < 10 THEN 15
    WHEN points_awarded > 50 THEN 30
    ELSE points_awarded
  END
WHERE city_id IN (
  SELECT id FROM public.cities 
  WHERE name IN ('Lausanne', 'Montreux', 'Narbonne', 'Sion', 'Carcassonne', 'Collioure')
);

-- Phase 4: Add quiz capability to steps that don't have it
UPDATE public.steps 
SET has_quiz = true 
WHERE has_quiz = false 
  AND city_id IN (
    SELECT id FROM public.cities 
    WHERE name IN ('Lausanne', 'Montreux', 'Narbonne', 'Sion', 'Carcassonne', 'Collioure')
  );

-- Phase 5: Create sample quiz questions for steps without any
INSERT INTO public.quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
SELECT 
  s.id,
  'Que représente ce lieu dans l''histoire locale ?',
  'multiple_choice',
  'Un témoignage du patrimoine culturel',
  '["Un témoignage du patrimoine culturel", "Un site récent", "Un lieu sans importance", "Une construction moderne"]'::jsonb,
  'Ce lieu est un élément important du patrimoine local qui mérite d''être préservé et valorisé.',
  10,
  5
FROM public.steps s
JOIN public.cities c ON s.city_id = c.id
WHERE c.name IN ('Lausanne', 'Montreux', 'Narbonne', 'Sion')
  AND s.has_quiz = true
  AND NOT EXISTS (
    SELECT 1 FROM public.quiz_questions qq WHERE qq.step_id = s.id
  )
LIMIT 15;

-- Phase 6: Optimize journey categories descriptions
UPDATE public.journey_categories 
SET 
  description = CASE slug
    WHEN 'patrimoine-culturel' THEN 'Explorez l''histoire et le patrimoine architectural de la région'
    WHEN 'gastronomie-locale' THEN 'Savourez les spécialités culinaires et découvrez les producteurs locaux'
    WHEN 'randonnees-nature' THEN 'Partez à la découverte des paysages naturels et panoramas exceptionnels'
    WHEN 'vieille-ville' THEN 'Déambulez dans les quartiers historiques et leurs ruelles pittoresques'
    WHEN 'art-culture' THEN 'Immergez-vous dans la scène artistique et culturelle locale'
    ELSE description
  END
WHERE description IS NULL OR LENGTH(description) < 30;

-- Phase 7: Update journey total points to match their steps
UPDATE public.journeys 
SET total_points = (
  SELECT COALESCE(SUM(s.points_awarded), 0)
  FROM public.journey_steps js
  JOIN public.steps s ON js.step_id = s.id
  WHERE js.journey_id = journeys.id
)
WHERE is_active = true;