-- 🧪 TEST DU WEBHOOK AUTH_PROFILE_CREATION
-- Exécutez ce script après avoir créé le webhook

-- 1. Vérifier l'état du webhook
SELECT 
  'État du webhook' as test,
  name,
  table_name,
  events,
  function_name,
  http_method,
  enabled,
  created_at
FROM supabase_functions.hooks 
WHERE name = 'auth_profile_creation';

-- 2. Vérifier que la fonction auth-webhook est accessible
-- Note: Cette vérification se fait via l'API, pas via SQL

-- 3. Vérifier la structure de la table profiles
SELECT 
  'Structure table profiles' as test,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Vérifier les permissions RLS sur la table profiles
SELECT 
  'Permissions RLS profiles' as test,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Vérifier que la fonction auth-webhook peut accéder aux tables
-- Note: Cette vérification nécessite des tests d'intégration

-- 6. Instructions de test manuel
-- Pour tester le webhook :
-- 1. Créez un nouvel utilisateur via l'interface d'inscription
-- 2. Vérifiez que le profil est créé automatiquement
-- 3. Vérifiez les logs dans Supabase Dashboard → Functions → auth-webhook
