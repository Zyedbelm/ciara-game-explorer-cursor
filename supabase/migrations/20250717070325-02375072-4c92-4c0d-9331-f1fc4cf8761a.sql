-- Partie 4: Association des étapes aux parcours et quiz

-- 7. Associer des étapes aux parcours existants
WITH journey_step_assignments AS (
  SELECT 
    j.id as journey_id,
    s.id as step_id,
    ROW_NUMBER() OVER (PARTITION BY j.id ORDER BY s.points_awarded DESC, RANDOM()) as step_order
  FROM public.journeys j
  JOIN public.steps s ON j.city_id = s.city_id
  WHERE j.is_predefined = true
  AND NOT EXISTS (
    SELECT 1 FROM public.journey_steps js2 
    WHERE js2.journey_id = j.id AND js2.step_id = s.id
  )
)
INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions)
SELECT 
  jsa.journey_id,
  jsa.step_id,
  jsa.step_order,
  CASE 
    WHEN jsa.step_order = 1 THEN 'Bienvenue ! Commencez votre aventure ici.'
    WHEN jsa.step_order = 2 THEN 'Deuxième étape importante de votre parcours.'
    WHEN jsa.step_order = 3 THEN 'Vous êtes à mi-chemin, continuez !'
    ELSE 'Profitez de cette étape pour prendre des photos.'
  END
FROM journey_step_assignments jsa
WHERE jsa.step_order <= 4; -- Maximum 4 étapes par parcours

-- 8. Ajouter des questions de quiz pour les étapes qui en ont
INSERT INTO public.quiz_questions (step_id, question, options, correct_answer, explanation, question_type, points_awarded, bonus_points)
SELECT 
  s.id,
  'Que savez-vous sur ce lieu historique ?',
  '{"A": "Il date du Moyen Âge", "B": "Il a été construit récemment", "C": "Il est en rénovation", "D": "Il n''existe plus"}',
  'A',
  'Ce lieu historique témoigne du riche patrimoine de la région.',
  'multiple_choice',
  15,
  5
FROM public.steps s
WHERE s.has_quiz = true
AND NOT EXISTS (
  SELECT 1 FROM public.quiz_questions qq2 
  WHERE qq2.step_id = s.id
)
LIMIT 10; -- Limiter à 10 questions pour commencer

-- 9. Ajouter du contenu documentaire pour les étapes
INSERT INTO public.content_documents (step_id, city_id, title, content, document_type, language)
SELECT 
  s.id,
  s.city_id,
  'Histoire du lieu - ' || s.name,
  'Ce lieu remarquable possède une histoire riche qui remonte à plusieurs siècles. Construit dans un style architectural typique de la région, il témoigne du savoir-faire local et de l''importance culturelle de cette zone géographique. Les visiteurs peuvent y découvrir des éléments authentiques et comprendre l''évolution historique de la ville.',
  'historical_info',
  'fr'
FROM public.steps s
WHERE NOT EXISTS (
  SELECT 1 FROM public.content_documents cd2 
  WHERE cd2.step_id = s.id
)
LIMIT 15; -- Documenter 15 étapes pour commencer