-- Script pour créer le webhook auth-webhook manquant
-- Ce webhook sera déclenché automatiquement lors de la création d'utilisateurs

-- 1. Créer la fonction de webhook si elle n'existe pas
CREATE OR REPLACE FUNCTION public.handle_auth_user_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler la fonction Edge auth-webhook
  PERFORM net.http_post(
    url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
    body := json_build_object(
      'type', TG_OP,
      'record', row_to_json(NEW),
      'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger pour la table auth.users
DROP TRIGGER IF EXISTS auth_users_webhook ON auth.users;
CREATE TRIGGER auth_users_webhook
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_webhook();

-- 3. Vérifier que le trigger a été créé
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'auth_users_webhook';

-- 4. Vérifier que la fonction Edge auth-webhook est accessible
-- (Cette vérification se fait via l'API Supabase)
