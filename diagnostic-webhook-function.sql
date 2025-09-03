-- DIAGNOSTIC DE LA FONCTION WEBHOOK ACTUELLE
-- Voir le code exact de la fonction qui cause le problème localhost

SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user_trigger'
  OR routine_name = 'handle_new_user_corrected'
  OR routine_name = 'handle_auth_user_webhook'
  OR routine_name = 'handle_new_user_webhook_fixed'
ORDER BY routine_name;
