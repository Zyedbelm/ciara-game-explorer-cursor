-- Phase 1: Nettoyage des itinéraires avec 0 ou 1 étape
-- ========================================================

-- Identifier et supprimer les itinéraires problématiques
WITH journeys_to_delete AS (
  SELECT j.id, j.name, j.city_id
  FROM public.journeys j
  LEFT JOIN public.journey_steps js ON j.id = js.journey_id
  GROUP BY j.id, j.name, j.city_id
  HAVING COUNT(js.step_id) <= 1
)
-- Supprimer d'abord les progressions utilisateur liées
DELETE FROM public.user_journey_progress 
WHERE journey_id IN (SELECT id FROM journeys_to_delete);

-- Supprimer les relations journey_steps
WITH journeys_to_delete AS (
  SELECT j.id
  FROM public.journeys j
  LEFT JOIN public.journey_steps js ON j.id = js.journey_id
  GROUP BY j.id
  HAVING COUNT(js.step_id) <= 1
)
DELETE FROM public.journey_steps 
WHERE journey_id IN (SELECT id FROM journeys_to_delete);

-- Supprimer les itinéraires eux-mêmes
WITH journeys_to_delete AS (
  SELECT j.id, j.name
  FROM public.journeys j
  LEFT JOIN public.journey_steps js ON j.id = js.journey_id
  GROUP BY j.id, j.name
  HAVING COUNT(js.step_id) <= 1
)
DELETE FROM public.journeys 
WHERE id IN (SELECT id FROM journeys_to_delete);

-- Fonction pour obtenir les top explorateurs par ville basée sur l'activité réelle
CREATE OR REPLACE FUNCTION get_city_top_explorers(p_city_id uuid, p_limit integer DEFAULT 10)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  avatar_url text,
  city_points integer,
  steps_completed integer,
  journeys_completed integer,
  rank_position integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH city_user_stats AS (
    SELECT 
      p.user_id,
      p.full_name,
      p.avatar_url,
      -- Points gagnés dans cette ville spécifiquement
      COALESCE(SUM(sc.points_earned), 0)::integer as city_points,
      -- Étapes complétées dans cette ville
      COUNT(DISTINCT sc.step_id)::integer as steps_completed,
      -- Parcours complétés dans cette ville
      COUNT(DISTINCT CASE WHEN ujp.is_completed = true THEN ujp.journey_id END)::integer as journeys_completed
    FROM public.profiles p
    LEFT JOIN public.step_completions sc ON p.user_id = sc.user_id
    LEFT JOIN public.steps s ON sc.step_id = s.id AND s.city_id = p_city_id
    LEFT JOIN public.user_journey_progress ujp ON p.user_id = ujp.user_id
    LEFT JOIN public.journeys j ON ujp.journey_id = j.id AND j.city_id = p_city_id
    WHERE p.role = 'visitor'
    GROUP BY p.user_id, p.full_name, p.avatar_url
    HAVING COALESCE(SUM(sc.points_earned), 0) > 0 -- Seulement les utilisateurs avec des points dans cette ville
  ),
  ranked_users AS (
    SELECT 
      *,
      ROW_NUMBER() OVER (ORDER BY city_points DESC, steps_completed DESC, journeys_completed DESC) as rank_position
    FROM city_user_stats
  )
  SELECT 
    ru.user_id,
    ru.full_name,
    ru.avatar_url,
    ru.city_points,
    ru.steps_completed,
    ru.journeys_completed,
    ru.rank_position::integer
  FROM ranked_users ru
  ORDER BY ru.rank_position
  LIMIT p_limit;
END;
$$;