-- Créer une fonction pour envoyer manuellement un email de confirmation
CREATE OR REPLACE FUNCTION public.send_email_confirmation_manual(
  p_email text,
  p_redirect_url text DEFAULT 'https://ciara.city'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  confirmation_result jsonb;
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with this email'
    );
  END IF;
  
  -- Appeler la fonction d'edge pour envoyer l'email de confirmation
  SELECT net.http_post(
    url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/send-email-confirmation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'email', p_email,
      'confirmationUrl', p_redirect_url || '/auth?confirmed=true',
      'name', (SELECT COALESCE(full_name, split_part(email, '@', 1)) FROM public.profiles WHERE email = p_email)
    )
  ) INTO confirmation_result;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Email confirmation sent',
    'response', confirmation_result
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;