-- Fix the get_or_create_chat_session function to properly handle user authentication
-- and prevent the null user_id constraint violation

CREATE OR REPLACE FUNCTION public.get_or_create_chat_session(p_session_key text, p_context jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  session_id_result UUID;
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create chat session'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  -- Try to find existing active session
  SELECT id INTO session_id_result
  FROM public.chat_sessions
  WHERE user_id = current_user_id 
    AND session_key = p_session_key 
    AND is_active = true 
    AND expires_at > now();
  
  -- If not found, create new session
  IF session_id_result IS NULL THEN
    INSERT INTO public.chat_sessions (user_id, session_key, context, expires_at, is_active)
    VALUES (
      current_user_id, 
      p_session_key, 
      p_context,
      now() + INTERVAL '1 day',
      true
    )
    RETURNING id INTO session_id_result;
  ELSE
    -- Update existing session expiry and context
    UPDATE public.chat_sessions 
    SET expires_at = now() + INTERVAL '1 day',
        updated_at = now(),
        context = p_context
    WHERE id = session_id_result;
  END IF;
  
  RETURN session_id_result;
END;
$function$;