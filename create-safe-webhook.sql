-- Script pour créer un webhook SÛR pour les nouveaux comptes
-- Ce webhook ne peut PAS bloquer l'authentification existante

-- 1. Créer une fonction de webhook SÛRE avec gestion d'erreur robuste
CREATE OR REPLACE FUNCTION public.handle_new_user_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que c'est bien un INSERT (nouveau compte)
  IF TG_OP != 'INSERT' THEN
    RETURN NEW; -- Ignorer les UPDATE, DELETE, etc.
  END IF;
  
  -- Vérifier que l'utilisateur a un ID
  IF NEW.id IS NULL THEN
    RAISE LOG 'Webhook: Utilisateur sans ID, ignoré';
    RETURN NEW;
  END IF;
  
  -- Log de sécurité
  RAISE LOG 'Webhook: Traitement utilisateur % avec email %', NEW.id, NEW.email;
  
  -- Appeler la fonction Edge auth-webhook de manière SÛRE
  BEGIN
    PERFORM net.http_post(
      url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',
      headers := '{"Content-Type": "application/json"}',
      body := json_build_object(
        'type', TG_OP,
        'record', row_to_json(NEW)
      )::text
    );
    
    RAISE LOG 'Webhook: Appel Edge Function réussi pour utilisateur %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Gestion d'erreur robuste - NE JAMAIS bloquer l'authentification
    RAISE LOG 'Webhook: Erreur lors de l''appel Edge Function pour utilisateur %: %', NEW.id, SQLERRM;
    -- Continuer sans erreur - l'utilisateur doit pouvoir se connecter
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger SÛR (seulement sur INSERT)
DROP TRIGGER IF EXISTS auth_new_users_safe ON auth.users;
CREATE TRIGGER auth_new_users_safe
  AFTER INSERT ON auth.users  -- SEULEMENT INSERT, pas UPDATE
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_safe();

-- 3. Vérifier que le trigger a été créé
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  event_object_schema
FROM information_schema.triggers 
WHERE trigger_name = 'auth_new_users_safe';

-- 4. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Webhook SÛR créé avec succès';
  RAISE NOTICE '• Seulement sur INSERT (nouveaux comptes)';
  RAISE NOTICE '• Gestion d''erreur robuste';
  RAISE NOTICE '• Ne peut PAS bloquer l''authentification existante';
  RAISE NOTICE '• L''authentification des comptes existants reste fonctionnelle';
END $$;
