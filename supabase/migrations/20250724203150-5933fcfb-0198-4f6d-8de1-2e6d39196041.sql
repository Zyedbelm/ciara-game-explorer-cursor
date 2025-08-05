-- Update the get_city_top_explorers function to include admin users
CREATE OR REPLACE FUNCTION public.get_city_top_explorers(p_city_id uuid, p_limit integer DEFAULT 10)
 RETURNS TABLE(user_id uuid, full_name text, avatar_url text, city_points integer, steps_completed integer, journeys_completed integer, rank_position integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH city_user_stats AS (
    SELECT 
      p.user_id,
      p.full_name,
      p.avatar_url,
      p.role,
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
    WHERE p.role IN ('visitor', 'super_admin', 'tenant_admin', 'content_manager')
    GROUP BY p.user_id, p.full_name, p.avatar_url, p.role
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