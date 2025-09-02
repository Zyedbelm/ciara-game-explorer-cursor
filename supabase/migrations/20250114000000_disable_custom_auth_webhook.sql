-- Désactivation du webhook d'authentification personnalisé
-- Retour aux templates natifs Supabase pour Magic Link et Reset Password

-- Désactiver l'email externe (notre webhook personnalisé)
UPDATE auth.config 
SET value = 'false'
WHERE key = 'external_email_enabled' 
  AND instance_id = '00000000-0000-0000-0000-000000000000';

-- Supprimer l'URL du webhook personnalisé
DELETE FROM auth.config 
WHERE key = 'webhook_url' 
  AND instance_id = '00000000-0000-0000-0000-000000000000';

-- Supprimer le secret du webhook
DELETE FROM auth.config 
WHERE key = 'webhook_secret' 
  AND instance_id = '00000000-0000-0000-0000-000000000000';

-- Réactiver l'email SMTP natif Supabase
UPDATE auth.config 
SET value = 'true'
WHERE key = 'smtp_admin_email' 
  AND instance_id = '00000000-0000-0000-0000-000000000000';

-- S'assurer que les confirmations d'email sont activées
UPDATE auth.config 
SET value = 'true'
WHERE key = 'enable_confirmations' 
  AND instance_id = '00000000-0000-0000-0000-000000000000';

-- S'assurer que les inscriptions sont activées
UPDATE auth.config 
SET value = 'true'
WHERE key = 'enable_signup' 
  AND instance_id = '00000000-0000-0000-0000-000000000000';

-- Ajouter un commentaire pour documenter le changement
COMMENT ON TABLE auth.config IS 'Configuration simplifiée - Utilisation des templates natifs Supabase au lieu du webhook personnalisé';
