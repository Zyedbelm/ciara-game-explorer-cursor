-- Migration pour activer l'authentification OAuth Google
-- Cette migration configure Supabase pour accepter les connexions via Google

-- Activer l'authentification OAuth Google
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

-- Configurer l'URL de redirection pour Google OAuth
INSERT INTO auth.config (
  instance_id,
  key,
  value,
  is_secret
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'external_google_client_id',
  current_setting('app.settings.google_client_id', true),
  false
) ON CONFLICT (instance_id, key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Configurer le secret client Google
INSERT INTO auth.config (
  instance_id,
  key,
  value,
  is_secret
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'external_google_secret',
  current_setting('app.settings.google_client_secret', true),
  true
) ON CONFLICT (instance_id, key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Configurer les URLs de redirection autorisées pour Google
INSERT INTO auth.config (
  instance_id,
  key,
  value,
  is_secret
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'external_google_redirect_uri',
  'https://ciara.city/auth/callback,http://localhost:8080/auth/callback',
  false
) ON CONFLICT (instance_id, key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Activer la création automatique de profils pour les utilisateurs OAuth
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

-- Configurer les scopes Google OAuth
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

-- Log de confirmation
DO $$
BEGIN
  RAISE LOG 'Google OAuth configuration completed successfully';
END $$;
