-- Correction des problèmes de sécurité détectés par le linter

-- 1. Corriger les vues avec SECURITY DEFINER (problèmes 1, 2, 3)
-- Les vues ne doivent pas être SECURITY DEFINER pour éviter les problèmes de sécurité

-- Recréer les vues sans SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_dashboard_stats;
CREATE VIEW public.admin_dashboard_stats AS
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

DROP VIEW IF EXISTS public.admin_performance_stats;
CREATE VIEW public.admin_performance_stats AS
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

DROP VIEW IF EXISTS public.admin_media_stats;
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
GROUP BY bucket_name, entity_type
ORDER BY bucket_name, entity_type;

-- 2. Corriger les fonctions avec search_path mutable (problèmes 4, 5, 6, 7)
-- Ajouter SET search_path TO 'public' aux fonctions qui en manquent

CREATE OR REPLACE FUNCTION public.cleanup_orphaned_media()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  orphaned_count integer;
BEGIN
  -- Marquer comme inactifs les fichiers référencés dans des entités supprimées
  UPDATE public.media_files 
  SET is_active = false, updated_at = now()
  WHERE entity_type = 'step' 
    AND entity_id NOT IN (SELECT id FROM public.steps)
    AND is_active = true;
    
  UPDATE public.media_files 
  SET is_active = false, updated_at = now()
  WHERE entity_type = 'journey' 
    AND entity_id NOT IN (SELECT id FROM public.journeys)
    AND is_active = true;
    
  UPDATE public.media_files 
  SET is_active = false, updated_at = now()
  WHERE entity_type = 'city' 
    AND entity_id NOT IN (SELECT id FROM public.cities)
    AND is_active = true;
    
  GET DIAGNOSTICS orphaned_count = ROW_COUNT;
  
  RETURN 'Marked ' || orphaned_count || ' orphaned media files as inactive';
END;
$function$;

CREATE OR REPLACE FUNCTION public.run_maintenance()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result text := '';
BEGIN
  -- Nettoyer les données orphelines
  PERFORM public.cleanup_orphaned_data();
  result := result || 'Orphaned data cleaned. ';
  
  -- Nettoyer les médias orphelins
  result := result || public.cleanup_orphaned_media() || '. ';
  
  -- Mettre à jour les statistiques
  ANALYZE public.journeys;
  ANALYZE public.steps;
  ANALYZE public.profiles;
  ANALYZE public.user_journey_progress;
  result := result || 'Database statistics updated.';
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Supprimer les journey_steps orphelins
  DELETE FROM public.journey_steps 
  WHERE journey_id NOT IN (SELECT id FROM public.journeys)
     OR step_id NOT IN (SELECT id FROM public.steps);
  
  -- Supprimer les quiz_questions orphelins
  DELETE FROM public.quiz_questions 
  WHERE step_id NOT IN (SELECT id FROM public.steps);
  
  -- Supprimer les content_documents orphelins
  DELETE FROM public.content_documents 
  WHERE step_id NOT IN (SELECT id FROM public.steps)
     OR (journey_id IS NOT NULL AND journey_id NOT IN (SELECT id FROM public.journeys))
     OR (city_id IS NOT NULL AND city_id NOT IN (SELECT id FROM public.cities));
  
  -- Supprimer les step_completions orphelins
  DELETE FROM public.step_completions 
  WHERE step_id NOT IN (SELECT id FROM public.steps)
     OR user_id NOT IN (SELECT user_id FROM public.profiles);
  
  -- Supprimer les user_journey_progress orphelins
  DELETE FROM public.user_journey_progress 
  WHERE journey_id NOT IN (SELECT id FROM public.journeys)
     OR user_id NOT IN (SELECT user_id FROM public.profiles);

  RAISE NOTICE 'Cleanup completed successfully';
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_duplicate_steps()
RETURNS TABLE(
  step_id uuid,
  duplicate_count bigint,
  city_name text
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    s.id as step_id,
    COUNT(*) as duplicate_count,
    c.name as city_name
  FROM public.steps s
  JOIN public.cities c ON s.city_id = c.id
  GROUP BY s.name, s.latitude, s.longitude, s.city_id, s.id, c.name
  HAVING COUNT(*) > 1;
$function$;