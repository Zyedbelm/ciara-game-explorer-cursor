-- 🚀 CRÉATION DU WEBHOOK AUTH_PROFILE_CREATION
-- Exécutez ce script dans Supabase Dashboard → SQL Editor

-- 1. Vérifier que la fonction auth-webhook existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM supabase_functions.hooks 
      WHERE name = 'auth_profile_creation'
    ) THEN '✅ Hook auth_profile_creation existe déjà'
    ELSE '❌ Hook auth_profile_creation n''existe pas'
  END as hook_status;

-- 2. Créer le webhook si il n'existe pas
DO $$
BEGIN
  -- Vérifier si le webhook existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM supabase_functions.hooks 
    WHERE name = 'auth_profile_creation'
  ) THEN
    -- Insérer le nouveau webhook
    INSERT INTO supabase_functions.hooks (
      name,
      table_name,
      events,
      function_name,
      http_method,
      enabled,
      created_at,
      updated_at
    ) VALUES (
      'auth_profile_creation',
      'auth.users',
      ARRAY['INSERT'],
      'auth-webhook',
      'POST',
      true,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ Hook auth_profile_creation créé avec succès';
  ELSE
    RAISE NOTICE 'ℹ️ Hook auth_profile_creation existe déjà';
  END IF;
END $$;

-- 3. Vérifier la création
SELECT 
  name,
  table_name,
  events,
  function_name,
  http_method,
  enabled,
  created_at
FROM supabase_functions.hooks 
WHERE name = 'auth_profile_creation';

-- 4. Instructions pour les templates d'emails
-- Note: Les templates doivent être configurés manuellement dans le dashboard
-- Authentication → Email Templates
