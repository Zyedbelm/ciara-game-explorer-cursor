-- Script simplifié pour créer le webhook d'authentification
-- Version robuste et simple

-- 1. Nettoyer l'existant
DROP TRIGGER IF EXISTS auth_new_users_corrected ON auth.users;
DROP TRIGGER IF EXISTS auth_new_users_safe ON auth.users;
DROP TRIGGER IF EXISTS auth_users_webhook ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_corrected();
DROP FUNCTION IF EXISTS public.handle_new_user_safe();
DROP FUNCTION IF EXISTS public.handle_auth_user_webhook();

-- 2. Créer une fonction webhook SIMPLE et ROBUSTE
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS TRIGGER AS $$
DECLARE
  user_data JSONB;
BEGIN
  -- Vérifier que c'est un INSERT (nouveau compte)
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- Vérifier les données utilisateur
  IF NEW.id IS NULL THEN
    RAISE LOG 'Webhook: ID utilisateur manquant, ignoré';
    RETURN NEW;
  END IF;
  
  IF NEW.email IS NULL THEN
    RAISE LOG 'Webhook: Email utilisateur manquant, ignoré';
    RETURN NEW;
  END IF;
  
  -- Construire les données utilisateur
  user_data := jsonb_build_object(
    'id', NEW.id,
    'email', NEW.email,
    'created_at', NEW.created_at,
    'email_confirmed_at', NEW.email_confirmed_at
  );
  
  -- Log de sécurité
  RAISE LOG 'Webhook: Traitement utilisateur % avec email %', NEW.id, NEW.email;
  
  -- Appeler la fonction Edge auth-webhook
  BEGIN
    PERFORM net.http_post(
      url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',
      headers := '{"Content-Type": "application/json"}',
      body := jsonb_build_object(
        'type', 'INSERT',
        'record', user_data,
        'old_record', NULL
      )::text
    );
    
    RAISE LOG 'Webhook: Appel Edge Function réussi pour utilisateur %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Gestion d'erreur robuste - NE JAMAIS bloquer l'authentification
    RAISE LOG 'Webhook: Erreur lors de l''appel Edge Function pour utilisateur %: %', NEW.id, SQLERRM;
    -- Continuer sans erreur
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger SIMPLE
CREATE TRIGGER auth_new_users_simple
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_simple();

-- 4. Vérifier la création
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  event_object_schema
FROM information_schema.triggers 
WHERE trigger_name = 'auth_new_users_simple';

-- 5. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Webhook SIMPLE créé avec succès !';
  RAISE NOTICE '• Fonction: handle_new_user_simple()';
  RAISE NOTICE '• Trigger: auth_new_users_simple';
  RAISE NOTICE '• Événement: INSERT uniquement sur auth.users';
  RAISE NOTICE '• Gestion d''erreur: Robuste et sûre';
END $$;
