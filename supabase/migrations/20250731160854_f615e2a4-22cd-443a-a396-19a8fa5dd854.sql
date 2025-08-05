-- CIARA Content Improvement Plan Implementation
-- Phase 1: Clean up test and redundant data

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

-- Phase 2: Create enhanced steps for Carcassonne
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
FROM public.cities c WHERE c.name = 'Carcassonne';

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
FROM public.cities c WHERE c.name = 'Carcassonne';

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
FROM public.cities c WHERE c.name = 'Carcassonne';

INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, has_quiz, type, address) 
SELECT 
  c.id,
  'Canal du Midi - Écluse',
  'Admirez l''ingéniosité de Pierre-Paul Riquet à travers ce système d''écluses du XVIIe siècle. Le Canal du Midi relie l''Atlantique à la Méditerranée sur 240 kilomètres.',
  43.2089,
  2.3442,
  20,
  35,
  true,
  'nature',
  'Port de Carcassonne, 11000 Carcassonne'
FROM public.cities c WHERE c.name = 'Carcassonne';

-- Create enhanced steps for Collioure
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
FROM public.cities c WHERE c.name = 'Collioure';

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
FROM public.cities c WHERE c.name = 'Collioure';

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
FROM public.cities c WHERE c.name = 'Collioure';

INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, has_quiz, type, address) 
SELECT 
  c.id,
  'Moulin de Collioure',
  'Ancien moulin à vent du XIVe siècle transformé en point de vue exceptionnel. Il témoigne de l''activité agricole passée et offre un panorama à 360° sur la Côte Vermeille.',
  42.5245,
  3.0798,
  20,
  40,
  true,
  'monument',
  'Route de Port-Vendres, 66190 Collioure'
FROM public.cities c WHERE c.name = 'Collioure';

INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, has_quiz, type, address) 
SELECT 
  c.id,
  'Cave Templier',
  'Découvrez les vins de Banyuls et Collioure dans cette cave centenaire. La tradition viticole locale produit des vins doux naturels uniques au monde grâce au terroir schisteux.',
  42.5261,
  3.0821,
  15,
  30,
  true,
  'gastronomie',
  'Route d''Argelès, 66190 Collioure'
FROM public.cities c WHERE c.name = 'Collioure';

-- Phase 3: Create comprehensive quiz questions for new steps
INSERT INTO public.quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
SELECT 
  s.id,
  'En quelle année les remparts de Carcassonne ont-ils été classés au patrimoine mondial de l''UNESCO ?',
  'multiple_choice',
  '1997',
  '["1985", "1997", "2001", "1990"]'::jsonb,
  'Carcassonne a été inscrite au patrimoine mondial de l''UNESCO en 1997 pour son ensemble architectural exceptionnel.',
  10,
  5
FROM public.steps s 
JOIN public.cities c ON s.city_id = c.id 
WHERE c.name = 'Carcassonne' AND s.name = 'Remparts de la Cité';

INSERT INTO public.quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
SELECT 
  s.id,
  'Quel mouvement artistique est né à Collioure au début du XXe siècle ?',
  'multiple_choice',
  'Le Fauvisme',
  '["L''Impressionnisme", "Le Fauvisme", "Le Cubisme", "Le Surréalisme"]'::jsonb,
  'Le Fauvisme est né à Collioure en 1905 avec Matisse et Derain qui y développèrent leur style aux couleurs pures.',
  10,
  5
FROM public.steps s 
JOIN public.cities c ON s.city_id = c.id 
WHERE c.name = 'Collioure' AND s.name = 'Chemin du Fauvisme';

-- Phase 4: Create rich content documents
INSERT INTO public.content_documents (step_id, title, content, document_type, language, city_id)
SELECT 
  s.id,
  'Histoire des Fortifications',
  'Les remparts de Carcassonne représentent l''un des ensembles fortifiés les plus complets d''Europe. Construits sur plusieurs siècles, ils témoignent de l''évolution des techniques de fortification du XIIe au XIVe siècle.

La première enceinte, datant du IIIe siècle, fut édifiée par les Romains. Au XIIe siècle, les Trencavel, vicomtes de Carcassonne, renforcent ces défenses. Après la croisade contre les Albigeois (1209), le roi de France Louis IX et son fils Philippe le Hardi transforment Carcassonne en une forteresse royale imprenable.

L''architecture militaire de Carcassonne combine habilement défense active et passive : double enceinte, tours rondes, hourds, créneaux, meurtrières... Chaque élément répond à une stratégie défensive précise.

Au XIXe siècle, l''architecte Viollet-le-Duc entreprend une restauration controversée mais qui sauve l''ensemble de la ruine. Ses travaux, bien que critiqués pour leur aspect "trop parfait", permettent aujourd''hui d''admirer cette merveille architecturale.',
  'historical_info',
  'fr',
  c.id
FROM public.steps s 
JOIN public.cities c ON s.city_id = c.id 
WHERE c.name = 'Carcassonne' AND s.name = 'Remparts de la Cité';

INSERT INTO public.content_documents (step_id, title, content, document_type, language, city_id)
SELECT 
  s.id,
  'Les Peintres Fauves à Collioure',
  'En 1905, Henri Matisse découvre Collioure et y invite André Derain. Éblouis par la lumière méditerranéenne et les couleurs vives du paysage catalan, ils révolutionnent la peinture.

Le Fauvisme naît de cette rencontre entre les artistes et Collioure. Libérés des contraintes de la représentation réaliste, Matisse et Derain utilisent des couleurs pures, sortant directement du tube, pour exprimer leurs émotions face au paysage.

Les œuvres créées cet été-là - "Femme au chapeau" de Matisse, "Pont de Waterloo" de Derain - scandalisent le public parisien. Au Salon d''Automne de 1905, la critique parle de "cage aux fauves", donnant son nom au mouvement.

Raoul Dufy, Othon Friesz, puis plus tard Picasso rejoignent ce laboratoire artistique colliouren. La ville devient un haut lieu de l''art moderne, attirant les avant-gardes européennes jusqu''aux années 1960.

Aujourd''hui, le Chemin du Fauvisme permet de revivre cette révolution artistique à travers 20 reproductions installées aux lieux mêmes où furent peintes les œuvres originales.',
  'cultural_info',
  'fr',
  c.id
FROM public.steps s 
JOIN public.cities c ON s.city_id = c.id 
WHERE c.name = 'Collioure' AND s.name = 'Chemin du Fauvisme';

-- Phase 5: Create structured thematic journeys
-- Heritage Journey for Carcassonne
INSERT INTO public.journeys (city_id, category_id, name, description, difficulty, estimated_duration, total_points, is_active, is_predefined, type_id)
SELECT 
  c.id,
  cat.id,
  'Patrimoine Médiéval de Carcassonne',
  'Découvrez l''exceptionnelle cité médiévale et son histoire millénaire à travers ses monuments emblématiques.',
  'easy',
  120,
  85,
  true,
  true,
  cat.id
FROM public.cities c
CROSS JOIN public.journey_categories cat
WHERE c.name = 'Carcassonne' AND cat.slug = 'patrimoine-culturel' AND cat.city_id = c.id;

-- Art and Culture Journey for Collioure  
INSERT INTO public.journeys (city_id, category_id, name, description, difficulty, estimated_duration, total_points, is_active, is_predefined, type_id)
SELECT 
  c.id,
  cat.id,
  'Sur les Traces des Peintres Fauves',
  'Explorez Collioure à travers les yeux des grands maîtres qui ont révolutionné l''art moderne dans cette perle catalane.',
  'easy',
  90,
  110,
  true,
  true,
  cat.id
FROM public.cities c
CROSS JOIN public.journey_categories cat
WHERE c.name = 'Collioure' AND cat.slug = 'art-culture' AND cat.city_id = c.id;

-- Phase 6: Link steps to journeys with proper ordering
INSERT INTO public.journey_steps (journey_id, step_id, step_order)
SELECT 
  j.id,
  s.id,
  CASE s.name
    WHEN 'Remparts de la Cité' THEN 1
    WHEN 'Basilique Saint-Nazaire' THEN 2
    WHEN 'Marché aux Fleurs' THEN 3
    WHEN 'Canal du Midi - Écluse' THEN 4
  END
FROM public.journeys j
JOIN public.cities c ON j.city_id = c.id
JOIN public.steps s ON s.city_id = c.id
WHERE c.name = 'Carcassonne' 
  AND j.name = 'Patrimoine Médiéval de Carcassonne'
  AND s.name IN ('Remparts de la Cité', 'Basilique Saint-Nazaire', 'Marché aux Fleurs', 'Canal du Midi - Écluse');

INSERT INTO public.journey_steps (journey_id, step_id, step_order)
SELECT 
  j.id,
  s.id,
  CASE s.name
    WHEN 'Chemin du Fauvisme' THEN 1
    WHEN 'Château Royal' THEN 2
    WHEN 'Église Notre-Dame-des-Anges' THEN 3
    WHEN 'Moulin de Collioure' THEN 4
    WHEN 'Cave Templier' THEN 5
  END
FROM public.journeys j
JOIN public.cities c ON j.city_id = c.id
JOIN public.steps s ON s.city_id = c.id
WHERE c.name = 'Collioure' 
  AND j.name = 'Sur les Traces des Peintres Fauves'
  AND s.name IN ('Chemin du Fauvisme', 'Château Royal', 'Église Notre-Dame-des-Anges', 'Moulin de Collioure', 'Cave Templier');

-- Phase 7: Update journey total points based on steps
UPDATE public.journeys 
SET total_points = (
  SELECT COALESCE(SUM(s.points_awarded), 0)
  FROM public.journey_steps js
  JOIN public.steps s ON js.step_id = s.id
  WHERE js.journey_id = journeys.id
)
WHERE name IN ('Patrimoine Médiéval de Carcassonne', 'Sur les Traces des Peintres Fauves');

-- Phase 8: Enhance existing steps with better descriptions and points optimization
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
  WHERE name IN ('Lausanne', 'Montreux', 'Narbonne', 'Sion')
);

-- Add quiz questions to existing steps that don't have them
UPDATE public.steps 
SET has_quiz = true 
WHERE has_quiz = false 
  AND city_id IN (
    SELECT id FROM public.cities 
    WHERE name IN ('Lausanne', 'Montreux', 'Narbonne', 'Sion', 'Carcassonne', 'Collioure')
  );

-- Create sample quiz questions for steps without any
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
LIMIT 20;

-- Clean up and optimize journey categories
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