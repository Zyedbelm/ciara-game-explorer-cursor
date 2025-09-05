-- 🔧 CORRECTION WEBHOOK AUTHENTICATION
-- Ce script supprime l'ancien trigger défaillant et nettoie la configuration

-- 1. Supprimer le trigger défaillant
DROP TRIGGER IF EXISTS auth_users_webhook ON auth.users;

-- 2. Supprimer la fonction défaillante
DROP FUNCTION IF EXISTS public.handle_auth_user_webhook();

-- 3. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Ancien trigger SQL supprimé - Le webhook sera maintenant géré via le Dashboard Supabase';
  RAISE NOTICE '📋 Prochaine étape: Configurer le webhook dans Authentication > Webhooks';
  RAISE NOTICE '🔗 URL: https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook';
END $$;