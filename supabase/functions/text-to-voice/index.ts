import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice, language } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }


    // Choose voice based on language if not specified
    let selectedVoice = voice || 'alloy';
    if (!voice && language) {
      // Map languages to appropriate voices
      const voiceMap: { [key: string]: string } = {
        'fr': 'shimmer',
        'en': 'alloy',
        'de': 'echo',
        'es': 'nova',
        'it': 'fable',
      };
      selectedVoice = voiceMap[language] || 'alloy';
    }


    // Generate speech from text
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: selectedVoice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate speech');
    }


    // Convert audio buffer to base64 in chunks to prevent stack overflow
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Process in smaller chunks to avoid stack overflow
    const chunkSize = 32768; // 32KB chunks
    let base64Audio = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      const chunkString = String.fromCharCode.apply(null, Array.from(chunk));
      base64Audio += btoa(chunkString);
    }

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        voice: selectedVoice 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});