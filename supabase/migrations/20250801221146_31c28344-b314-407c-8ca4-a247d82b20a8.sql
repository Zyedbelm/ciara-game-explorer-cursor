-- Create webhook functions for email confirmation and password reset
-- These will be called by Supabase's built-in email templates

-- Function to send welcome email after email confirmation
CREATE OR REPLACE FUNCTION public.send_welcome_email_after_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_name text;
  user_email text;
BEGIN
  -- Only send welcome email when email is confirmed for the first time
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Get user details
    user_email := NEW.email;
    user_name := COALESCE(
      TRIM(CONCAT(
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
      )),
      split_part(NEW.email, '@', 1)
    );
    
    -- Call the welcome email function
    PERFORM public.send_ciara_welcome_email_confirmed(user_email, user_name);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to send welcome email after email confirmation
CREATE OR REPLACE TRIGGER send_welcome_after_confirmation_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_after_confirmation();

-- Function to handle custom auth emails via webhook
CREATE OR REPLACE FUNCTION public.handle_auth_email_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_email text;
  confirmation_url text;
  reset_url text;
  user_name text;
BEGIN
  user_email := NEW.email;
  user_name := COALESCE(
    TRIM(CONCAT(
      COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
    )),
    split_part(NEW.email, '@', 1)
  );

  -- For new user signup (email confirmation needed)
  IF TG_OP = 'INSERT' AND NEW.email_confirmed_at IS NULL THEN
    -- Build confirmation URL (this would be populated by Supabase webhook)
    confirmation_url := 'https://ciara.city/auth?confirmed=true';
    
    -- Call email confirmation function
    PERFORM net.http_post(
      url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/send-email-confirmation',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'email', user_email,
        'confirmationUrl', confirmation_url,
        'name', user_name
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth operation
    RAISE LOG 'Error in auth email webhook: %', SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$;