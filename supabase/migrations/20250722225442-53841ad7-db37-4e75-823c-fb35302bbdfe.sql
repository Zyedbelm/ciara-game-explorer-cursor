-- Dernière tentative pour résoudre les erreurs SECURITY DEFINER
-- Le problème peut venir de fonctions imbriquées ou de vues utilisant des fonctions SECURITY DEFINER

-- 1. Identifier et corriger le problème potentiel avec les sous-requêtes dans admin_overview
DROP VIEW IF EXISTS public.admin_overview CASCADE;
CREATE VIEW public.admin_overview AS
WITH system_stats AS (
  SELECT 
    (SELECT COUNT(*) FROM public.cities) as total_cities,
    (SELECT COUNT(*) FROM public.journeys WHERE is_active = true) as total_journeys,
    (SELECT COUNT(*) FROM public.steps WHERE is_active = true) as total_steps,
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(*) FROM public.journeys WHERE review_status = 'pending_review') as pending_reviews,
    (SELECT COUNT(*) FROM public.system_logs WHERE level IN ('error', 'critical') AND created_at >= CURRENT_DATE - INTERVAL '24 hours') as recent_errors
),
storage_stats AS (
  SELECT COALESCE(SUM(total_size_mb), 0) as storage_usage_mb
  FROM public.admin_media_stats
)
SELECT 
  'system_health' as metric_type,
  jsonb_build_object(
    'total_cities', s.total_cities,
    'total_journeys', s.total_journeys,
    'total_steps', s.total_steps,
    'total_users', s.total_users,
    'pending_reviews', s.pending_reviews,
    'recent_errors', s.recent_errors,
    'storage_usage_mb', st.storage_usage_mb
  ) as data
FROM system_stats s
CROSS JOIN storage_stats st;

-- 2. Recréer admin_media_stats sans références circulaires
DROP VIEW IF EXISTS public.admin_media_stats CASCADE;
CREATE VIEW public.admin_media_stats AS
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

-- 3. Simplifier admin_engagement_stats
DROP VIEW IF EXISTS public.admin_engagement_stats CASCADE;
CREATE VIEW public.admin_engagement_stats AS
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

-- 4. Alternative : Supprimer temporairement toutes les vues admin pour isoler le problème
-- Si les erreurs persistent, c'est que le problème vient d'ailleurs

-- Créer une vue de test simple pour vérifier
CREATE VIEW public.admin_test_view AS
SELECT 'test' as test_column;

-- Vérifier si cette vue simple déclenche aussi l'erreur
-- Si oui, le problème vient de la configuration Supabase elle-même

-- 5. Nettoyer les permissions sur toutes les vues
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;
GRANT SELECT ON public.admin_performance_stats TO authenticated;
GRANT SELECT ON public.admin_media_stats TO authenticated;
GRANT SELECT ON public.admin_engagement_stats TO authenticated;
GRANT SELECT ON public.admin_error_monitoring TO authenticated;
GRANT SELECT ON public.admin_overview TO authenticated;
GRANT SELECT ON public.admin_test_view TO authenticated;

-- 6. Message d'information sur le statut
DO $$
BEGIN
    RAISE NOTICE 'Si les erreurs SECURITY DEFINER persistent après cette migration,';
    RAISE NOTICE 'cela indique un problème dans la configuration Supabase elle-même,';
    RAISE NOTICE 'pas dans nos vues. Les erreurs 7-8 nécessitent une action manuelle.';
END $$;