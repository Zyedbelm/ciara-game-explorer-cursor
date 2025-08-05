-- Finalisation de la configuration du webhook Auth avec Resend
-- Vérification et mise à jour de la configuration pour s'assurer que tout fonctionne

-- S'assurer que la fonction auth-webhook est bien configurée
-- Mettre à jour la configuration auth pour utiliser notre webhook

-- Configuration pour rediriger les emails d'authentification vers notre edge function
UPDATE auth.config 
SET value = 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook'
WHERE key = 'webhook_url' 
  AND instance_id = '00000000-0000-0000-0000-000000000000';

-- Si la configuration n'existe pas, l'insérer
INSERT INTO auth.config (instance_id, key, value, is_secret)
SELECT '00000000-0000-0000-0000-000000000000', 'webhook_url', 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook', false
WHERE NOT EXISTS (
  SELECT 1 FROM auth.config 
  WHERE key = 'webhook_url' AND instance_id = '00000000-0000-0000-0000-000000000000'
);

-- Activer l'utilisation du webhook pour les emails
UPDATE auth.config 
SET value = 'true'
WHERE key = 'external_email_enabled' 
  AND instance_id = '00000000-0000-0000-0000-000000000000';

INSERT INTO auth.config (instance_id, key, value, is_secret)
SELECT '00000000-0000-0000-0000-000000000000', 'external_email_enabled', 'true', false
WHERE NOT EXISTS (
  SELECT 1 FROM auth.config 
  WHERE key = 'external_email_enabled' AND instance_id = '00000000-0000-0000-0000-000000000000'
);

-- Configuration pour s'assurer que les emails de confirmation sont envoyés
UPDATE auth.config 
SET value = 'true'
WHERE key = 'enable_confirmations' 
  AND instance_id = '00000000-0000-0000-0000-000000000000';

INSERT INTO auth.config (instance_id, key, value, is_secret)
SELECT '00000000-0000-0000-0000-000000000000', 'enable_confirmations', 'true', false
WHERE NOT EXISTS (
  SELECT 1 FROM auth.config 
  WHERE key = 'enable_confirmations' AND instance_id = '00000000-0000-0000-0000-000000000000'
);