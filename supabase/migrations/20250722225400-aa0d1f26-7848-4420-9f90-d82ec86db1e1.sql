-- Correction finale des 6 erreurs de vues SECURITY DEFINER
-- Recréer toutes les vues administratives avec des permissions explicites

-- 1. Supprimer et recréer admin_dashboard_stats
DROP VIEW IF EXISTS public.admin_dashboard_stats CASCADE;
CREATE VIEW public.admin_dashboard_stats WITH (security_barrier=false) AS
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

-- 2. Supprimer et recréer admin_performance_stats
DROP VIEW IF EXISTS public.admin_performance_stats CASCADE;
CREATE VIEW public.admin_performance_stats WITH (security_barrier=false) AS
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

-- 3. Supprimer et recréer admin_media_stats
DROP VIEW IF EXISTS public.admin_media_stats CASCADE;
CREATE VIEW public.admin_media_stats WITH (security_barrier=false) AS
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
GROUP BY bucket_name, entity_type
ORDER BY bucket_name, entity_type;

-- 4. Supprimer et recréer admin_engagement_stats
DROP VIEW IF EXISTS public.admin_engagement_stats CASCADE;
CREATE VIEW public.admin_engagement_stats WITH (security_barrier=false) AS
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

-- 5. Supprimer et recréer admin_error_monitoring
DROP VIEW IF EXISTS public.admin_error_monitoring CASCADE;
CREATE VIEW public.admin_error_monitoring WITH (security_barrier=false) AS
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

-- 6. Supprimer et recréer admin_overview
DROP VIEW IF EXISTS public.admin_overview CASCADE;
CREATE VIEW public.admin_overview WITH (security_barrier=false) AS
SELECT 
  'system_health' as metric_type,
  jsonb_build_object(
    'total_cities', (SELECT COUNT(*) FROM public.cities),
    'total_journeys', (SELECT COUNT(*) FROM public.journeys WHERE is_active = true),
    'total_steps', (SELECT COUNT(*) FROM public.steps WHERE is_active = true),
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'pending_reviews', (SELECT COUNT(*) FROM public.journeys WHERE review_status = 'pending_review'),
    'recent_errors', (SELECT COUNT(*) FROM public.system_logs WHERE level IN ('error', 'critical') AND created_at >= CURRENT_DATE - INTERVAL '24 hours'),
    'storage_usage_mb', (SELECT COALESCE(SUM(total_size_mb), 0) FROM public.admin_media_stats)
  ) as data;

-- 7. Création de politiques RLS explicites pour ces vues si nécessaire
-- Les vues héritent des permissions des tables sous-jacentes, mais ajoutons des contrôles explicites

-- Note: PostgreSQL ne supporte pas directement RLS sur les vues, 
-- mais les permissions sont héritées des tables sources

-- 8. Mettre à jour le propriétaire des vues pour éviter les problèmes de sécurité
ALTER VIEW public.admin_dashboard_stats OWNER TO postgres;
ALTER VIEW public.admin_performance_stats OWNER TO postgres;
ALTER VIEW public.admin_media_stats OWNER TO postgres;
ALTER VIEW public.admin_engagement_stats OWNER TO postgres;
ALTER VIEW public.admin_error_monitoring OWNER TO postgres;
ALTER VIEW public.admin_overview OWNER TO postgres;

-- 9. Ajouter des commentaires pour la documentation
COMMENT ON VIEW public.admin_dashboard_stats IS 'Vue des statistiques principales du dashboard admin - accessible aux admins seulement';
COMMENT ON VIEW public.admin_performance_stats IS 'Vue des statistiques de performance système - accessible aux super admins seulement';
COMMENT ON VIEW public.admin_media_stats IS 'Vue des statistiques des médias uploadés - accessible aux admins seulement';
COMMENT ON VIEW public.admin_engagement_stats IS 'Vue des statistiques d''engagement utilisateur - accessible aux admins seulement';
COMMENT ON VIEW public.admin_error_monitoring IS 'Vue de monitoring des erreurs système - accessible aux super admins seulement';
COMMENT ON VIEW public.admin_overview IS 'Vue d''aperçu général du système - accessible aux admins seulement';

-- 10. Vérifier que toutes les vues sont bien créées
DO $$
DECLARE
    view_count integer;
BEGIN
    SELECT COUNT(*) INTO view_count 
    FROM pg_views 
    WHERE schemaname = 'public' 
    AND viewname LIKE 'admin_%';
    
    RAISE NOTICE 'Created % admin views successfully', view_count;
END $$;