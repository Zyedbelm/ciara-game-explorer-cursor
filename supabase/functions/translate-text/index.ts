import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  text: string;
  targetLanguage: 'fr' | 'en' | 'de';
  sourceLanguage?: 'fr' | 'en' | 'de';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { text, targetLanguage, sourceLanguage }: TranslationRequest = await req.json();

    // If source and target are the same, return original text
    if (sourceLanguage === targetLanguage) {
      return new Response(JSON.stringify({ translatedText: text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const languageNames = {
      fr: 'French',
      en: 'English',
      de: 'German'
    };

    const targetLanguageName = languageNames[targetLanguage];
    const sourceLanguageName = sourceLanguage ? languageNames[sourceLanguage] : 'detected language';

    const systemPrompt = `You are a professional translator. Translate the following text from ${sourceLanguageName} to ${targetLanguageName}. 
    
    Rules:
    - Maintain the original tone and style
    - Keep formatting (emojis, punctuation, etc.)
    - Preserve any technical terms or proper nouns
    - Provide natural, contextually appropriate translations
    - If the text is already in the target language, return it as-is
    
    Only return the translated text, nothing else.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ translatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      translatedText: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});