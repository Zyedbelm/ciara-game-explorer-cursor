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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    // Get authorization header (optional - allow anonymous access)
    const authHeader = req.headers.get('Authorization');

    // Create supabase client; include Authorization header if present for RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
    });

    // Optional admin client for safe public reads (cities/journeys/partners lists)
    const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

    // Try to resolve user if token provided; otherwise proceed as anonymous (no persistence)
    let user: any = null;
    if (authHeader) {
      const userToken = authHeader.replace('Bearer ', '');
      const { data, error: authError } = await supabase.auth.getUser(userToken);
      if (!authError) {
        user = data?.user || null;
      }
    }

    const { message, sessionKey, context, language = 'fr', messageType = 'text', audioUrl }: ChatRequest = await req.json();

    // Create session and persist only for authenticated users
    let sessionId: string | null = null;
    let chatHistory: any[] | null = null;
    if (user) {
      const { data: sessionData } = await supabase.rpc('get_or_create_chat_session', {
        p_session_key: sessionKey,
        p_context: context || {}
      });
      sessionId = sessionData || null;

      if (sessionId) {
        // Store user message
        await supabase
          .from('chat_messages')
          .insert({
            session_id: sessionId,
            role: 'user',
            content: message,
            message_type: messageType,
            audio_url: audioUrl,
            language
          });

        // Get recent chat history
        const { data: history } = await supabase
          .from('chat_messages')
          .select('role, content, message_type, language')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(20);
        chatHistory = history || null;
      }
    }

    // Intelligent intent detection and dynamic data fetching
    const detectedIntent = await detectUserIntent(message, language);
    const dynamicData = await fetchDynamicData(supabaseAdmin || supabase, detectedIntent, context);

    // Enrich context with minimal baseline data + dynamic data
    const enrichedContext = await enrichContextFromDb(supabaseAdmin || supabase, context, dynamicData);

    // Build system prompt
    const baseSystemPrompt = await getSystemPrompt(supabase, language);
    const contextualPrompt = buildContextualPrompt(baseSystemPrompt, enrichedContext, language);

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: contextualPrompt }
    ];

    // Add chat history
    if (chatHistory && Array.isArray(chatHistory)) {
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

    // Store assistant message only if session exists
    if (sessionId) {
      await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role: 'assistant',
          content: assistantMessage,
          message_type: 'text',
          language
        });
    }

    // Generate suggestions based on context
    const suggestions = generateSuggestions(enrichedContext, language);

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
  
  // 🎯 DYNAMIC DATA INTEGRATION - Only add relevant data based on user query
  
  // Cities data (only when relevant)
  if (context?.availableCities && Array.isArray(context.availableCities) && context.availableCities.length > 0) {
    const citiesHeader = language === 'fr'
      ? `\n\n🏙️ VILLES DISPONIBLES SUR CIARA :`
      : language === 'en'
      ? `\n\n🏙️ AVAILABLE CITIES ON CIARA:`
      : `\n\n🏙️ VERFÜGBARE STÄDTE AUF CIARA:`;
    const citiesList = context.availableCities.map((c: any) => 
      c.description ? `- ${c.name} (${c.country}): ${c.description}` : `- ${c.name} (${c.country})`
    ).join('\n');
    prompt += `${citiesHeader}\n${citiesList}`;
  }

  // Journeys data (with rich details)
  if (context?.cityJourneys && Array.isArray(context.cityJourneys) && context.cityJourneys.length > 0) {
    const cityName = context.targetCity?.name || 'la ville courante';
    const header = language === 'fr'
      ? `\n\n🚶 PARCOURS DISPONIBLES À ${cityName.toUpperCase()} :`
      : language === 'en'
      ? `\n\n🚶 AVAILABLE JOURNEYS IN ${cityName.toUpperCase()}:`
      : `\n\n🚶 VERFÜGBARE REISEN IN ${cityName.toUpperCase()}:`;
    const list = context.cityJourneys.map((j: any) => {
      const details = [];
      if (j.difficulty) details.push(`Difficulté: ${j.difficulty}`);
      if (j.estimated_duration) details.push(`Durée: ${j.estimated_duration}min`);
      if (j.category?.name) details.push(`Catégorie: ${j.category.name}`);
      return `- ${j.name}${details.length > 0 ? ` (${details.join(', ')})` : ''}${j.description ? `\n  ${j.description}` : ''}`;
    }).join('\n');
    prompt += `${header}\n${list}`;
  }

  // Partners data (with contact info)
  if (context?.cityPartners && Array.isArray(context.cityPartners) && context.cityPartners.length > 0) {
    const cityName = context.targetCity?.name || 'la ville courante';
    const header = language === 'fr'
      ? `\n\n🏪 PARTENAIRES LOCAUX À ${cityName.toUpperCase()} :`
      : language === 'en'
      ? `\n\n🏪 LOCAL PARTNERS IN ${cityName.toUpperCase()}:`
      : `\n\n🏪 LOKALE PARTNER IN ${cityName.toUpperCase()}:`;
    const list = context.cityPartners.map((p: any) => {
      const details = [];
      if (p.category) details.push(p.category);
      if (p.address) details.push(p.address);
      if (p.phone) details.push(p.phone);
      return `- ${p.name}${details.length > 0 ? ` (${details.join(', ')})` : ''}${p.description ? `\n  ${p.description}` : ''}`;
    }).join('\n');
    prompt += `${header}\n${list}`;
  }

  // Articles/Blog data
  if (context?.articles && Array.isArray(context.articles) && context.articles.length > 0) {
    const header = language === 'fr'
      ? `\n\n📚 ARTICLES ET ACTUALITÉS RÉCENTS :`
      : language === 'en'
      ? `\n\n📚 RECENT ARTICLES AND NEWS:`
      : `\n\n📚 AKTUELLE ARTIKEL UND NACHRICHTEN:`;
    const list = context.articles.map((a: any) => 
      `- ${a.title}${a.city?.name ? ` (${a.city.name})` : ''}${a.excerpt ? `\n  ${a.excerpt}` : ''}`
    ).join('\n');
    prompt += `${header}\n${list}`;
  }

  // Points of interest data
  if (context?.citySteps && Array.isArray(context.citySteps) && context.citySteps.length > 0) {
    const cityName = context.targetCity?.name || 'la ville courante';
    const header = language === 'fr'
      ? `\n\n🧭 POINTS D'INTÉRÊT À ${cityName.toUpperCase()} :`
      : language === 'en'
      ? `\n\n🧭 POINTS OF INTEREST IN ${cityName.toUpperCase()}:`
      : `\n\n🧭 SEHENSWÜRDIGKEITEN IN ${cityName.toUpperCase()}:`;
    const list = context.citySteps.map((s: any) => {
      const details = [];
      if (s.type) details.push(s.type);
      if (s.address) details.push(s.address);
      if (s.points_awarded) details.push(`${s.points_awarded} points`);
      return `- ${s.name}${details.length > 0 ? ` (${details.join(', ')})` : ''}${s.description ? `\n  ${s.description}` : ''}`;
    }).join('\n');
    prompt += `${header}\n${list}`;
  }

  // Quiz data
  if (context?.stepQuiz && Array.isArray(context.stepQuiz) && context.stepQuiz.length > 0) {
    const header = language === 'fr'
      ? `\n\n❓ QUIZ DISPONIBLE POUR CETTE ÉTAPE :`
      : language === 'en'
      ? `\n\n❓ AVAILABLE QUIZ FOR THIS STEP:`
      : `\n\n❓ VERFÜGBARES QUIZ FÜR DIESEN SCHRITT:`;
    const list = context.stepQuiz.map((q: any) => 
      `- ${q.question} (${q.points_awarded} points)`
    ).join('\n');
    prompt += `${header}\n${list}`;
  }

  // Smart instruction: use ONLY the provided data, request more if needed
  const guardInstruction = language === 'fr'
    ? `\n\n🔒 RÈGLES IMPORTANTES :
1. Utilise UNIQUEMENT les données listées ci-dessus pour répondre aux questions spécifiques
2. Si des informations ne sont pas disponibles, dis-le clairement et propose d'aider autrement
3. N'invente JAMAIS de villes, parcours ou partenaires non listés
4. Si l'utilisateur demande plus de détails, encourage-le à poser des questions plus spécifiques`
    : language === 'en'
    ? `\n\n🔒 IMPORTANT RULES:
1. Use ONLY the data listed above to answer specific questions
2. If information is not available, say it clearly and offer to help differently  
3. NEVER invent cities, journeys or partners not listed
4. If user asks for more details, encourage them to ask more specific questions`
    : `\n\n🔒 WICHTIGE REGELN:
1. Verwenden Sie NUR die oben aufgeführten Daten für spezifische Antworten
2. Wenn Informationen nicht verfügbar sind, sagen Sie es klar und bieten andere Hilfe an
3. Erfinden Sie NIEMALS nicht aufgeführte Städte, Reisen oder Partner
4. Wenn Benutzer mehr Details wünschen, ermutigen Sie sie zu spezifischeren Fragen`;
  prompt += guardInstruction;

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
  const suggestions: string[] = [];
  
  // Dynamic suggestions based on available data
  const hasArticles = context?.articles && context.articles.length > 0;
  const hasCityJourneys = context?.cityJourneys && context.cityJourneys.length > 0;
  const hasCityPartners = context?.cityPartners && context.cityPartners.length > 0;
  const hasCitySteps = context?.citySteps && context.citySteps.length > 0;
  const hasStepQuiz = context?.stepQuiz && context.stepQuiz.length > 0;
  const targetCityName = context?.targetCity?.name;
  
  if (language === 'fr') {
    if (context?.currentStep) {
      suggestions.push("Explique-moi l'importance de ce lieu");
      if (hasStepQuiz) suggestions.push("Montre-moi le quiz de cette étape");
      suggestions.push("Quels détails architecturaux observer ?");
      suggestions.push("Y a-t-il des anecdotes sur cet endroit ?");
    } else if (context?.currentJourney) {
      suggestions.push("Dis-moi en plus sur ce parcours");
      suggestions.push("Quelle est la prochaine étape ?");
      suggestions.push("Quels sont les points forts ?");
      if (hasCityPartners) suggestions.push("Quels partenaires puis-je visiter ?");
    } else {
      // Homepage suggestions based on available data
      if (!hasCityJourneys && !hasCityPartners && !hasCitySteps) {
        suggestions.push("Quelles villes sont disponibles sur CIARA ?");
        suggestions.push("Comment débuter mon premier parcours ?");
        suggestions.push("Comment gagner des points et récompenses ?");
        if (hasArticles) suggestions.push("Quels sont les derniers articles ?");
      } else {
        if (targetCityName) {
          if (hasCityJourneys) suggestions.push(`Quels parcours puis-je faire à ${targetCityName} ?`);
          if (hasCityPartners) suggestions.push(`Où manger à ${targetCityName} ?`);
          if (hasCitySteps) suggestions.push(`Que voir absolument à ${targetCityName} ?`);
          if (hasArticles) suggestions.push("Y a-t-il des articles sur cette ville ?");
        }
      }
    }
  } else if (language === 'en') {
    if (context?.currentStep) {
      suggestions.push("Explain the importance of this place");
      if (hasStepQuiz) suggestions.push("Show me the quiz for this step");
      suggestions.push("What architectural details should I observe?");
      suggestions.push("Are there any anecdotes about this place?");
    } else if (context?.currentJourney) {
      suggestions.push("Tell me more about this journey");
      suggestions.push("What's the next step?");
      suggestions.push("What are the highlights?");
      if (hasCityPartners) suggestions.push("Which partners can I visit?");
    } else {
      if (!hasCityJourneys && !hasCityPartners && !hasCitySteps) {
        suggestions.push("Which cities are available on CIARA?");
        suggestions.push("How do I start my first journey?");
        suggestions.push("How to earn points and rewards?");
        if (hasArticles) suggestions.push("What are the latest articles?");
      } else {
        if (targetCityName) {
          if (hasCityJourneys) suggestions.push(`What journeys can I do in ${targetCityName}?`);
          if (hasCityPartners) suggestions.push(`Where to eat in ${targetCityName}?`);
          if (hasCitySteps) suggestions.push(`What must I see in ${targetCityName}?`);
          if (hasArticles) suggestions.push("Are there articles about this city?");
        }
      }
    }
  } else {
    if (context?.currentStep) {
      suggestions.push("Erkläre die Bedeutung dieses Ortes");
      if (hasStepQuiz) suggestions.push("Zeige mir das Quiz für diesen Schritt");
      suggestions.push("Welche architektonischen Details beachten?");
      suggestions.push("Gibt es Anekdoten über diesen Ort?");
    } else if (context?.currentJourney) {
      suggestions.push("Erzähl mir mehr über diese Reise");
      suggestions.push("Was ist der nächste Schritt?");
      suggestions.push("Was sind die Höhepunkte?");
      if (hasCityPartners) suggestions.push("Welche Partner kann ich besuchen?");
    } else {
      if (!hasCityJourneys && !hasCityPartners && !hasCitySteps) {
        suggestions.push("Welche Städte sind auf CIARA verfügbar?");
        suggestions.push("Wie starte ich meine erste Reise?");
        suggestions.push("Wie verdiene ich Punkte und Belohnungen?");
        if (hasArticles) suggestions.push("Was sind die neuesten Artikel?");
      } else {
        if (targetCityName) {
          if (hasCityJourneys) suggestions.push(`Welche Reisen kann ich in ${targetCityName} machen?`);
          if (hasCityPartners) suggestions.push(`Wo essen in ${targetCityName}?`);
          if (hasCitySteps) suggestions.push(`Was muss ich in ${targetCityName} sehen?`);
          if (hasArticles) suggestions.push("Gibt es Artikel über diese Stadt?");
        }
      }
    }
  }

  return suggestions.slice(0, 4);
}

// Server-side enrichment: minimal baseline + dynamic data integration
async function enrichContextFromDb(supabase: any, context: any, dynamicData: any = {}): Promise<any> {
  const ctx = { ...(context || {}), ...dynamicData };

  try {
    // Only fetch minimal baseline data if no dynamic data was fetched
    if (!dynamicData || Object.keys(dynamicData).length === 0) {
      // Minimal fallback: only visible cities for homepage chat
      if (!ctx.availableCities && !ctx.currentJourney && !ctx.currentStep) {
        const { data: visibleCities } = await supabase
          .from('cities')
          .select('id, name, slug')
          .eq('is_active', true)
          .eq('is_visible_on_homepage', true)
          .order('name', { ascending: true })
          .limit(5); // Limit to reduce payload

        if (visibleCities && visibleCities.length > 0) {
          ctx.availableCities = visibleCities.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }));
        }
      }
    }

    // Add current step documents if in journey context (high priority)
    if (ctx.currentStep?.id && !ctx.stepDocuments) {
      const { data: stepDocs } = await supabase
        .from('content_documents')
        .select('title, content, document_type')
        .eq('step_id', ctx.currentStep.id)
        .eq('language', context?.currentLanguage || 'fr')
        .limit(3);
      
      if (stepDocs && stepDocs.length > 0) {
        ctx.stepDocuments = stepDocs;
      }
    }
  } catch (_e) {
    // ignore
  }

  return ctx;
}

// 🧠 INTELLIGENT INTENT DETECTION SYSTEM
async function detectUserIntent(message: string, language: string): Promise<any> {
  const lowerMessage = message.toLowerCase();
  const intent: any = { type: 'none', entities: [] };

  // 🏙️ CITY QUERIES
  const cityPatterns = {
    fr: ['quelles villes', 'villes disponibles', 'où aller', 'destinations'],
    en: ['which cities', 'available cities', 'where to go', 'destinations'],
    de: ['welche städte', 'verfügbare städte', 'wohin gehen', 'reiseziele']
  };
  
  // 🚶 JOURNEY QUERIES
  const journeyPatterns = {
    fr: ['quels parcours', 'itinéraires', 'que faire à', 'visiter à', 'parcours à', 'activités à'],
    en: ['which journeys', 'itineraries', 'what to do in', 'visit in', 'journeys in', 'activities in'],
    de: ['welche reisen', 'routen', 'was zu tun in', 'besuchen in', 'reisen in', 'aktivitäten in']
  };

  // 🏪 PARTNER QUERIES  
  const partnerPatterns = {
    fr: ['restaurants', 'où manger', 'partenaires', 'offres', 'réductions', 'boutiques', 'hôtels'],
    en: ['restaurants', 'where to eat', 'partners', 'offers', 'discounts', 'shops', 'hotels'],
    de: ['restaurants', 'wo essen', 'partner', 'angebote', 'rabatte', 'geschäfte', 'hotels']
  };

  // 📚 ARTICLE/BLOG QUERIES
  const articlePatterns = {
    fr: ['articles', 'blog', 'actualités', 'news', 'informations sur'],
    en: ['articles', 'blog', 'news', 'information about'],
    de: ['artikel', 'blog', 'nachrichten', 'informationen über']
  };

  // 🧭 STEP/POI QUERIES
  const stepPatterns = {
    fr: ['que voir', 'monuments', 'points d\'intérêt', 'attractions', 'lieux'],
    en: ['what to see', 'monuments', 'points of interest', 'attractions', 'places'],
    de: ['was zu sehen', 'denkmäler', 'sehenswürdigkeiten', 'attraktionen', 'orte']
  };

  // ❓ QUIZ QUERIES
  const quizPatterns = {
    fr: ['quiz', 'questions', 'test', 'jeu'],
    en: ['quiz', 'questions', 'test', 'game'],
    de: ['quiz', 'fragen', 'test', 'spiel']
  };

  const patterns = { 
    cities: cityPatterns[language as keyof typeof cityPatterns] || cityPatterns.fr,
    journeys: journeyPatterns[language as keyof typeof journeyPatterns] || journeyPatterns.fr,
    partners: partnerPatterns[language as keyof typeof partnerPatterns] || partnerPatterns.fr,
    articles: articlePatterns[language as keyof typeof articlePatterns] || articlePatterns.fr,
    steps: stepPatterns[language as keyof typeof stepPatterns] || stepPatterns.fr,
    quiz: quizPatterns[language as keyof typeof quizPatterns] || quizPatterns.fr
  };

  // Detect intent type
  for (const [type, keywords] of Object.entries(patterns)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      intent.type = type;
      break;
    }
  }

  // Extract city names (basic regex)
  const cityRegex = /(?:à|in|in der|dans|pour|for|für)\s+([A-Za-zÀ-ÿ\s-]+?)(?:\s|$|[.?!,])/gi;
  let match;
  while ((match = cityRegex.exec(message)) !== null) {
    const cityName = match[1].trim();
    if (cityName.length > 2 && cityName.length < 30) {
      intent.entities.push({ type: 'city', value: cityName });
    }
  }

  return intent;
}

// 📡 DYNAMIC DATA FETCHING SYSTEM
async function fetchDynamicData(supabase: any, intent: any, context: any): Promise<any> {
  const dynamicData: any = {};

  try {
    switch (intent.type) {
      case 'cities':
        // Fetch all active cities
        const { data: cities } = await supabase
          .from('cities')
          .select('id, name, slug, description, country')
          .eq('is_active', true)
          .order('name');
        dynamicData.availableCities = cities || [];
        break;

      case 'journeys':
        // If city mentioned, get journeys for that city
        const cityEntity = intent.entities.find((e: any) => e.type === 'city');
        if (cityEntity) {
          const { data: cityData } = await supabase
            .from('cities')
            .select('id, name')
            .ilike('name', `%${cityEntity.value}%`)
            .eq('is_active', true)
            .limit(1);
          
          if (cityData && cityData.length > 0) {
            const { data: journeys } = await supabase
              .from('journeys')
              .select('id, name, description, difficulty, estimated_duration, category:journey_categories(name)')
              .eq('city_id', cityData[0].id)
              .eq('is_active', true)
              .order('name');
            dynamicData.cityJourneys = journeys || [];
            dynamicData.targetCity = cityData[0];
          }
        } else {
          // General journey info from current context
          if (context?.cityName) {
            const { data: cityData } = await supabase
              .from('cities')
              .select('id, name')
              .ilike('name', `%${context.cityName}%`)
              .eq('is_active', true)
              .limit(1);
            
            if (cityData && cityData.length > 0) {
              const { data: journeys } = await supabase
                .from('journeys')
                .select('id, name, description, difficulty, estimated_duration, category:journey_categories(name)')
                .eq('city_id', cityData[0].id)
                .eq('is_active', true)
                .order('name');
              dynamicData.cityJourneys = journeys || [];
            }
          }
        }
        break;

      case 'partners':
        // Fetch partners for mentioned city or current context
        const partnerCityEntity = intent.entities.find((e: any) => e.type === 'city');
        const targetCityName = partnerCityEntity?.value || context?.cityName;
        
        if (targetCityName) {
          const { data: cityData } = await supabase
            .from('cities')
            .select('id, name')
            .ilike('name', `%${targetCityName}%`)
            .eq('is_active', true)
            .limit(1);
          
          if (cityData && cityData.length > 0) {
            const { data: partners } = await supabase
              .from('partners')
              .select('id, name, category, description, address, website, phone')
              .eq('city_id', cityData[0].id)
              .eq('is_active', true)
              .order('name');
            dynamicData.cityPartners = partners || [];
            dynamicData.targetCity = cityData[0];
          }
        }
        break;

      case 'articles':
        // Fetch recent articles/blogs
        const { data: articles } = await supabase
          .from('articles')
          .select('id, title, excerpt, status, city:cities(name)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);
        dynamicData.articles = articles || [];
        break;

      case 'steps':
        // Fetch points of interest for mentioned city
        const stepCityEntity = intent.entities.find((e: any) => e.type === 'city');
        const stepTargetCityName = stepCityEntity?.value || context?.cityName;
        
        if (stepTargetCityName) {
          const { data: cityData } = await supabase
            .from('cities')
            .select('id, name')
            .ilike('name', `%${stepTargetCityName}%`)
            .eq('is_active', true)
            .limit(1);
          
          if (cityData && cityData.length > 0) {
            const { data: steps } = await supabase
              .from('steps')
              .select('id, name, description, type, address, points_awarded')
              .eq('city_id', cityData[0].id)
              .eq('is_active', true)
              .order('name')
              .limit(20);
            dynamicData.citySteps = steps || [];
            dynamicData.targetCity = cityData[0];
          }
        }
        break;

      case 'quiz':
        // If in journey context, get quiz for current step
        if (context?.currentStep?.id) {
          const { data: quizQuestions } = await supabase
            .from('quiz_questions')
            .select('id, question, question_type, points_awarded')
            .eq('step_id', context.currentStep.id)
            .limit(5);
          dynamicData.stepQuiz = quizQuestions || [];
        }
        break;

      default:
        // No specific data needed
        break;
    }
  } catch (error) {
    console.error('Error fetching dynamic data:', error);
  }

  return dynamicData;
}