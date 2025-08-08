// Backup de la version déployée localement avant redéploiement.
// Ce fichier n'est pas utilisé par l'application, il sert uniquement d'archive.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  messageType?: 'text' | 'audio';
  audioUrl?: string;
  language?: string;
}

interface ChatRequest {
  message: string;
  sessionKey: string;
  context?: any;
  language?: string;
  messageType?: 'text' | 'audio';
  audioUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_PUBLISHABLE_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set');
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) throw new Error('Supabase configuration missing');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization header required');

    const userToken = authHeader.replace('Bearer ', '');
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    if (authError || !user) throw new Error('Invalid authentication token');

    const { message, sessionKey, context, language = 'fr', messageType = 'text', audioUrl }: ChatRequest = await req.json();

    const { data: sessionData, error: sessionError } = await supabase.rpc('get_or_create_chat_session', {
      p_session_key: sessionKey,
      p_context: context || {}
    });
    if (sessionError) throw new Error('Failed to get chat session');
    const sessionId = sessionData;

    const { error: messageError } = await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: message,
      message_type: messageType,
      audio_url: audioUrl,
      language
    });
    if (messageError) throw new Error('Failed to store user message');

    const { data: chatHistory } = await supabase
      .from('chat_messages')
      .select('role, content, message_type, language')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    const baseSystemPrompt = await getSystemPrompt(supabase, language);
    const contextualPrompt = buildContextualPrompt(baseSystemPrompt, context, language);

    const messages = [{ role: 'system', content: contextualPrompt }];
    (chatHistory || []).forEach((msg: any) => messages.push({ role: msg.role, content: msg.content }));
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 500, temperature: 0.7, presence_penalty: 0.1, frequency_penalty: 0.1 }),
    });
    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    await supabase.from('chat_messages').insert({ session_id: sessionId, role: 'assistant', content: assistantMessage, message_type: 'text', language });

    const suggestions = generateSuggestions(context, language);
    return new Response(JSON.stringify({ response: assistantMessage, suggestions, sessionId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function getSystemPrompt(supabase: any, language: string): Promise<string> {
  try {
    const { data } = await supabase.rpc('get_ai_system_prompt', { lang: language });
    return data || getDefaultSystemPrompt(language);
  } catch {
    return getDefaultSystemPrompt(language);
  }
}

function getDefaultSystemPrompt(language: string): string {
  const prompts = {
    fr: 'Tu es CIARA...',
    en: 'You are CIARA...',
    de: 'Sie sind CIARA...'
  } as const;
  return prompts[language as keyof typeof prompts] || prompts.fr;
}

function buildContextualPrompt(basePrompt: string, context: any, language: string): string {
  return basePrompt + (context?.cityName ? `\nVille: ${context.cityName}` : '');
}

function generateSuggestions(_context: any, language: string): string[] {
  return language === 'en' ? [
    'Which cities are available on CIARA?',
    'How do I start my first journey?'
  ] : language === 'de' ? [
    'Welche Städte sind auf CIARA verfügbar?',
    'Wie starte ich meine erste Reise?'
  ] : [
    'Quelles villes sont disponibles sur CIARA ?',
    'Comment débuter mon premier parcours ?'
  ];
}


