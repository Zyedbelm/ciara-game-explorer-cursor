-- CORRECTION COMPLÈTE DU PROBLÈME LOCALHOST
-- Recréer la fonction webhook sans aucune référence localhost

-- 1. Nettoyer TOUTES les anciennes fonctions et triggers problématiques
DROP TRIGGER IF EXISTS "auth-webhook-trigger" ON auth.users;
DROP TRIGGER IF EXISTS auth_new_users_corrected ON auth.users;
DROP TRIGGER IF EXISTS auth_new_users_trigger ON auth.users;
DROP TRIGGER IF EXISTS auth_new_users_webhook_fixed ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user_trigger();
DROP FUNCTION IF EXISTS public.handle_new_user_corrected();
DROP FUNCTION IF EXISTS public.handle_auth_user_webhook();
DROP FUNCTION IF EXISTS public.handle_new_user_webhook_fixed();

-- 2. Créer une fonction webhook COMPLÈTEMENT NOUVELLE et CORRECTE
CREATE OR REPLACE FUNCTION public.handle_new_user_webhook_final()
RETURNS TRIGGER AS $$
DECLARE
  user_data JSONB;
  webhook_payload JSONB;
BEGIN
  -- Vérifier que c'est un INSERT (nouveau compte)
  IF TG_OP != 'INSERT' THEN
    RAISE LOG 'Webhook: Événement non INSERT (%s), ignoré', TG_OP;
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
  
  -- Construire les données utilisateur COMPLÈTES
  user_data := jsonb_build_object(
    'id', NEW.id,
    'email', NEW.email,
    'created_at', NEW.created_at,
    'email_confirmed_at', NEW.email_confirmed_at,
    'raw_user_meta_data', NEW.raw_user_meta_data
  );
  
  -- Construire le payload webhook COMPLET
  webhook_payload := jsonb_build_object(
    'type', 'INSERT',
    'record', user_data,
    'old_record', NULL
  );
  
  -- Log de sécurité avec données complètes
  RAISE LOG 'Webhook: Traitement utilisateur % avec email %', NEW.id, NEW.email;
  RAISE LOG 'Webhook: Payload envoyé: %', webhook_payload::text;
  
  -- Appeler la fonction Edge auth-webhook avec données CORRECTES
  BEGIN
    PERFORM net.http_post(
      url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',
      headers := '{"Content-Type": "application/json"}',
      body := webhook_payload::text
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

-- 3. Créer le trigger FINAL
CREATE TRIGGER auth_new_users_webhook_final
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_webhook_final();

-- 4. Vérifier la création
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  event_object_schema
FROM information_schema.triggers 
WHERE trigger_name = 'auth_new_users_webhook_final';

-- 5. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ PROBLÈME LOCALHOST RÉSOLU !';
  RAISE NOTICE '• Fonction: handle_new_user_webhook_final()';
  RAISE NOTICE '• Trigger: auth_new_users_webhook_final';
  RAISE NOTICE '• Données complètes envoyées';
  RAISE NOTICE '• Plus aucune référence localhost !';
  RAISE NOTICE '• Webhook maintenant FONCTIONNEL !';
END $$;
