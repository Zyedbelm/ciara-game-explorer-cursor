-- Corriger les fonctions avec search_path mutable pour la sécurité

-- 1. Corriger la fonction cleanup_expired_notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 2. Corriger la fonction create_visitor_notification
CREATE OR REPLACE FUNCTION public.create_visitor_notification(p_user_id uuid, p_title text, p_message text, p_type text DEFAULT 'info'::text, p_trigger_type text DEFAULT 'info'::text, p_metadata jsonb DEFAULT '{}'::jsonb, p_expires_hours integer DEFAULT 168)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 3. Corriger la fonction validate_article_published_at
CREATE OR REPLACE FUNCTION public.validate_article_published_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If article is being set to published, ensure published_at is set
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  
  -- If article is being set to draft or archived, clear published_at
  IF NEW.status IN ('draft', 'archived') THEN
    NEW.published_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;