-- Phase 3: Create welcome email trigger and function
-- Create function to send CIARA welcome email

CREATE OR REPLACE FUNCTION public.send_ciara_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_name text;
BEGIN
  -- Extract full name from metadata
  user_name := COALESCE(
    TRIM(CONCAT(
      COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
    )),
    split_part(NEW.email, '@', 1)
  );
  
  -- Call the send-welcome-ciara edge function
  PERFORM
    net.http_post(
      url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/send-welcome-ciara',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'userName', user_name,
        'email', NEW.email,
        'loginUrl', 'https://ciara.lovable.app/'
      )
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE LOG 'Error sending welcome email for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Add trigger to send welcome email after user creation
CREATE TRIGGER send_welcome_email_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_ciara_welcome_email();