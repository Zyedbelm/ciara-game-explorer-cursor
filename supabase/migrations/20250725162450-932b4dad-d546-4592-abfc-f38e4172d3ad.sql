-- Créer la table des notifications pour visiteurs
CREATE TABLE IF NOT EXISTS public.visitor_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  trigger_type TEXT NOT NULL, -- step_completion, journey_complete, reward_available, achievement, reminder
  is_read BOOLEAN DEFAULT false,
  shown_as_toast BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_visitor_notifications_user_unread ON public.visitor_notifications(user_id, is_read, shown_as_toast);
CREATE INDEX idx_visitor_notifications_created ON public.visitor_notifications(created_at DESC);

-- RLS
ALTER TABLE public.visitor_notifications ENABLE ROW LEVEL SECURITY;

-- Politique : utilisateurs voient seulement leurs notifications
CREATE POLICY "Users can view own notifications" ON public.visitor_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Politique : utilisateurs peuvent marquer comme lues
CREATE POLICY "Users can update own notifications" ON public.visitor_notifications  
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique : système peut créer des notifications
CREATE POLICY "System can create notifications" ON public.visitor_notifications
  FOR INSERT WITH CHECK (true);

-- Trigger pour updated_at
CREATE TRIGGER update_visitor_notifications_updated_at
  BEFORE UPDATE ON public.visitor_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour créer des notifications automatiques
CREATE OR REPLACE FUNCTION public.create_visitor_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_trigger_type TEXT DEFAULT 'info',
  p_metadata JSONB DEFAULT '{}',
  p_expires_hours INTEGER DEFAULT 168 -- 7 jours par défaut
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.visitor_notifications (
    user_id,
    title,
    message,
    type,
    trigger_type,
    metadata,
    expires_at
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_trigger_type,
    p_metadata,
    now() + (p_expires_hours || ' hours')::interval
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Fonction de nettoyage des anciennes notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les notifications expirées ou très anciennes (30 jours)
  DELETE FROM public.visitor_notifications 
  WHERE expires_at < now() 
     OR (created_at < now() - interval '30 days' AND is_read = true);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN 'Supprimé ' || deleted_count || ' notifications expirées';
END;
$$;