-- Configuration du webhook d'authentification pour utiliser Resend
-- Cette commande configure Supabase pour utiliser notre fonction edge auth-webhook
-- au lieu du serveur SMTP par défaut

-- Mise à jour des paramètres d'authentification
UPDATE auth.config 
SET 
  external_email_enabled = true,
  external_phone_enabled = false
WHERE 
  instance_id = '00000000-0000-0000-0000-000000000000';

-- Configuration du webhook pour l'email
INSERT INTO auth.config (
  instance_id,
  key,
  value,
  is_secret
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'webhook_url',
  'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',
  false
) ON CONFLICT (instance_id, key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Configuration du secret du webhook
INSERT INTO auth.config (
  instance_id,
  key,
  value,
  is_secret
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'webhook_secret',
  current_setting('app.settings.auth_webhook_secret', true),
  true
) ON CONFLICT (instance_id, key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Désactiver le SMTP par défaut pour forcer l'utilisation du webhook
UPDATE auth.config 
SET value = 'false'
WHERE key = 'smtp_admin_email' 
  AND instance_id = '00000000-0000-0000-0000-000000000000';

-- Activer les emails via webhook
INSERT INTO auth.config (
  instance_id,
  key,
  value,
  is_secret
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'enable_signup',
  'true',
  false
) ON CONFLICT (instance_id, key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();