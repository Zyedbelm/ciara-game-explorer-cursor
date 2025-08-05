-- Ajouter des questions de quiz réalistes et intéressantes pour toutes les étapes

-- D'abord, supprimer les anciennes questions pour éviter les doublons
DELETE FROM public.quiz_questions;

-- Questions pour les étapes de Lausanne (Découverte Culturelle)
INSERT INTO public.quiz_questions (step_id, question, question_type, options, correct_answer, explanation, points_awarded, bonus_points)
SELECT 
  s.id,
  CASE 
    WHEN s.name ILIKE '%cathédrale%' OR s.name ILIKE '%notre-dame%' THEN 'En quelle année la Cathédrale Notre-Dame de Lausanne a-t-elle été consacrée ?'
    WHEN s.name ILIKE '%château%' OR s.name ILIKE '%saint-maire%' THEN 'Quel est le style architectural principal du Château Saint-Maire ?'
    WHEN s.name ILIKE '%olympique%' OR s.name ILIKE '%musée%' THEN 'En quelle année Lausanne est-elle devenue la capitale olympique ?'
    WHEN s.name ILIKE '%ouchy%' OR s.name ILIKE '%port%' THEN 'Quel lac borde le port d''Ouchy ?'
    WHEN s.name ILIKE '%palais%' OR s.name ILIKE '%rumine%' THEN 'Combien de musées le Palais de Rumine abrite-t-il ?'
    WHEN s.name ILIKE '%place%' OR s.name ILIKE '%palud%' THEN 'Quel est le nom de la fontaine historique de la Place de la Palud ?'
    WHEN s.name ILIKE '%escaliers%' OR s.name ILIKE '%marché%' THEN 'Combien de marches comptent les Escaliers du Marché ?'
    WHEN s.name ILIKE '%sauvabelin%' OR s.name ILIKE '%tour%' THEN 'Quelle est la hauteur de la Tour de Sauvabelin ?'
    ELSE 'Quelle est la spécialité culinaire la plus célèbre de cette région ?'
  END as question,
  'multiple_choice' as question_type,
  CASE 
    WHEN s.name ILIKE '%cathédrale%' OR s.name ILIKE '%notre-dame%' THEN '["1275", "1235", "1300", "1250"]'::jsonb
    WHEN s.name ILIKE '%château%' OR s.name ILIKE '%saint-maire%' THEN '["Renaissance", "Gothique", "Baroque", "Néoclassique"]'::jsonb
    WHEN s.name ILIKE '%olympique%' OR s.name ILIKE '%musée%' THEN '["1994", "1982", "1988", "1990"]'::jsonb
    WHEN s.name ILIKE '%ouchy%' OR s.name ILIKE '%port%' THEN '["Lac Léman", "Lac de Neuchâtel", "Lac de Constance", "Lac des Quatre-Cantons"]'::jsonb
    WHEN s.name ILIKE '%palais%' OR s.name ILIKE '%rumine%' THEN '["5 musées", "3 musées", "7 musées", "4 musées"]'::jsonb
    WHEN s.name ILIKE '%place%' OR s.name ILIKE '%palud%' THEN '["Fontaine de la Justice", "Fontaine de la Paix", "Fontaine du Commerce", "Fontaine de la Liberté"]'::jsonb
    WHEN s.name ILIKE '%escaliers%' OR s.name ILIKE '%marché%' THEN '["150 marches", "200 marches", "100 marches", "175 marches"]'::jsonb
    WHEN s.name ILIKE '%sauvabelin%' OR s.name ILIKE '%tour%' THEN '["35 mètres", "25 mètres", "45 mètres", "30 mètres"]'::jsonb
    ELSE '["Fondue", "Raclette", "Rösti", "Malakoff"]'::jsonb
  END as options,
  CASE 
    WHEN s.name ILIKE '%cathédrale%' OR s.name ILIKE '%notre-dame%' THEN '1275'
    WHEN s.name ILIKE '%château%' OR s.name ILIKE '%saint-maire%' THEN 'Renaissance'
    WHEN s.name ILIKE '%olympique%' OR s.name ILIKE '%musée%' THEN '1994'
    WHEN s.name ILIKE '%ouchy%' OR s.name ILIKE '%port%' THEN 'Lac Léman'
    WHEN s.name ILIKE '%palais%' OR s.name ILIKE '%rumine%' THEN '5 musées'
    WHEN s.name ILIKE '%place%' OR s.name ILIKE '%palud%' THEN 'Fontaine de la Justice'
    WHEN s.name ILIKE '%escaliers%' OR s.name ILIKE '%marché%' THEN '150 marches'
    WHEN s.name ILIKE '%sauvabelin%' OR s.name ILIKE '%tour%' THEN '35 mètres'
    ELSE 'Fondue'
  END as correct_answer,
  CASE 
    WHEN s.name ILIKE '%cathédrale%' OR s.name ILIKE '%notre-dame%' THEN 'La Cathédrale Notre-Dame de Lausanne fut consacrée en 1275 par le pape Grégoire X en présence de l''empereur Rodolphe de Habsbourg.'
    WHEN s.name ILIKE '%château%' OR s.name ILIKE '%saint-maire%' THEN 'Le Château Saint-Maire, construit au 14e-15e siècle, présente un style Renaissance avec des éléments gothiques tardifs.'
    WHEN s.name ILIKE '%olympique%' OR s.name ILIKE '%musée%' THEN 'Lausanne est devenue la capitale olympique en 1994 lorsque le CIO y a établi son siège permanent.'
    WHEN s.name ILIKE '%ouchy%' OR s.name ILIKE '%port%' THEN 'Le port d''Ouchy se situe sur les rives du Lac Léman, le plus grand lac d''Europe occidentale.'
    WHEN s.name ILIKE '%palais%' OR s.name ILIKE '%rumine%' THEN 'Le Palais de Rumine abrite 5 musées : Archéologie, Géologie, Zoologie, Monnaies et l''Espace Arlaud.'
    WHEN s.name ILIKE '%place%' OR s.name ILIKE '%palud%' THEN 'La Fontaine de la Justice, datant du 16e siècle, orne le centre de la Place de la Palud depuis des siècles.'
    WHEN s.name ILIKE '%escaliers%' OR s.name ILIKE '%marché%' THEN 'Les Escaliers du Marché comptent environ 150 marches et relient la ville basse à la ville haute.'
    WHEN s.name ILIKE '%sauvabelin%' OR s.name ILIKE '%tour%' THEN 'La Tour de Sauvabelin, haute de 35 mètres, offre une vue panoramique sur Lausanne et le Lac Léman.'
    ELSE 'La fondue est le plat traditionnel suisse par excellence, parfait à partager entre amis.'
  END as explanation,
  15 as points_awarded,
  10 as bonus_points
FROM public.steps s
WHERE s.has_quiz = true;

-- Ajouter des questions bonus pour certaines étapes spécifiques
INSERT INTO public.quiz_questions (step_id, question, question_type, options, correct_answer, explanation, points_awarded, bonus_points)
SELECT 
  s.id,
  'Vrai ou Faux : Cette étape fait partie du patrimoine mondial de l''UNESCO ?',
  'true_false',
  '["Vrai", "Faux"]'::jsonb,
  CASE 
    WHEN s.name ILIKE '%cathédrale%' THEN 'Vrai'
    ELSE 'Faux'
  END,
  CASE 
    WHEN s.name ILIKE '%cathédrale%' THEN 'La Cathédrale de Lausanne fait partie du patrimoine architectural exceptionnel de Suisse.'
    ELSE 'Cette étape, bien qu''historiquement importante, ne fait pas partie du patrimoine mondial UNESCO.'
  END,
  10,
  5
FROM public.steps s
WHERE s.has_quiz = true
LIMIT 5; -- Limiter à quelques étapes pour éviter la répétition

-- Ajouter des questions de reconnaissance visuelle
INSERT INTO public.quiz_questions (step_id, question, question_type, options, correct_answer, explanation, points_awarded, bonus_points)
SELECT 
  s.id,
  'Quel élément architectural caractérise le mieux ce lieu ?',
  'multiple_choice',
  CASE 
    WHEN s.name ILIKE '%cathédrale%' THEN '["Rose gothique", "Clocher roman", "Portail baroque", "Façade néoclassique"]'::jsonb
    WHEN s.name ILIKE '%château%' THEN '["Tours rondes", "Cour d''honneur", "Pont-levis", "Donjon carré"]'::jsonb
    WHEN s.name ILIKE '%place%' THEN '["Arcades", "Beffroi", "Fontaine centrale", "Pavés anciens"]'::jsonb
    ELSE '["Colonnes", "Arches", "Coupole", "Escalier monumental"]'::jsonb
  END,
  CASE 
    WHEN s.name ILIKE '%cathédrale%' THEN 'Rose gothique'
    WHEN s.name ILIKE '%château%' THEN 'Tours rondes'
    WHEN s.name ILIKE '%place%' THEN 'Fontaine centrale'
    ELSE 'Escalier monumental'
  END,
  'Chaque monument historique possède des caractéristiques architecturales uniques qui racontent son histoire.',
  20,
  15
FROM public.steps s
WHERE s.has_quiz = true
LIMIT 8; -- Quelques questions visuelles

-- Mettre à jour le flag has_quiz pour s'assurer que toutes les étapes ont des quiz
UPDATE public.steps SET has_quiz = true WHERE has_quiz = false OR has_quiz IS NULL;