-- Create chat_sessions table for persistent chat sessions
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_key TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 day'),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create chat_messages table for storing audio and text messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'audio')),
  audio_url TEXT,
  audio_duration INTEGER, -- duration in seconds
  language TEXT DEFAULT 'fr',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on both tables
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_sessions
CREATE POLICY "Users can manage their own chat sessions"
ON public.chat_sessions
FOR ALL
USING (auth.uid() = user_id);

-- RLS policies for chat_messages
CREATE POLICY "Users can view messages from their sessions"
ON public.chat_messages
FOR SELECT
USING (
  session_id IN (
    SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages to their sessions"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  session_id IN (
    SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_session_key ON public.chat_sessions(session_key);
CREATE INDEX idx_chat_sessions_expires_at ON public.chat_sessions(expires_at);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Trigger to update updated_at on chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to cleanup expired chat sessions and old messages
CREATE OR REPLACE FUNCTION public.cleanup_chat_data()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_sessions INTEGER;
  deleted_messages INTEGER;
BEGIN
  -- Delete expired sessions (older than 1 day)
  DELETE FROM public.chat_sessions 
  WHERE expires_at < now() OR (created_at < now() - INTERVAL '1 day');
  
  GET DIAGNOSTICS deleted_sessions = ROW_COUNT;
  
  -- Delete old messages (older than 14 days)
  DELETE FROM public.chat_messages 
  WHERE created_at < now() - INTERVAL '14 days';
  
  GET DIAGNOSTICS deleted_messages = ROW_COUNT;
  
  RETURN 'Cleaned up ' || deleted_sessions || ' expired sessions and ' || deleted_messages || ' old messages';
END;
$$;

-- Function to get or create chat session
CREATE OR REPLACE FUNCTION public.get_or_create_chat_session(
  p_session_key TEXT,
  p_context JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  session_id_result UUID;
BEGIN
  -- Try to find existing active session
  SELECT id INTO session_id_result
  FROM public.chat_sessions
  WHERE user_id = auth.uid() 
    AND session_key = p_session_key 
    AND is_active = true 
    AND expires_at > now();
  
  -- If not found, create new session
  IF session_id_result IS NULL THEN
    INSERT INTO public.chat_sessions (user_id, session_key, context)
    VALUES (auth.uid(), p_session_key, p_context)
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
$$;