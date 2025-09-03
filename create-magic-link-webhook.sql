-- 🪄 WEBHOOK MAGIC LINK - Connexion sans mot de passe
-- Ce webhook se déclenche quand un utilisateur demande un magic link

-- Supprimer le webhook existant s'il existe
DROP TRIGGER IF EXISTS magic_link_webhook ON auth.users;

-- Supprimer la fonction existante s'il existe
DROP FUNCTION IF EXISTS handle_magic_link_request();

-- Créer la fonction pour gérer la demande de magic link
CREATE OR REPLACE FUNCTION handle_magic_link_request()
RETURNS TRIGGER AS $$
DECLARE
  magic_link_url TEXT;
  user_email TEXT;
  user_name TEXT;
  response_status INTEGER;
  response_body TEXT;
BEGIN
  -- Vérifier que c'est une demande de magic link (connexion)
  -- Le trigger se déclenche sur UPDATE de last_sign_in_at pour les tentatives de connexion
  IF TG_OP = 'UPDATE' AND OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
    -- Récupérer les informations de l'utilisateur
    user_email := NEW.email;
    user_name := COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'full_name', user_email);
    
    -- Générer le magic link via l'API Supabase
    -- Note: Cette fonction ne peut pas générer directement le magic link
    -- Elle va appeler la fonction Edge send-magic-link
    
    -- Appeler la fonction Edge send-magic-link
    SELECT 
      status,
      content::text
    INTO 
      response_status,
      response_body
    FROM 
      net.http_post(
        url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/send-magic-link',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'email', user_email,
          'name', user_name,
          'magicLinkUrl', 'https://ciara.city/auth/magic-link' -- URL de destination
        )::text
      );
    
    -- Log du résultat
    IF response_status = 200 THEN
      RAISE LOG '✅ Magic link envoyé avec succès pour %', user_email;
    ELSE
      RAISE LOG '❌ Erreur envoi magic link pour %: Status %, Body %', user_email, response_status, response_body;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table auth.users
CREATE TRIGGER magic_link_webhook
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_magic_link_request();

-- Log de confirmation
RAISE LOG '🎯 Webhook Magic Link créé avec succès sur auth.users';
