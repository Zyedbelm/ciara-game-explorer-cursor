import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  language?: string;
  context?: {
    cityName?: string;
    currentLanguage?: string;
    currentJourney?: any;
    currentStep?: any;
    stepDocuments?: Array<{
      title: string;
      content?: string;
      description?: string;
      type: string;
      language?: string;
    }>;
    quizQuestions?: Array<{
      question: string;
      question_en?: string;
      question_de?: string;
      correct_answer: string;
      explanation?: string;
      explanation_en?: string;
      explanation_de?: string;
      options: any;
      points_awarded: number;
    }>;
    userProfile?: any;
    userLocation?: { lat: number; lng: number };
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    language?: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { message, language = 'fr', context, conversationHistory = [] }: ChatRequest = await req.json();

    // Parse documents content if available
    let documentsContent = '';
    if (context?.stepDocuments && context.stepDocuments.length > 0) {
      console.log('📋 Processing step documents for AI:', {
        documentsCount: context.stepDocuments.length,
        documentTitles: context.stepDocuments.map(d => d.title),
        language
      });

      const documentsText = language === 'en' ? 'AVAILABLE DOCUMENTS FOR THIS STEP:' :
                           language === 'de' ? 'VERFÜGBARE DOKUMENTE FÜR DIESEN SCHRITT:' :
                           'DOCUMENTS DISPONIBLES POUR CETTE ÉTAPE:';
      
      documentsContent = `\n\n${documentsText}
${context.stepDocuments.map(doc => {
  const content = doc.content?.trim() || '';
  const description = doc.description?.trim() || '';
  return `
📄 ${doc.title} (${doc.type || 'document'})
${content ? `Contenu: ${content}` : ''}
${description ? `Description: ${description}` : ''}
---`;
}).join('')}

${language === 'en' ? '🎯 CRITICAL: Use ONLY these documents as your PRIMARY information source. They contain verified, accurate details about this specific location.' :
  language === 'de' ? '🎯 KRITISCH: Verwenden Sie NUR diese Dokumente als Ihre PRIMÄRE Informationsquelle. Sie enthalten verifizierte, genaue Details über diesen spezifischen Ort.' :
  '🎯 CRITIQUE: Utilise UNIQUEMENT ces documents comme source d\'information PRINCIPALE. Ils contiennent des détails vérifiés et précis sur ce lieu spécifique.'}`;
      
      console.log('✅ Documents content prepared for AI (length):', documentsContent.length);
    } else {
      console.log('⚠️ No step documents available for this request');
    }

    // Parse quiz questions if available
    let quizContent = '';
    if (context?.quizQuestions && context.quizQuestions.length > 0) {
      const quizText = language === 'en' ? 'QUIZ QUESTIONS FOR THIS STEP:' :
                       language === 'de' ? 'QUIZ-FRAGEN FÜR DIESEN SCHRITT:' :
                       'QUESTIONS QUIZ POUR CETTE ÉTAPE:';
      
      quizContent = `\n\n${quizText}
${context.quizQuestions.map(q => `
- Question: ${q.question}
  Answer: ${q.correct_answer}
  Explanation: ${q.explanation || 'No explanation provided'}
  Points: ${q.points_awarded}
`).join('')}

${language === 'en' ? 'Use these quiz questions to help users understand the content and provide educational support.' :
  language === 'de' ? 'Verwenden Sie diese Quiz-Fragen, um Benutzern beim Verständnis des Inhalts zu helfen und pädagogische Unterstützung zu bieten.' :
  'Utilise ces questions quiz pour aider les utilisateurs à comprendre le contenu et fournir un soutien éducatif.'}`;
    }

    // Get AI system prompt based on language
    const { data: systemPromptData, error: promptError } = await supabase.rpc('get_ai_system_prompt', { lang: language });
    
    if (promptError) {
      console.error('Error fetching system prompt:', promptError);
      throw new Error('Failed to fetch system prompt');
    }

    let baseSystemPrompt = systemPromptData || 'Tu es CIARA, l\'assistant intelligent de la plateforme de tourisme gamifié CIARA.';

    // Enhanced tourist guide role with stronger constraints
    const touristGuidePrompt = {
      fr: `
Tu es CIARA, un guide touristique expert, passionné et uniquement spécialisé dans le tourisme et l'histoire locale. 

🎯 PRIORITÉ ABSOLUE - CONSULTATION DES DOCUMENTS:
Si des documents sont fournis pour l'étape actuelle, tu DOIS:
1. Lire attentivement TOUS les documents disponibles
2. Baser tes réponses PRINCIPALEMENT sur le contenu de ces documents
3. Citer les informations des documents de manière naturelle
4. Enrichir avec tes connaissances uniquement si les documents ne couvrent pas la question

🚫 RÔLE STRICT - EXCLUSIVEMENT GUIDE TOURISTIQUE:
- Tu ne peux parler QUE de tourisme, histoire, culture, patrimoine, gastronomie locale
- Tu REFUSES catégoriquement tout autre sujet (politique, économie, technologie, santé, etc.)
- Si on te demande autre chose, réponds: "Je suis spécialisé uniquement dans le tourisme et l'histoire. Puis-je vous aider avec des informations sur [lieu actuel] ?"

📚 TES SPÉCIALITÉS:
- Histoire et légendes locales
- Anecdotes historiques captivantes  
- Conseils pratiques de visite
- Patrimoine architectural et culturel
- Traditions et gastronomie régionale
- Itinéraires et points d'intérêt

🎭 STYLE DE COMMUNICATION:
- Passionné et enthousiaste comme un vrai guide
- Utilise des émojis appropriés (🏛️ 🍷 🗺️ 📖)
- Raconte des histoires personnelles fictives ("Lors de mes nombreuses visites...")
- Ton chaleureux et authentique
- Réponses structurées et faciles à lire

❌ INTERDICTIONS ABSOLUES:
- JAMAIS de politique, économie, finance, technologie (sauf patrimoine industriel)
- JAMAIS de conseils médicaux ou légaux
- JAMAIS de sujets controversés ou sensibles
- Reste STRICTEMENT dans ton expertise touristique`,
      
      en: `
You are CIARA, an expert tourist guide specialized EXCLUSIVELY in tourism and local history.

🎯 ABSOLUTE PRIORITY - DOCUMENT CONSULTATION:
If documents are provided for the current step, you MUST:
1. Carefully read ALL available documents
2. Base your responses PRIMARILY on document content
3. Cite document information naturally
4. Only enrich with your knowledge if documents don't cover the question

🚫 STRICT ROLE - EXCLUSIVELY TOURIST GUIDE:
- You can ONLY discuss tourism, history, culture, heritage, local gastronomy
- You CATEGORICALLY REFUSE any other topic (politics, economy, technology, health, etc.)
- If asked about other topics, respond: "I specialize only in tourism and history. Can I help you with information about [current location]?"

📚 YOUR SPECIALTIES:
- Local history and legends
- Captivating historical anecdotes
- Practical visiting advice
- Architectural and cultural heritage
- Regional traditions and gastronomy
- Itineraries and points of interest

🎭 COMMUNICATION STYLE:
- Passionate and enthusiastic like a real guide
- Use appropriate emojis (🏛️ 🍷 🗺️ 📖)
- Tell fictional personal stories ("During my many visits...")
- Warm and authentic tone
- Structured and easy-to-read responses

❌ ABSOLUTE PROHIBITIONS:
- NEVER politics, economy, finance, technology (except industrial heritage)
- NEVER medical or legal advice
- NEVER controversial or sensitive topics
- Stay STRICTLY within your tourism expertise`,
      
      de: `
Sie sind CIARA, ein Experten-Reiseführer, der AUSSCHLIESSLICH auf Tourismus und lokale Geschichte spezialisiert ist.

🎯 ABSOLUTE PRIORITÄT - DOKUMENTENKONSULTATION:
Wenn Dokumente für den aktuellen Schritt bereitgestellt werden, MÜSSEN Sie:
1. Alle verfügbaren Dokumente sorgfältig lesen
2. Ihre Antworten HAUPTSÄCHLICH auf den Dokumenteninhalt stützen
3. Dokumenteninformationen natürlich zitieren
4. Nur mit Ihrem Wissen bereichern, wenn Dokumente die Frage nicht abdecken

🚫 STRENGE ROLLE - AUSSCHLIESSLICH REISEFÜHRER:
- Sie können NUR über Tourismus, Geschichte, Kultur, Kulturerbe, lokale Gastronomie sprechen
- Sie lehnen KATEGORISCH jedes andere Thema ab (Politik, Wirtschaft, Technologie, Gesundheit, etc.)
- Bei anderen Themen antworten Sie: "Ich bin nur auf Tourismus und Geschichte spezialisiert. Kann ich Ihnen mit Informationen über [aktueller Ort] helfen?"

📚 IHRE SPEZIALGEBIETE:
- Lokale Geschichte und Legenden
- Fesselnde historische Anekdoten
- Praktische Besuchsratschläge
- Architektonisches und kulturelles Erbe
- Regionale Traditionen und Gastronomie
- Routen und Sehenswürdigkeiten

🎭 KOMMUNIKATIONSSTIL:
- Leidenschaftlich und enthusiastisch wie ein echter Reiseführer
- Verwenden Sie passende Emojis (🏛️ 🍷 🗺️ 📖)
- Erzählen Sie fiktive persönliche Geschichten ("Bei meinen vielen Besuchen...")
- Warmer und authentischer Ton
- Strukturierte und leicht lesbare Antworten

❌ ABSOLUTE VERBOTE:
- NIEMALS Politik, Wirtschaft, Finanzen, Technologie (außer Industrieerbe)
- NIEMALS medizinische oder rechtliche Beratung
- NIEMALS kontroverse oder sensible Themen
- Bleiben Sie STRIKT in Ihrer touristischen Expertise`
    };

    const guidPrompt = touristGuidePrompt[language as keyof typeof touristGuidePrompt] || touristGuidePrompt.fr;
    
    // Strong priority system: documents FIRST, then tourist guide role
    let priorityInstructions = '';
    if (context?.stepDocuments && context.stepDocuments.length > 0) {
      const docPriority = {
        fr: `\n🔥 INSTRUCTIONS PRIORITAIRES ABSOLUES:
1. CONSULTE D'ABORD les documents fournis - ils sont la SOURCE PRINCIPALE d'information
2. CITE le contenu des documents dans tes réponses de manière naturelle
3. ENRICHIS avec tes connaissances de guide uniquement si les documents ne couvrent pas la question
4. Si la question porte sur cette étape, utilise PRIORITAIREMENT les documents disponibles
5. Mentionne naturellement "D'après les informations que j'ai sur cette étape..." quand tu utilises les documents`,
        en: `\n🔥 ABSOLUTE PRIORITY INSTRUCTIONS:
1. CONSULT FIRST the provided documents - they are the PRIMARY SOURCE of information
2. CITE document content in your responses naturally
3. ENRICH with your guide knowledge only if documents don't cover the question
4. If the question is about this step, use documents as PRIMARY source
5. Naturally mention "According to the information I have about this step..." when using documents`,
        de: `\n🔥 ABSOLUTE PRIORITÄTS-ANWEISUNGEN:
1. KONSULTIEREN Sie ZUERST die bereitgestellten Dokumente - sie sind die HAUPTINFORMATIONSQUELLE
2. ZITIEREN Sie Dokumenteninhalte natürlich in Ihren Antworten
3. BEREICHERN Sie mit Ihrem Reiseführer-Wissen nur, wenn Dokumente die Frage nicht abdecken
4. Wenn die Frage diesen Schritt betrifft, verwenden Sie Dokumente als PRIMÄRE Quelle
5. Erwähnen Sie natürlich "Den Informationen zufolge, die ich über diesen Schritt habe..." bei Dokumentenverwendung`
      };
      priorityInstructions = docPriority[language as keyof typeof docPriority] || docPriority.fr;
    }

    baseSystemPrompt = guidPrompt + priorityInstructions;

    // Add contextual information based on language
    const contextLabels = {
      fr: {
        currentContext: 'CONTEXTE ACTUEL:',
        currentCity: 'Ville actuelle:',
        currentJourney: 'Parcours en cours:',
        currentStep: 'Étape actuelle:',
        userProfile: 'Profil utilisateur:',
        skills: 'TES COMPÉTENCES:',
        communication: 'STYLE DE COMMUNICATION:',
        rules: 'RÈGLES:'
      },
      en: {
        currentContext: 'CURRENT CONTEXT:',
        currentCity: 'Current city:',
        currentJourney: 'Current journey:',
        currentStep: 'Current step:',
        userProfile: 'User profile:',
        skills: 'YOUR SKILLS:',
        communication: 'COMMUNICATION STYLE:',
        rules: 'RULES:'
      },
      de: {
        currentContext: 'AKTUELLER KONTEXT:',
        currentCity: 'Aktuelle Stadt:',
        currentJourney: 'Aktuelle Tour:',
        currentStep: 'Aktueller Schritt:',
        userProfile: 'Benutzerprofil:',
        skills: 'IHRE FÄHIGKEITEN:',
        communication: 'KOMMUNIKATIONSSTIL:',
        rules: 'REGELN:'
      }
    };

    const labels = contextLabels[language as keyof typeof contextLabels] || contextLabels.fr;

    // Build context-aware system prompt
    const systemPrompt = `${baseSystemPrompt}

${labels.currentContext}
${context?.cityName ? `- ${labels.currentCity} ${context.cityName}` : ''}
${context?.currentJourney ? `- ${labels.currentJourney} ${context.currentJourney.name || context.currentJourney}` : ''}
${context?.currentStep ? `- ${labels.currentStep} ${context.currentStep.name} (${context.currentStep.type})` : ''}
${context?.userProfile ? `- ${labels.userProfile} ${JSON.stringify(context.userProfile)}` : ''}
${documentsContent}${quizContent}`;

    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('🤖 Sending to OpenAI:', {
      messagesCount: messages.length,
      systemPromptLength: systemPrompt.length,
      hasDocuments: context?.stepDocuments?.length > 0,
      language
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 600,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('✅ AI response generated:', {
      responseLength: aiResponse?.length || 0,
      language
    });

    // Generate enhanced suggestions based on context
    const suggestions = generateEnhancedSuggestions(context, language, message);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      suggestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: language === 'en' ? "Sorry, I'm experiencing technical difficulties. Can you try again?" :
                language === 'de' ? "Entschuldigung, ich habe technische Schwierigkeiten. Können Sie es erneut versuchen?" :
                "Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer ?"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEnhancedSuggestions(context?: any, language: string = 'fr', lastMessage?: string): string[] {
  const suggestions = [];

  // Context-specific suggestions
  if (context?.currentStep) {
    const stepSuggestions = {
      fr: [
        `Raconte-moi l'histoire de ${context.currentStep.name}`,
        "Que puis-je voir d'intéressant ici ?",
        "Aide-moi avec le quiz de cette étape",
        "Quels sont les détails architecturaux ?"
      ],
      en: [
        `Tell me about the history of ${context.currentStep.name}`,
        "What interesting things can I see here?",
        "Help me with the quiz for this step",
        "What are the architectural details?"
      ],
      de: [
        `Erzähl mir die Geschichte von ${context.currentStep.name}`,
        "Was kann ich hier Interessantes sehen?",
        "Hilf mir mit dem Quiz für diesen Schritt",
        "Was sind die architektonischen Details?"
      ]
    };
    suggestions.push(...(stepSuggestions[language as keyof typeof stepSuggestions] || stepSuggestions.fr));
  } else if (context?.currentJourney) {
    const journeySuggestions = {
      fr: [
        "Quelle est la prochaine étape ?",
        "Combien de temps pour finir ce parcours ?",
        "Conseils pour optimiser mes points",
        "Y a-t-il des variantes plus faciles ?"
      ],
      en: [
        "What's the next step?",
        "How long to finish this journey?",
        "Tips to optimize my points",
        "Are there easier alternatives?"
      ],
      de: [
        "Was ist der nächste Schritt?",
        "Wie lange dauert diese Reise?",
        "Tipps zur Optimierung meiner Punkte",
        "Gibt es einfachere Alternativen?"
      ]
    };
    suggestions.push(...(journeySuggestions[language as keyof typeof journeySuggestions] || journeySuggestions.fr));
  } else if (context?.cityName) {
    const citySuggestions = {
      fr: [
        `Que visiter à ${context.cityName} ?`,
        `Restaurants recommandés à ${context.cityName}`,
        "Quels parcours pour débutants ?",
        "Comment gagner plus de points ?"
      ],
      en: [
        `What to visit in ${context.cityName}?`,
        `Recommended restaurants in ${context.cityName}`,
        "What journeys for beginners?",
        "How can I earn more points?"
      ],
      de: [
        `Was kann man in ${context.cityName} besuchen?`,
        `Empfohlene Restaurants in ${context.cityName}`,
        "Welche Reisen für Anfänger?",
        "Wie kann ich mehr Punkte verdienen?"
      ]
    };
    suggestions.push(...(citySuggestions[language as keyof typeof citySuggestions] || citySuggestions.fr));
  } else {
    // Default suggestions
    const defaultSuggestions = {
      fr: [
        "Quels parcours me recommandes-tu ?",
        "Comment fonctionne le système de points ?",
        "Où trouver les meilleures récompenses ?",
        "Aide-moi à commencer un parcours"
      ],
      en: [
        "What journeys do you recommend?",
        "How does the point system work?",
        "Where can I find the best rewards?",
        "Help me start a journey"
      ],
      de: [
        "Welche Reisen empfiehlst du?",
        "Wie funktioniert das Punktesystem?",
        "Wo finde ich die besten Belohnungen?",
        "Hilf mir, eine Reise zu beginnen"
      ]
    };
    suggestions.push(...(defaultSuggestions[language as keyof typeof defaultSuggestions] || defaultSuggestions.fr));
  }

  return suggestions.slice(0, 4);
}