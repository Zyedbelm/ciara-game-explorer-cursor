-- Phase 3: Fonctionnalités avancées et internationalisation

-- 1. Amélioration du système de traductions
-- Ajouter des métadonnées pour les traductions
ALTER TABLE public.ui_translations 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS context text,
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;

-- Index pour améliorer les requêtes de traductions
CREATE INDEX IF NOT EXISTS idx_ui_translations_key_lang ON public.ui_translations(key, language);
CREATE INDEX IF NOT EXISTS idx_ui_translations_category ON public.ui_translations(category, is_approved);

-- 2. Table pour les analytics avancées
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  event_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  city_id uuid REFERENCES public.cities(id),
  journey_id uuid REFERENCES public.journeys(id),
  step_id uuid REFERENCES public.steps(id),
  properties jsonb DEFAULT '{}',
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  device_type text,
  browser text,
  platform text
);

-- Index pour les requêtes d'analytics
CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type, event_name);
CREATE INDEX idx_analytics_events_city_journey ON public.analytics_events(city_id, journey_id);

-- RLS pour analytics
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analytics events viewable by admins" 
ON public.analytics_events 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text]));

CREATE POLICY "System can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- 3. Table pour les notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone
);

-- Index pour notifications
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_notifications_expires_at ON public.notifications(expires_at) WHERE expires_at IS NOT NULL;

-- RLS pour notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text]));

-- 4. Fonctions pour les analytics avancées
CREATE OR REPLACE FUNCTION public.track_event(
  p_event_type text,
  p_event_name text,
  p_user_id uuid DEFAULT auth.uid(),
  p_properties jsonb DEFAULT '{}',
  p_city_id uuid DEFAULT NULL,
  p_journey_id uuid DEFAULT NULL,
  p_step_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO public.analytics_events (
    event_type,
    event_name,
    user_id,
    properties,
    city_id,
    journey_id,
    step_id
  ) VALUES (
    p_event_type,
    p_event_name,
    p_user_id,
    p_properties,
    p_city_id,
    p_journey_id,
    p_step_id
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$;

-- 5. Vue pour les statistiques d'engagement
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

-- 6. Fonction pour nettoyer les anciennes données d'analytics
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  -- Supprimer les événements de plus de 1 an
  DELETE FROM public.analytics_events 
  WHERE timestamp < CURRENT_DATE - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Supprimer les notifications expirées
  DELETE FROM public.notifications 
  WHERE expires_at < now() OR (created_at < CURRENT_DATE - INTERVAL '30 days' AND is_read = true);
  
  RETURN 'Deleted ' || deleted_count || ' old analytics events and expired notifications';
END;
$function$;

-- 7. Table pour les tâches administratives
CREATE TABLE IF NOT EXISTS public.admin_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  task_type text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  city_id uuid REFERENCES public.cities(id),
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index pour tâches admin
CREATE INDEX idx_admin_tasks_status ON public.admin_tasks(status, priority);
CREATE INDEX idx_admin_tasks_assigned ON public.admin_tasks(assigned_to, status);
CREATE INDEX idx_admin_tasks_city ON public.admin_tasks(city_id, status);

-- RLS pour tâches admin
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view tasks" 
ON public.admin_tasks 
FOR SELECT 
USING (
  get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text])
  OR assigned_to = auth.uid()
);

CREATE POLICY "Admins can manage tasks" 
ON public.admin_tasks 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text]));

-- Trigger pour updated_at
CREATE TRIGGER update_admin_tasks_updated_at
BEFORE UPDATE ON public.admin_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Validation workflow pour les contenus
ALTER TABLE public.journeys 
ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'draft' CHECK (review_status IN ('draft', 'pending_review', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS review_notes text;

ALTER TABLE public.steps 
ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'draft' CHECK (review_status IN ('draft', 'pending_review', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS review_notes text;

-- Index pour le workflow de validation
CREATE INDEX idx_journeys_review_status ON public.journeys(review_status, city_id);
CREATE INDEX idx_steps_review_status ON public.steps(review_status, city_id);

-- 9. Fonction pour le workflow de validation
CREATE OR REPLACE FUNCTION public.approve_content(
  content_type text,
  content_id uuid,
  approval_status text,
  review_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Vérifier que l'utilisateur a les droits
  IF get_current_user_role() NOT IN ('super_admin', 'tenant_admin') THEN
    RAISE EXCEPTION 'Insufficient permissions for content approval';
  END IF;
  
  -- Valider le statut
  IF approval_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid approval status';
  END IF;
  
  -- Mettre à jour selon le type de contenu
  IF content_type = 'journey' THEN
    UPDATE public.journeys 
    SET review_status = approval_status,
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        review_notes = approve_content.review_notes,
        is_active = CASE WHEN approval_status = 'approved' THEN true ELSE false END
    WHERE id = content_id;
    
  ELSIF content_type = 'step' THEN
    UPDATE public.steps 
    SET review_status = approval_status,
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        review_notes = approve_content.review_notes,
        is_active = CASE WHEN approval_status = 'approved' THEN true ELSE false END
    WHERE id = content_id;
    
  ELSE
    RAISE EXCEPTION 'Invalid content type';
  END IF;
  
  RETURN true;
END;
$function$;