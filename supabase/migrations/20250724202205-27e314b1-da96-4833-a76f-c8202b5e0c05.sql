-- Phase 1: Clean up itineraries with 0 or 1 steps
-- First, remove user progress for journeys with insufficient steps
DELETE FROM public.user_journey_progress 
WHERE journey_id IN (
  SELECT j.id 
  FROM public.journeys j
  LEFT JOIN public.journey_steps js ON j.id = js.journey_id
  GROUP BY j.id
  HAVING COUNT(js.step_id) <= 1
);

-- Remove journey_steps relationships for journeys with insufficient steps
DELETE FROM public.journey_steps 
WHERE journey_id IN (
  SELECT j.id 
  FROM public.journeys j
  LEFT JOIN public.journey_steps js ON j.id = js.journey_id
  GROUP BY j.id
  HAVING COUNT(js.step_id) <= 1
);

-- Delete the journeys themselves
DELETE FROM public.journeys 
WHERE id IN (
  SELECT j.id 
  FROM public.journeys j
  LEFT JOIN public.journey_steps js ON j.id = js.journey_id
  GROUP BY j.id
  HAVING COUNT(js.step_id) <= 1
);

-- Phase 2: Fix the get_city_top_explorers function
-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_city_top_explorers(uuid, integer);

-- Create the corrected function with proper column aliasing
CREATE OR REPLACE FUNCTION public.get_city_top_explorers(p_city_id uuid, p_limit integer DEFAULT 10)
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
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH city_user_stats AS (
    SELECT 
      p.user_id,
      p.full_name,
      p.avatar_url,
      -- Points earned specifically in this city
      COALESCE(SUM(CASE WHEN s.city_id = p_city_id THEN sc.points_earned ELSE 0 END), 0)::integer as user_city_points,
      -- Steps completed in this city
      COUNT(DISTINCT CASE WHEN s.city_id = p_city_id THEN sc.step_id END)::integer as user_steps_completed,
      -- Journeys completed in this city
      COUNT(DISTINCT CASE WHEN j.city_id = p_city_id AND ujp.is_completed = true THEN ujp.journey_id END)::integer as user_journeys_completed
    FROM public.profiles p
    LEFT JOIN public.step_completions sc ON p.user_id = sc.user_id
    LEFT JOIN public.steps s ON sc.step_id = s.id
    LEFT JOIN public.user_journey_progress ujp ON p.user_id = ujp.user_id
    LEFT JOIN public.journeys j ON ujp.journey_id = j.id
    WHERE p.role = 'visitor'
    GROUP BY p.user_id, p.full_name, p.avatar_url
    HAVING COALESCE(SUM(CASE WHEN s.city_id = p_city_id THEN sc.points_earned ELSE 0 END), 0) > 0
  ),
  ranked_users AS (
    SELECT 
      *,
      ROW_NUMBER() OVER (
        ORDER BY user_city_points DESC, 
                 user_steps_completed DESC, 
                 user_journeys_completed DESC
      ) as user_rank_position
    FROM city_user_stats
  )
  SELECT 
    ru.user_id,
    ru.full_name,
    ru.avatar_url,
    ru.user_city_points,
    ru.user_steps_completed,
    ru.user_journeys_completed,
    ru.user_rank_position::integer
  FROM ranked_users ru
  ORDER BY ru.user_rank_position
  LIMIT p_limit;
END;
$function$;