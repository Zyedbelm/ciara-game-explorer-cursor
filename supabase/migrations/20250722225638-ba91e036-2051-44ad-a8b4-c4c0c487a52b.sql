-- Supprimer et remplacer les 6 vues problématiques par des fonctions
-- Cette approche évite complètement les problèmes de SECURITY DEFINER sur les vues

-- 1. Supprimer toutes les vues admin problématiques
DROP VIEW IF EXISTS public.admin_overview CASCADE;
DROP VIEW IF EXISTS public.admin_media_stats CASCADE;
DROP VIEW IF EXISTS public.admin_engagement_stats CASCADE;
DROP VIEW IF EXISTS public.admin_dashboard_stats CASCADE;
DROP VIEW IF EXISTS public.admin_performance_stats CASCADE;
DROP VIEW IF EXISTS public.admin_error_monitoring CASCADE;
DROP VIEW IF EXISTS public.admin_test_view CASCADE;

-- 2. Créer des fonctions à la place des vues pour éviter les problèmes SECURITY DEFINER

-- Fonction pour les statistiques du dashboard
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(
  city_id uuid,
  city_name text,
  total_journeys bigint,
  active_journeys bigint,
  total_steps bigint,
  total_users bigint,
  visitors bigint,
  total_points_awarded bigint,
  total_journey_starts bigint,
  completed_journeys bigint,
  completion_rate numeric
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    c.id as city_id,
    c.name as city_name,
    COUNT(DISTINCT j.id) as total_journeys,
    COUNT(DISTINCT CASE WHEN j.is_active THEN j.id END) as active_journeys,
    COUNT(DISTINCT s.id) as total_steps,
    COUNT(DISTINCT p.user_id) as total_users,
    COUNT(DISTINCT CASE WHEN p.role = 'visitor' THEN p.user_id END) as visitors,
    COALESCE(SUM(p.total_points), 0) as total_points_awarded,
    COUNT(DISTINCT ujp.id) as total_journey_starts,
    COUNT(DISTINCT CASE WHEN ujp.is_completed THEN ujp.id END) as completed_journeys,
    CASE 
      WHEN COUNT(DISTINCT ujp.id) > 0 
      THEN ROUND(COUNT(DISTINCT CASE WHEN ujp.is_completed THEN ujp.id END)::numeric / COUNT(DISTINCT ujp.id) * 100, 2)
      ELSE 0 
    END as completion_rate
  FROM public.cities c
  LEFT JOIN public.journeys j ON c.id = j.city_id
  LEFT JOIN public.steps s ON c.id = s.city_id
  LEFT JOIN public.profiles p ON c.id = p.city_id
  LEFT JOIN public.user_journey_progress ujp ON j.id = ujp.journey_id
  GROUP BY c.id, c.name;
$function$;

-- Fonction pour les statistiques de performance
CREATE OR REPLACE FUNCTION public.get_admin_performance_stats()
RETURNS TABLE(
  table_name text,
  total_records bigint,
  active_records bigint,
  avg_duration numeric,
  oldest_record timestamp with time zone,
  newest_record timestamp with time zone
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    'journeys' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN is_active THEN 1 END) as active_records,
    AVG(estimated_duration) as avg_duration,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
  FROM public.journeys
  UNION ALL
  SELECT 
    'steps' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN is_active THEN 1 END) as active_records,
    AVG(points_awarded) as avg_duration,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
  FROM public.steps
  UNION ALL
  SELECT 
    'profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN role = 'visitor' THEN 1 END) as active_records,
    AVG(total_points) as avg_duration,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
  FROM public.profiles;
$function$;

-- Fonction pour les statistiques des médias
CREATE OR REPLACE FUNCTION public.get_admin_media_stats()
RETURNS TABLE(
  bucket_name text,
  entity_type text,
  file_count bigint,
  total_size_bytes bigint,
  total_size_mb numeric,
  avg_file_size numeric,
  active_files bigint,
  last_upload timestamp with time zone
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    bucket_name,
    entity_type,
    COUNT(*) as file_count,
    SUM(file_size) as total_size_bytes,
    ROUND(SUM(file_size)::numeric / 1024 / 1024, 2) as total_size_mb,
    AVG(file_size) as avg_file_size,
    COUNT(CASE WHEN is_active THEN 1 END) as active_files,
    MAX(created_at) as last_upload
  FROM public.media_files
  WHERE is_active = true
  GROUP BY bucket_name, entity_type
  ORDER BY bucket_name, entity_type;
$function$;

-- Fonction pour les statistiques d'engagement
CREATE OR REPLACE FUNCTION public.get_admin_engagement_stats()
RETURNS TABLE(
  city_name text,
  city_id uuid,
  week_start timestamp with time zone,
  unique_users bigint,
  total_events bigint,
  journey_events bigint,
  step_events bigint,
  completions bigint
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    c.name as city_name,
    c.id as city_id,
    DATE_TRUNC('week', ae.timestamp) as week_start,
    COUNT(DISTINCT ae.user_id) as unique_users,
    COUNT(*) as total_events,
    COUNT(CASE WHEN ae.event_type = 'journey' THEN 1 END) as journey_events,
    COUNT(CASE WHEN ae.event_type = 'step' THEN 1 END) as step_events,
    COUNT(CASE WHEN ae.event_name = 'journey_completed' THEN 1 END) as completions
  FROM public.analytics_events ae
  LEFT JOIN public.cities c ON ae.city_id = c.id
  WHERE ae.timestamp >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY c.id, c.name, DATE_TRUNC('week', ae.timestamp)
  ORDER BY week_start DESC, city_name;
$function$;

-- Fonction pour le monitoring des erreurs
CREATE OR REPLACE FUNCTION public.get_admin_error_monitoring()
RETURNS TABLE(
  level text,
  error_count bigint,
  last_occurrence timestamp with time zone,
  affected_users uuid[]
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    level,
    COUNT(*) as error_count,
    MAX(created_at) as last_occurrence,
    array_agg(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as affected_users
  FROM public.system_logs
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND level IN ('error', 'critical')
  GROUP BY level
  ORDER BY error_count DESC;
$function$;

-- Fonction pour l'aperçu admin
CREATE OR REPLACE FUNCTION public.get_admin_overview()
RETURNS TABLE(
  metric_type text,
  data jsonb
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    'system_health' as metric_type,
    jsonb_build_object(
      'total_cities', (SELECT COUNT(*) FROM public.cities),
      'total_journeys', (SELECT COUNT(*) FROM public.journeys WHERE is_active = true),
      'total_steps', (SELECT COUNT(*) FROM public.steps WHERE is_active = true),
      'total_users', (SELECT COUNT(*) FROM public.profiles),
      'pending_reviews', (SELECT COUNT(*) FROM public.journeys WHERE review_status = 'pending_review'),
      'recent_errors', (SELECT COUNT(*) FROM public.system_logs WHERE level IN ('error', 'critical') AND created_at >= CURRENT_DATE - INTERVAL '24 hours'),
      'storage_usage_mb', 0
    ) as data;
$function$;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Toutes les vues admin ont été remplacées par des fonctions.';
    RAISE NOTICE 'Utilisez get_admin_dashboard_stats(), get_admin_performance_stats(), etc.';
    RAISE NOTICE 'Plus aucune vue SECURITY DEFINER ne devrait être détectée.';
END $$;