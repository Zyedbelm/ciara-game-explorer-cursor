-- Script pour désactiver temporairement le webhook problématique
-- Ce webhook bloque l'authentification des comptes existants

-- 1. Désactiver le trigger problématique
DROP TRIGGER IF EXISTS auth_users_webhook ON auth.users;

-- 2. Vérifier que le trigger a été supprimé
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  event_object_schema
FROM information_schema.triggers 
WHERE trigger_name = 'auth_users_webhook';

-- 3. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Webhook auth_users_webhook désactivé temporairement';
  RAISE NOTICE 'L''authentification des comptes existants devrait maintenant fonctionner';
  RAISE NOTICE 'Le webhook sera recréé correctement après correction du problème';
END $$;
