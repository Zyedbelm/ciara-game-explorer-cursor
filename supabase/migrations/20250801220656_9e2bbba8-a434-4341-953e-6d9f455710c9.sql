-- Remove the existing trigger that sends welcome email on user creation
DROP TRIGGER IF EXISTS send_welcome_email_trigger ON auth.users;

-- Modify the function to be called manually instead of automatically
CREATE OR REPLACE FUNCTION public.send_ciara_welcome_email_confirmed(user_email text, user_name text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  final_user_name text;
  response_data jsonb;
BEGIN
  -- Use provided name or extract from email
  final_user_name := COALESCE(user_name, split_part(user_email, '@', 1));
  
  -- Call the send-welcome-ciara edge function
  SELECT net.http_post(
    url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/send-welcome-ciara',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'userName', final_user_name,
      'email', user_email,
      'loginUrl', 'https://ciara.city/'
    )
  ) INTO response_data;
  
  RETURN jsonb_build_object(
    'success', true,
    'email', user_email,
    'response', response_data
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;