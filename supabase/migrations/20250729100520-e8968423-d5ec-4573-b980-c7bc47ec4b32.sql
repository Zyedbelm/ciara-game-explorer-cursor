-- Corriger les total_points des parcours en calculant les vrais totaux depuis les étapes et quiz
-- Parcours "Patrimoine & Histoire de Gruissan" - ID spécifique à corriger
UPDATE public.journeys 
SET total_points = (
  SELECT COALESCE(
    (SELECT SUM(s.points_awarded) 
     FROM public.journey_steps js 
     JOIN public.steps s ON js.step_id = s.id 
     WHERE js.journey_id = journeys.id), 0
  ) + 
  COALESCE(
    (SELECT SUM(qq.points_awarded) 
     FROM public.journey_steps js 
     JOIN public.quiz_questions qq ON qq.step_id = js.step_id 
     WHERE js.journey_id = journeys.id), 0
  )
)
WHERE name LIKE '%Gruissan%' AND name LIKE '%Patrimoine%';

-- Mettre à jour tous les autres parcours également pour cohérence
UPDATE public.journeys 
SET total_points = (
  SELECT COALESCE(
    (SELECT SUM(s.points_awarded) 
     FROM public.journey_steps js 
     JOIN public.steps s ON js.step_id = s.id 
     WHERE js.journey_id = journeys.id), 0
  ) + 
  COALESCE(
    (SELECT SUM(qq.points_awarded) 
     FROM public.journey_steps js 
     JOIN public.quiz_questions qq ON qq.step_id = js.step_id 
     WHERE js.journey_id = journeys.id), 0
  )
)
WHERE total_points != (
  SELECT COALESCE(
    (SELECT SUM(s.points_awarded) 
     FROM public.journey_steps js 
     JOIN public.steps s ON js.step_id = s.id 
     WHERE js.journey_id = journeys.id), 0
  ) + 
  COALESCE(
    (SELECT SUM(qq.points_awarded) 
     FROM public.journey_steps js 
     JOIN public.quiz_questions qq ON qq.step_id = js.step_id 
     WHERE js.journey_id = journeys.id), 0
  )
);