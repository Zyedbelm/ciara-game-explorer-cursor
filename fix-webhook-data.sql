-- Script pour corriger le webhook SÛR et s'assurer qu'il envoie les bonnes données
-- Le problème actuel : le webhook reçoit des données vides (undefined)

-- 1. Supprimer l'ancien webhook problématique
DROP TRIGGER IF EXISTS auth_new_users_safe ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_safe();

-- 2. Créer une fonction de webhook CORRIGÉE avec données complètes
CREATE OR REPLACE FUNCTION public.handle_new_user_corrected()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que c'est bien un INSERT (nouveau compte)
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- Vérifier que l'utilisateur a un ID et un email
  IF NEW.id IS NULL OR NEW.email IS NULL THEN
    RAISE LOG 'Webhook: Données utilisateur incomplètes, ignoré';
    RETURN NEW;
  END IF;
  
  -- Log de sécurité avec données complètes
  RAISE LOG 'Webhook: Traitement utilisateur % avec email %', NEW.id, NEW.email;
  
  -- Appeler la fonction Edge auth-webhook avec données COMPLÈTES
  BEGIN
    PERFORM net.http_post(
      url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',
      headers := '{"Content-Type": "application/json"}',
      body := json_build_object(
        'type', TG_OP,  -- 'INSERT'
        'record', row_to_json(NEW),  -- Données complètes de l'utilisateur
        'old_record', NULL  -- Pas d'ancien record pour INSERT
      )::text
    );
    
    RAISE LOG 'Webhook: Appel Edge Function réussi pour utilisateur % avec données: type=%s, record=%s', 
      NEW.id, TG_OP, row_to_json(NEW)::text;
    
  EXCEPTION WHEN OTHERS THEN
    -- Gestion d'erreur robuste - NE JAMAIS bloquer l'authentification
    RAISE LOG 'Webhook: Erreur lors de l''appel Edge Function pour utilisateur %: %', NEW.id, SQLERRM;
    -- Continuer sans erreur - l'utilisateur doit pouvoir se connecter
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger CORRIGÉ
CREATE TRIGGER auth_new_users_corrected
  AFTER INSERT ON auth.users  -- SEULEMENT INSERT
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_corrected();

-- 4. Vérifier que le trigger a été créé
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  event_object_schema
FROM information_schema.triggers 
WHERE trigger_name = 'auth_new_users_corrected';

-- 5. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Webhook CORRIGÉ créé avec succès';
  RAISE NOTICE '• Données complètes envoyées (type, record, old_record)';
  RAISE NOTICE '• Validation des données avant envoi';
  RAISE NOTICE '• Logs détaillés pour debugging';
  RAISE NOTICE '• Gestion d''erreur robuste';
END $$;
