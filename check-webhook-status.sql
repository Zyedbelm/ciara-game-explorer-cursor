-- Script pour vérifier l'état actuel des webhooks et fonctions
-- Diagnostic complet de la situation

-- 1. Vérifier les triggers existants sur auth.users
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  event_object_schema,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth'
ORDER BY trigger_name;

-- 2. Vérifier les fonctions webhook existantes
SELECT 
  routine_name,
  routine_type,
  routine_schema,
  routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%webhook%' 
  OR routine_name LIKE '%auth%'
ORDER BY routine_name;

-- 3. Vérifier les permissions sur auth.users
SELECT 
  table_name,
  table_schema,
  table_type
FROM information_schema.tables 
WHERE table_name = 'users' 
  AND table_schema = 'auth';

-- 4. Vérifier l'extension net.http
SELECT 
  extname,
  extversion
FROM pg_extension 
WHERE extname = 'net';

-- 5. Message de diagnostic
DO $$
BEGIN
  RAISE NOTICE '=== DIAGNOSTIC WEBHOOK COMPLET ===';
  RAISE NOTICE 'Vérifiez les résultats ci-dessus pour identifier :';
  RAISE NOTICE '• Triggers existants sur auth.users';
  RAISE NOTICE '• Fonctions webhook disponibles';
  RAISE NOTICE '• Permissions sur la table auth.users';
  RAISE NOTICE '• Extension net.http installée';
END $$;
