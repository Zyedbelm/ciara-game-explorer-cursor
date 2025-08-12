-- Script SQL pour configurer l'authentification Google OAuth
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- 1. Activer l'authentification Google
INSERT INTO auth.config (
  instance_id,
  key,
  value,
  is_secret
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'external_google_enabled',
  'true',
  false
) ON CONFLICT (instance_id, key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- 2. Configurer l'URL de redirection pour Google OAuth
INSERT INTO auth.config (
  instance_id,
  key,
  value,
  is_secret
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'external_google_redirect_uri',
  'https://pohqkspsdvvbqrgzfayl.supabase.co/auth/v1/callback',
  false
) ON CONFLICT (instance_id, key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- 3. Activer la création automatique de profils pour les utilisateurs OAuth
INSERT INTO auth.config (
  instance_id,
  key,
  value,
  is_secret
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'external_google_auto_confirm',
  'true',
  false
) ON CONFLICT (instance_id, key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- 4. Configurer les scopes Google OAuth
INSERT INTO auth.config (
  instance_id,
  key,
  value,
  is_secret
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'external_google_scopes',
  'openid,email,profile',
  false
) ON CONFLICT (instance_id, key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- 5. Vérifier la configuration
SELECT 
  key,
  value,
  is_secret
FROM auth.config 
WHERE key LIKE 'external_google%'
ORDER BY key;

-- Message de confirmation
SELECT 'Google OAuth configuration completed successfully!' as status;
