-- Migration pour créer le webhook auth-webhook manquant
-- Ce webhook sera déclenché automatiquement lors de la création d'utilisateurs

-- 1. Créer la fonction de webhook si elle n'existe pas
CREATE OR REPLACE FUNCTION public.handle_auth_user_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler la fonction Edge auth-webhook
  PERFORM net.http_post(
    url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',
    headers := '{"Content-Type": "application/json"}',
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
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'auth_users_webhook' 
    AND event_object_table = 'users' 
    AND event_object_schema = 'auth'
  ) THEN
    RAISE NOTICE 'Trigger auth_users_webhook créé avec succès sur auth.users';
  ELSE
    RAISE EXCEPTION 'Échec de la création du trigger auth_users_webhook';
  END IF;
END $$;
