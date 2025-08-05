
-- Phase 1: Sécurité et Permissions - Amélioration des politiques RLS

-- 1. Améliorer la fonction get_current_user_role pour plus de robustesse
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(role::text, 'visitor') 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$function$;

-- 2. Fonction pour vérifier l'appartenance à une ville (tenant admins)
CREATE OR REPLACE FUNCTION public.get_user_city_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT city_id 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$function$;

-- 3. Fonction pour vérifier si un utilisateur peut gérer une ville spécifique
CREATE OR REPLACE FUNCTION public.can_manage_city(target_city_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' AND get_user_city_id() = target_city_id THEN true
    ELSE false
  END;
$function$;

-- 4. Améliorer les politiques RLS pour les journeys avec vérification de ville
DROP POLICY IF EXISTS "Only content managers can modify journeys" ON public.journeys;
CREATE POLICY "Content managers can manage journeys in their city" 
ON public.journeys 
FOR ALL 
USING (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() IN ('tenant_admin', 'content_manager') 
      AND can_manage_city(city_id) THEN true
    ELSE false
  END
)
WITH CHECK (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() IN ('tenant_admin', 'content_manager') 
      AND can_manage_city(city_id) THEN true
    ELSE false
  END
);

-- 5. Améliorer les politiques RLS pour les steps
DROP POLICY IF EXISTS "Tenant admins can manage city steps" ON public.steps;
DROP POLICY IF EXISTS "Super admins can manage all steps" ON public.steps;
CREATE POLICY "Content managers can manage steps in their city" 
ON public.steps 
FOR ALL 
USING (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() IN ('tenant_admin', 'content_manager') 
      AND can_manage_city(city_id) THEN true
    ELSE false
  END
)
WITH CHECK (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() IN ('tenant_admin', 'content_manager') 
      AND can_manage_city(city_id) THEN true
    ELSE false
  END
);

-- 6. Politique améliorée pour les profiles (lecture limitée)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view profiles based on role" 
ON public.profiles 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() = user_id THEN true -- Propre profil
    WHEN get_current_user_role() = 'super_admin' THEN true -- Super admin voit tout
    WHEN get_current_user_role() = 'tenant_admin' 
      AND city_id = get_user_city_id() THEN true -- Tenant admin voit sa ville
    ELSE false
  END
);

-- 7. Audit trail table pour traçabilité
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index pour performances des requêtes d'audit
CREATE INDEX idx_admin_audit_log_user_id ON public.admin_audit_log(user_id);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at);
CREATE INDEX idx_admin_audit_log_table_name ON public.admin_audit_log(table_name);

-- RLS pour audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text]));

CREATE POLICY "System can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 8. Optimisation de la base de données - Index manquants
CREATE INDEX IF NOT EXISTS idx_journeys_city_id_active ON public.journeys(city_id, is_active);
CREATE INDEX IF NOT EXISTS idx_steps_city_id_active ON public.steps(city_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_journey_progress_user_status ON public.user_journey_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_city ON public.profiles(role, city_id);

-- 9. Contraintes d'intégrité des données
ALTER TABLE public.journeys 
ADD CONSTRAINT chk_estimated_duration_positive 
CHECK (estimated_duration IS NULL OR estimated_duration > 0);

ALTER TABLE public.journeys 
ADD CONSTRAINT chk_distance_positive 
CHECK (distance_km IS NULL OR distance_km > 0);

ALTER TABLE public.steps 
ADD CONSTRAINT chk_validation_radius_positive 
CHECK (validation_radius > 0);

ALTER TABLE public.steps 
ADD CONSTRAINT chk_points_non_negative 
CHECK (points_awarded >= 0);

-- 10. Fonction de déduplication des étapes
CREATE OR REPLACE FUNCTION public.find_duplicate_steps()
RETURNS TABLE(
  step_id uuid,
  duplicate_count bigint,
  city_name text
)
LANGUAGE sql
STABLE
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

-- 11. Fonction pour nettoyer les données orphelines
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 12. Vue pour les statistiques avancées (lecture seule)
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
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

-- 13. Table pour les paramètres système
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS pour system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (get_current_user_role() = 'super_admin')
WITH CHECK (get_current_user_role() = 'super_admin');

-- Trigger pour updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Paramètres par défaut
INSERT INTO public.system_settings (key, value, description) VALUES 
('max_journey_steps', '50', 'Nombre maximum d''étapes par parcours'),
('default_step_radius', '30', 'Rayon de validation par défaut pour les étapes (en mètres)'),
('min_points_per_step', '5', 'Points minimum par étape'),
('max_points_per_step', '100', 'Points maximum par étape'),
('journey_deletion_policy', '"soft"', 'Politique de suppression: soft ou hard')
ON CONFLICT (key) DO NOTHING;
