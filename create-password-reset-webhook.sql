-- 🔑 WEBHOOK RESET PASSWORD - Réinitialisation de mot de passe
-- Ce webhook se déclenche quand un utilisateur demande une réinitialisation

-- Supprimer le webhook existant s'il existe
DROP TRIGGER IF EXISTS password_reset_webhook ON auth.users;

-- Supprimer la fonction existante s'il existe
DROP FUNCTION IF EXISTS handle_password_reset_request();

-- Créer la fonction pour gérer la demande de reset password
CREATE OR REPLACE FUNCTION handle_password_reset_request()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  reset_url TEXT;
  response_status INTEGER;
  response_body TEXT;
BEGIN
  -- Vérifier que c'est une demande de reset password
  -- Le trigger se déclenche sur UPDATE de updated_at pour les demandes de reset
  IF TG_OP = 'UPDATE' AND OLD.updated_at IS DISTINCT FROM NEW.updated_at THEN
    -- Récupérer les informations de l'utilisateur
    user_email := NEW.email;
    user_name := COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'full_name', user_email);
    
    -- Construire l'URL de reset (sera remplacée par le vrai lien Supabase)
    reset_url := 'https://ciara.city/auth/reset-password?token=[TOKEN]';
    
    -- Appeler la fonction Edge send-password-reset
    SELECT 
      status,
      content::text
    INTO 
      response_status,
      response_body
    FROM 
      net.http_post(
        url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/send-password-reset',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'email', user_email,
          'name', user_name,
          'resetUrl', reset_url
        )::text
      );
    
    -- Log du résultat
    IF response_status = 200 THEN
      RAISE LOG '✅ Email reset password envoyé avec succès pour %', user_email;
    ELSE
      RAISE LOG '❌ Erreur envoi reset password pour %: Status %, Body %', user_email, response_status, response_body;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table auth.users
CREATE TRIGGER password_reset_webhook
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_password_reset_request();

-- Log de confirmation
RAISE LOG '🎯 Webhook Reset Password créé avec succès sur auth.users';
