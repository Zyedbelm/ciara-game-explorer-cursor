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

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    // Get authorization header first
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Create supabase client with user token for RLS
    const userToken = authHeader.replace('Bearer ', '');
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { message, sessionKey, context, language = 'fr', messageType = 'text', audioUrl }: ChatRequest = await req.json();


    // Get or create chat session
    const { data: sessionData, error: sessionError } = await supabase.rpc('get_or_create_chat_session', {
      p_session_key: sessionKey,
      p_context: context || {}
    });

    if (sessionError) {
      throw new Error('Failed to get chat session');
    }

    const sessionId = sessionData;

    // Store user message
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
        message_type: messageType,
        audio_url: audioUrl,
        language
      });

    if (messageError) {
      throw new Error('Failed to store user message');
    }

    // Get recent chat history
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, content, message_type, language')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    if (historyError) {
    }

    // Build system prompt
    const baseSystemPrompt = await getSystemPrompt(supabase, language);
    const contextualPrompt = buildContextualPrompt(baseSystemPrompt, context, language);

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: contextualPrompt }
    ];

    // Add chat history
    if (chatHistory) {
      chatHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current message if not already in history
    messages.push({
      role: 'user',
      content: message
    });


    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;


    // Store assistant message
    const { error: assistantMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: assistantMessage,
        message_type: 'text',
        language
      });

    if (assistantMessageError) {
    }

    // Generate suggestions based on context
    const suggestions = generateSuggestions(context, language);

    return new Response(JSON.stringify({
      response: assistantMessage,
      suggestions,
      sessionId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getSystemPrompt(supabase: any, language: string): Promise<string> {
  try {
    const { data } = await supabase.rpc('get_ai_system_prompt', { lang: language });
    return data || getDefaultSystemPrompt(language);
  } catch (error) {
    return getDefaultSystemPrompt(language);
  }
}

function getDefaultSystemPrompt(language: string): string {
  const prompts = {
    'fr': 'Tu es CIARA, le guide touristique et historique officiel de la plateforme CIARA. Tu es STRICTEMENT spécialisé dans le tourisme, l\'histoire et la culture des destinations. REFUSE POLIMENT les demandes hors tourisme et PRIORISE les informations des documents d\'étapes quand disponibles.',
    'en': 'You are CIARA, the official tourist and historical guide of the CIARA platform. You are STRICTLY specialized in tourism, history and culture of destinations. POLITELY REFUSE non-tourism requests and PRIORITIZE information from step documents when available.',
    'de': 'Sie sind CIARA, der offizielle Tourismus- und Geschichtsführer der CIARA-Plattform. Sie sind STRIKT auf Tourismus, Geschichte und Kultur von Reisezielen spezialisiert. HÖFLICH ABLEHNEN von Nicht-Tourismus-Anfragen und PRIORISIEREN Sie Informationen aus Etappendokumenten.'
  };
  return prompts[language as keyof typeof prompts] || prompts['fr'];
}

function buildContextualPrompt(basePrompt: string, context: any, language: string): string {
  const isInJourney = !!(context?.journey || context?.step);
  
  // Use enhanced system prompt based on context
  const enhancedPrompt = getEnhancedSystemPrompt(language, isInJourney);
  let prompt = enhancedPrompt;
  
  if (context?.cityName) {
    const cityInfo = language === 'fr' 
      ? `\n\nVILLE ACTUELLE : ${context.cityName}`
      : language === 'en'
      ? `\n\nCURRENT CITY: ${context.cityName}`
      : `\n\nAKTUELLE STADT: ${context.cityName}`;
    prompt += cityInfo;
  }

  if (context?.currentJourney) {
    const journeyInfo = language === 'fr'
      ? `\n\nPARCOURS ACTUEL:\n- Nom : ${context.currentJourney.name}\n- Description : ${context.currentJourney.description}`
      : language === 'en'
      ? `\n\nCURRENT JOURNEY:\n- Name: ${context.currentJourney.name}\n- Description: ${context.currentJourney.description}`
      : `\n\nAKTUELLE REISE:\n- Name: ${context.currentJourney.name}\n- Beschreibung: ${context.currentJourney.description}`;
    prompt += journeyInfo;
  }

  if (context?.currentStep) {
    const stepInfo = language === 'fr'
      ? `\n\nÉTAPE ACTUELLE:\n- Nom : ${context.currentStep.name}\n- Description : ${context.currentStep.description}\n- Type : ${context.currentStep.type}`
      : language === 'en'
      ? `\n\nCURRENT STEP:\n- Name: ${context.currentStep.name}\n- Description: ${context.currentStep.description}\n- Type: ${context.currentStep.type}`
      : `\n\nAKTUELLE ETAPPE:\n- Name: ${context.currentStep.name}\n- Beschreibung: ${context.currentStep.description}\n- Typ: ${context.currentStep.type}`;
    prompt += stepInfo;
  }
  
  // Add step documents with absolute priority
  if (context?.stepDocuments && context.stepDocuments.length > 0) {
    const docHeader = language === 'fr'
      ? `\n\n🔥 DOCUMENTS PRIORITAIRES (À UTILISER EN PREMIER) :`
      : language === 'en'
      ? `\n\n🔥 PRIORITY DOCUMENTS (USE FIRST):`
      : `\n\n🔥 PRIORITÄTS-DOKUMENTE (ZUERST VERWENDEN):`;
    
    const docContent = context.stepDocuments.map((doc: any) => `- ${doc.title}: ${doc.content}`).join('\n\n');
    
    const docInstruction = language === 'fr'
      ? `\n\nINSTRUCTION CRITIQUE : Utilise PRIORITAIREMENT les informations des documents ci-dessus. Ces documents contiennent les informations officielles et validées pour cette étape.`
      : language === 'en'
      ? `\n\nCRITICAL INSTRUCTION: Use PRIMARILY the information from the documents above. These documents contain the official and validated information for this step.`
      : `\n\nKRITISCHE ANWEISUNG: Verwenden Sie VORRANGIG die Informationen aus den obigen Dokumenten. Diese Dokumente enthalten die offiziellen und validierten Informationen für diesen Schritt.`;
    
    prompt += docHeader + '\n' + docContent + docInstruction;
    
  } else {
  }

  return prompt;
}

function getEnhancedSystemPrompt(language: string, isInJourney: boolean): string {
  const prompts = {
    'fr': isInJourney ? 
      `Tu es CIARA, le guide touristique et historique expert accompagnant un visiteur EN PARCOURS sur la plateforme CIARA.

CONTEXTE SPÉCIALISÉ :
- Tu accompagnes activement un visiteur sur le terrain
- Tu as accès aux documents officiels des étapes (PRIORITÉ ABSOLUE)
- Tu guides l'exploration de lieux spécifiques
- Tu valides et enrichis l'expérience sur site

MISSION PRIORITAIRE :
🔥 UTILISE EN PREMIER les informations des DOCUMENTS D'ÉTAPES fournis
📍 Guide précisément sur les détails du lieu visité
🎯 Optimise l'expérience touristique en cours
📚 Enrichis avec tes connaissances historiques complémentaires

STYLE : Expert passionné, précis, informatif (max 200 mots)` :
      `Tu es CIARA, le guide touristique et assistant de la plateforme CIARA. Tu peux aider avec le tourisme ET les fonctionnalités de la plateforme.

DOMAINES D'EXPERTISE ÉTENDUS :
🏛️ TOURISME ET CULTURE : Histoire, monuments, culture locale
🎮 PLATEFORME CIARA : Points, récompenses, parcours, gamification

RÉPONSES AUTORISÉES :
✅ Questions sur les destinations et leur histoire
✅ Explication du fonctionnement de CIARA
✅ Système de points, niveaux et récompenses
✅ Comment commencer un parcours
✅ Conseils touristiques et culturels

STYLE : Accueillant, informatif, enthousiaste (max 150 mots)`,
    
    'en': isInJourney ?
      `You are CIARA, the expert tourist and historical guide accompanying a visitor ON A JOURNEY on the CIARA platform.

SPECIALIZED CONTEXT:
- You are actively accompanying a visitor in the field
- You have access to official step documents (ABSOLUTE PRIORITY)
- You guide the exploration of specific places
- You validate and enrich the on-site experience

PRIORITY MISSION:
🔥 USE FIRST the information from provided STEP DOCUMENTS
📍 Guide precisely on visited location details
🎯 Optimize the ongoing tourist experience
📚 Enrich with your complementary historical knowledge

STYLE: Passionate expert, precise, informative (max 200 words)` :
      `You are CIARA, the tourism guide and CIARA platform assistant. You can help with tourism AND platform features.

EXTENDED EXPERTISE DOMAINS:
🏛️ TOURISM AND CULTURE: History, monuments, local culture
🎮 CIARA PLATFORM: Points, rewards, journeys, gamification

AUTHORIZED RESPONSES:
✅ Questions about destinations and their history
✅ CIARA platform operation explanation
✅ Points, levels and rewards system
✅ How to start a journey
✅ Tourist and cultural advice

STYLE: Welcoming, informative, enthusiastic (max 150 words)`,
    
    'de': isInJourney ?
      `Sie sind CIARA, der Experte für Tourismus- und Geschichtsführung, der einen Besucher AUF EINER REISE auf der CIARA-Plattform begleitet.

SPEZIALISIERTER KONTEXT:
- Sie begleiten aktiv einen Besucher vor Ort
- Sie haben Zugang zu offiziellen Etappendokumenten (ABSOLUTE PRIORITÄT)
- Sie führen die Erkundung spezifischer Orte
- Sie validieren und bereichern das Vor-Ort-Erlebnis

PRIORITÄRE MISSION:
🔥 VERWENDEN Sie ZUERST die Informationen aus bereitgestellten ETAPPENDOKUMENTEN
📍 Führen Sie präzise über Details des besuchten Ortes
🎯 Optimieren Sie das laufende Tourismuserlebnis
📚 Bereichern Sie mit Ihrem ergänzenden historischen Wissen

STIL: Leidenschaftlicher Experte, präzise, informativ (max 200 Wörter)` :
      `Sie sind CIARA, der Tourismusführer und CIARA-Plattform-Assistent. Sie können mit Tourismus UND Plattformfunktionen helfen.

ERWEITERTE FACHBEREICHE:
🏛️ TOURISMUS UND KULTUR: Geschichte, Denkmäler, lokale Kultur
🎮 CIARA-PLATTFORM: Punkte, Belohnungen, Reisen, Gamification

AUTORISIERTE ANTWORTEN:
✅ Fragen zu Reisezielen und ihrer Geschichte
✅ Erklärung der CIARA-Plattform-Funktionsweise
✅ Punkte-, Level- und Belohnungssystem
✅ Wie man eine Reise startet
✅ Touristische und kulturelle Beratung

STIL: Einladend, informativ, begeistert (max 150 Wörter)`
  };
  
  return prompts[language as keyof typeof prompts] || prompts['fr'];
}

function generateSuggestions(context: any, language: string): string[] {
  const suggestions = [];
  
  if (language === 'fr') {
    if (context?.currentStep) {
      suggestions.push(
        "Explique-moi l'importance de ce lieu",
        "Quels détails architecturaux observer ?",
        "Y a-t-il des anecdotes sur cet endroit ?",
        "Aide-moi avec le quiz de cette étape"
      );
    } else if (context?.currentJourney) {
      suggestions.push(
        "Dis-moi en plus sur ce parcours",
        "Quelle est la prochaine étape ?",
        "Quels sont les points forts ?",
        "Conseils pour optimiser mes points"
      );
    } else {
      suggestions.push(
        "Quelles villes sont disponibles sur CIARA ?",
        "Comment gagner des points et récompenses ?",
        "Comment débuter mon premier parcours ?",
        "Expliquez-moi le système de gamification"
      );
    }
  } else if (language === 'en') {
    if (context?.currentStep) {
      suggestions.push(
        "Explain the importance of this place",
        "What architectural details should I observe?",
        "Are there any anecdotes about this place?",
        "Help me with the quiz for this step"
      );
    } else if (context?.currentJourney) {
      suggestions.push(
        "Tell me more about this journey",
        "What's the next step?",
        "What are the highlights?",
        "Tips to optimize my points"
      );
    } else {
      suggestions.push(
        "Which cities are available on CIARA?",
        "How to earn points and rewards?",
        "How do I start my first journey?",
        "Explain the gamification system"
      );
    }
  } else {
    if (context?.currentStep) {
      suggestions.push(
        "Erkläre die Bedeutung dieses Ortes",
        "Welche architektonischen Details beachten?",
        "Gibt es Anekdoten über diesen Ort?",
        "Hilf mir mit dem Quiz für diesen Schritt"
      );
    } else if (context?.currentJourney) {
      suggestions.push(
        "Erzähl mir mehr über diese Reise",
        "Was ist der nächste Schritt?",
        "Was sind die Höhepunkte?",
        "Tipps zur Optimierung meiner Punkte"
      );
    } else {
      suggestions.push(
        "Welche Städte sind auf CIARA verfügbar?",
        "Wie verdiene ich Punkte und Belohnungen?",
        "Wie starte ich meine erste Reise?",
        "Erklären Sie das Gamification-System"
      );
    }
  }

  return suggestions.slice(0, 4);
}