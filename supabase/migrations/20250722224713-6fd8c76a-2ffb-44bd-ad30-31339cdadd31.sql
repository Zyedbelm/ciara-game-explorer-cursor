-- Phase 2: Optimisation des données et gestion des médias

-- 1. Nettoyage automatique des données de test (garde seulement les données essentielles)
-- Supprimer les données de test excessives en gardant Sion comme référence
DELETE FROM public.step_completions 
WHERE user_id IN (
  SELECT user_id FROM public.profiles 
  WHERE email LIKE '%test%' OR email LIKE '%demo%'
);

DELETE FROM public.user_journey_progress 
WHERE user_id IN (
  SELECT user_id FROM public.profiles 
  WHERE email LIKE '%test%' OR email LIKE '%demo%'
);

-- Nettoyer les quiz questions en doublon (garder les plus récents)
WITH duplicate_quizzes AS (
  SELECT id, 
    ROW_NUMBER() OVER (PARTITION BY step_id, question ORDER BY created_at DESC) as rn
  FROM public.quiz_questions
)
DELETE FROM public.quiz_questions 
WHERE id IN (
  SELECT id FROM duplicate_quizzes WHERE rn > 1
);

-- 2. Optimisation des médias et stockage
-- Créer une table pour tracker les fichiers uploadés
CREATE TABLE IF NOT EXISTS public.media_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  bucket_name text NOT NULL,
  entity_type text NOT NULL, -- 'step', 'journey', 'profile', 'city', etc.
  entity_id uuid,
  uploaded_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index pour les requêtes de médias
CREATE INDEX idx_media_files_entity ON public.media_files(entity_type, entity_id);
CREATE INDEX idx_media_files_bucket ON public.media_files(bucket_name, is_active);
CREATE INDEX idx_media_files_uploaded_by ON public.media_files(uploaded_by);

-- RLS pour media_files
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media files are viewable by everyone" 
ON public.media_files 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Content managers can manage media files" 
ON public.media_files 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text]));

-- Trigger pour updated_at
CREATE TRIGGER update_media_files_updated_at
BEFORE UPDATE ON public.media_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Fonction pour nettoyer les fichiers orphelins
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_media()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 4. Amélioration de la table steps pour gérer les médias
ALTER TABLE public.steps 
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS media_count integer DEFAULT 0;

-- 5. Amélioration de la table journeys pour les métadonnées
ALTER TABLE public.journeys 
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS accessibility_info jsonb,
ADD COLUMN IF NOT EXISTS season_availability text[] DEFAULT ARRAY['spring', 'summer', 'autumn', 'winter'];

-- 6. Index composites pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_journeys_city_active_difficulty ON public.journeys(city_id, is_active, difficulty);
CREATE INDEX IF NOT EXISTS idx_steps_city_type_active ON public.steps(city_id, type, is_active);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_journey ON public.user_journey_progress(user_id, journey_id);

-- 7. Statistiques de performance pour l'admin
CREATE OR REPLACE VIEW public.admin_performance_stats AS
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

-- 8. Fonction de maintenance automatique
CREATE OR REPLACE FUNCTION public.run_maintenance()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 9. Contraintes supplémentaires pour l'intégrité
ALTER TABLE public.media_files 
ADD CONSTRAINT chk_file_size_positive 
CHECK (file_size IS NULL OR file_size > 0);

ALTER TABLE public.media_files 
ADD CONSTRAINT chk_entity_type_valid 
CHECK (entity_type IN ('step', 'journey', 'profile', 'city', 'partner', 'reward', 'category', 'document'));

-- 10. Vue pour le monitoring des uploads
CREATE OR REPLACE VIEW public.admin_media_stats AS
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