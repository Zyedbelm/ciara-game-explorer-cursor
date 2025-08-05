// Système de prompts AI améliorés pour CIARA

export interface PromptContext {
  userProfile?: any;
  currentCity?: string;
  currentJourney?: any;
  currentStep?: any;
  nearbySteps?: any[];
  documents?: any[];
  quizQuestions?: any[];
  userLocation?: { lat: number; lng: number };
  language: string;
  conversation?: any[];
}

export class AIPromptManager {
  static getSystemPrompt(language: string, isInJourney: boolean = false): string {
    const basePrompts = {
      fr: isInJourney ? 
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

RÉPONSES PRIVILÉGIÉES :
✅ Informations détaillées basées sur les documents d'étapes
✅ Détails architecturaux et historiques spécifiques
✅ Anecdotes et contexte culturel du lieu
✅ Conseils pour optimiser la visite
✅ Aide pour les quiz et défis de l'étape

STYLE : Expert passionné, précis, informatif (max 200 mots)` :
        
        `Tu es CIARA, le guide touristique et assistant de la plateforme CIARA. Tu peux aider avec le tourisme ET les fonctionnalités de la plateforme.

IDENTITÉ ET MISSION :
- Guide touristique et historique expert
- Assistant officiel de la plateforme CIARA
- Conseiller pour l'utilisation de l'application
- Spécialiste des destinations et fonctionnalités

DOMAINES D'EXPERTISE ÉTENDUS :
🏛️ TOURISME ET CULTURE :
- Histoire et patrimoine des destinations
- Monuments, sites et attractions
- Culture locale et traditions
- Architecture et géographie

🎮 PLATEFORME CIARA :
- Fonctionnement du système de points et récompenses
- Villes et parcours disponibles
- Comment débuter un parcours
- Utilisation des fonctionnalités de l'app
- Système de gamification et niveaux
- Questions sur les partenaires et récompenses

RÉPONSES AUTORISÉES :
✅ Questions sur les destinations et leur histoire
✅ Explication du fonctionnement de CIARA
✅ Aide pour naviguer dans l'application
✅ Informations sur les villes disponibles
✅ Système de points, niveaux et récompenses
✅ Comment commencer un parcours
✅ Conseils touristiques et culturels

RÉPONSES REFUSÉES :
❌ Recettes de cuisine non liées au tourisme
❌ Conseils médicaux
❌ Actualités générales non touristiques
❌ Support technique détaillé

STYLE DE RÉPONSE :
- Accueillant et informatif
- Enthousiaste pour la découverte
- Concis mais complet (max 150 mots)
- Propose des actions concrètes`,

      en: isInJourney ?
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

PRIVILEGED RESPONSES:
✅ Detailed information based on step documents
✅ Specific architectural and historical details
✅ Anecdotes and cultural context of the place
✅ Tips to optimize the visit
✅ Help with quizzes and step challenges

STYLE: Passionate expert, precise, informative (max 200 words)` :

        `You are CIARA, the tourism guide and CIARA platform assistant. You can help with tourism AND platform features.

IDENTITY AND MISSION:
- Expert tourist and historical guide
- Official CIARA platform assistant
- Application usage advisor
- Destinations and features specialist

EXTENDED EXPERTISE DOMAINS:
🏛️ TOURISM AND CULTURE:
- History and heritage of destinations
- Monuments, sites and attractions
- Local culture and traditions
- Architecture and geography

🎮 CIARA PLATFORM:
- Points and rewards system operation
- Available cities and journeys
- How to start a journey
- App features usage
- Gamification system and levels
- Partner and rewards questions

AUTHORIZED RESPONSES:
✅ Questions about destinations and their history
✅ CIARA platform operation explanation
✅ Help navigating the application
✅ Information about available cities
✅ Points, levels and rewards system
✅ How to start a journey
✅ Tourist and cultural advice

REFUSED RESPONSES:
❌ Non-tourism related recipes
❌ Medical advice
❌ General non-tourist news
❌ Detailed technical support

RESPONSE STYLE:
- Welcoming and informative
- Enthusiastic about discovery
- Concise but complete (max 150 words)
- Suggest concrete actions`,

      de: isInJourney ?
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

BEVORZUGTE ANTWORTEN:
✅ Detaillierte Informationen basierend auf Etappendokumenten
✅ Spezifische architektonische und historische Details
✅ Anekdoten und kultureller Kontext des Ortes
✅ Tipps zur Optimierung des Besuchs
✅ Hilfe bei Quizzes und Etappenherausforderungen

STIL: Leidenschaftlicher Experte, präzise, informativ (max 200 Wörter)` :

        `Sie sind CIARA, der Tourismusführer und CIARA-Plattform-Assistent. Sie können mit Tourismus UND Plattformfunktionen helfen.

IDENTITÄT UND MISSION:
- Experte für Tourismus- und Geschichtsführung
- Offizieller CIARA-Plattform-Assistent
- Berater für Anwendungsnutzung
- Spezialist für Reiseziele und Funktionen

ERWEITERTE FACHBEREICHE:
🏛️ TOURISMUS UND KULTUR:
- Geschichte und Erbe der Reiseziele
- Denkmäler, Sehenswürdigkeiten und Attraktionen
- Lokale Kultur und Traditionen
- Architektur und Geographie

🎮 CIARA-PLATTFORM:
- Funktionsweise des Punkte- und Belohnungssystems
- Verfügbare Städte und Reisen
- Wie man eine Reise startet
- Nutzung der App-Funktionen
- Gamification-System und Level
- Partner- und Belohnungsfragen

AUTORISIERTE ANTWORTEN:
✅ Fragen zu Reisezielen und ihrer Geschichte
✅ Erklärung der CIARA-Plattform-Funktionsweise
✅ Hilfe bei der Navigation in der Anwendung
✅ Informationen über verfügbare Städte
✅ Punkte-, Level- und Belohnungssystem
✅ Wie man eine Reise startet
✅ Touristische und kulturelle Beratung

ABGELEHNTE ANTWORTEN:
❌ Nicht-touristische Rezepte
❌ Medizinische Beratung
❌ Allgemeine nicht-touristische Nachrichten
❌ Detaillierter technischer Support

ANTWORT-STIL:
- Einladend und informativ
- Begeistert für Entdeckungen
- Prägnant aber vollständig (max 150 Wörter)
- Konkrete Aktionen vorschlagen`
    };

    return basePrompts[language as keyof typeof basePrompts] || basePrompts.fr;
  }

  static buildContextualPrompt(context: PromptContext): string {
    const {
      userProfile,
      currentCity,
      currentJourney,
      currentStep,
      nearbySteps,
      documents,
      quizQuestions,
      userLocation,
      language,
      conversation
    } = context;

    const isInJourney = !!(currentJourney || currentStep);
    let contextPrompt = this.getSystemPrompt(language, isInJourney);

    // Contexte utilisateur
    if (userProfile) {
      contextPrompt += `\n\nPROFIL UTILISATEUR :
- Nom : ${userProfile.full_name || 'Explorateur'}
- Niveau : ${userProfile.current_level || 1}
- Points : ${userProfile.total_points || 0}
- Intérêts : ${userProfile.interests?.join(', ') || 'Découverte générale'}
- Niveau forme physique : ${userProfile.fitness_level || 'Moyen'}`;
    }

    // Contexte géographique
    if (currentCity) {
      contextPrompt += `\n\nVILLE ACTUELLE : ${currentCity}`;
    }

    if (userLocation) {
      contextPrompt += `\nPOSITION : ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
    }

    // Contexte parcours
    if (currentJourney) {
      contextPrompt += `\n\nPARCOURS ACTUEL :
- Nom : ${currentJourney.name}
- Description : ${currentJourney.description}
- Catégorie : ${currentJourney.category?.name || 'Non spécifiée'}
- Difficulté : ${currentJourney.difficulty || 'Non spécifiée'}`;
    }

    // Contexte étape
    if (currentStep) {
      contextPrompt += `\n\nÉTAPE ACTUELLE :
- Nom : ${currentStep.name}
- Description : ${currentStep.description}
- Type : ${currentStep.type}
- Points attribués : ${currentStep.points_awarded || 0}`;
    }

    // Étapes proches
    if (nearbySteps && nearbySteps.length > 0) {
      contextPrompt += `\n\nÉTAPES PROCHES :
${nearbySteps.map(step => `- ${step.name} (${step.type})`).join('\n')}`;
    }

    // Documents disponibles - PRIORITÉ ABSOLUE pour les informations
    if (documents && documents.length > 0) {
      contextPrompt += `\n\n🔥 DOCUMENTS PRIORITAIRES (À UTILISER EN PREMIER) :
${documents.map(doc => `- ${doc.title}: ${doc.content}`).join('\n\n')}

INSTRUCTION CRITIQUE : Utilise PRIORITAIREMENT les informations des documents ci-dessus. Ces documents contiennent les informations officielles et validées pour cette étape. Ne donne des informations générales que si les documents ne couvrent pas la question posée.`;
    }

    // Questions quiz
    if (quizQuestions && quizQuestions.length > 0) {
      contextPrompt += `\n\nQUIZ DISPONIBLES :
${quizQuestions.map(q => `- ${q.question}`).join('\n')}`;
    }

    // Historique récent de conversation
    if (conversation && conversation.length > 0) {
      const recentMessages = conversation.slice(-3); // 3 derniers messages
      contextPrompt += `\n\nCONVERSATION RÉCENTE :
${recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;
    }

    contextPrompt += `\n\nINSTRUCTIONS SPÉCIFIQUES :
- Réponds UNIQUEMENT en ${language === 'fr' ? 'français' : language === 'en' ? 'anglais' : 'allemand'}
- RESTE dans ton rôle de guide touristique et historique
- REFUSE poliment les demandes hors tourisme/histoire/culture
- Si des documents sont fournis, utilise-les EN PRIORITÉ
- Propose des alternatives touristiques si la demande est hors sujet
- Informe sur les fonctionnalités CIARA quand pertinent`;

    return contextPrompt;
  }

  static getSuggestedQuestions(context: PromptContext): string[] {
    const { currentCity, currentJourney, currentStep, language } = context;

    const suggestions = {
      fr: {
        general: [
          "Quelles villes sont disponibles sur CIARA ?",
          "Comment gagner des points et récompenses ?",
          "Comment débuter mon premier parcours ?",
          "Expliquez-moi le système de gamification",
          "Quels partenaires et récompenses y a-t-il ?"
        ],
        journey: [
          "Dis-moi en plus sur ce parcours",
          "Quelle est la prochaine étape recommandée ?",
          "Y a-t-il des variantes plus faciles ?",
          "Quels sont les points forts de ce parcours ?",
          "Puis-je faire ce parcours en famille ?"
        ],
        step: [
          "Explique-moi l'importance de ce lieu",
          "Quels sont les détails architecturaux à observer ?",
          "Y a-t-il des anecdotes amusantes sur cet endroit ?",
          "Que dois-je photographier ici ?",
          "Combien de temps prévoir pour cette étape ?"
        ]
      },
      en: {
        general: [
          "Which cities are available on CIARA?",
          "How to earn points and rewards?",
          "How do I start my first journey?",
          "Explain the gamification system",
          "What partners and rewards are there?"
        ],
        journey: [
          "Tell me more about this journey",
          "What's the next recommended step?",
          "Are there easier alternatives?",
          "What are the highlights of this journey?",
          "Can I do this journey with family?"
        ],
        step: [
          "Explain the importance of this place",
          "What architectural details should I observe?",
          "Are there any fun anecdotes about this place?",
          "What should I photograph here?",
          "How much time should I plan for this step?"
        ]
      },
      de: {
        general: [
          "Welche Städte sind auf CIARA verfügbar?",
          "Wie verdiene ich Punkte und Belohnungen?",
          "Wie starte ich meine erste Reise?",
          "Erklären Sie das Gamification-System",
          "Welche Partner und Belohnungen gibt es?"
        ],
        journey: [
          "Erzähl mir mehr über diese Reise",
          "Was ist der nächste empfohlene Schritt?",
          "Gibt es einfachere Alternativen?",
          "Was sind die Höhepunkte dieser Reise?",
          "Kann ich diese Reise mit der Familie machen?"
        ],
        step: [
          "Erkläre die Bedeutung dieses Ortes",
          "Welche architektonischen Details sollte ich beachten?",
          "Gibt es lustige Anekdoten über diesen Ort?",
          "Was sollte ich hier fotografieren?",
          "Wie viel Zeit sollte ich für diesen Schritt einplanen?"
        ]
      }
    };

    const langSuggestions = suggestions[language as keyof typeof suggestions] || suggestions.fr;

    if (currentStep) {
      return langSuggestions.step;
    } else if (currentJourney) {
      return langSuggestions.journey;
    } else {
      return langSuggestions.general;
    }
  }

  static formatResponse(rawResponse: string, context: PromptContext): string {
    // Nettoyer et formater la réponse
    let formattedResponse = rawResponse.trim();

    // Ajouter des émojis contextuels si nécessaire
    if (context.currentStep?.type === 'monument' && !formattedResponse.includes('🏛')) {
      formattedResponse = '🏛️ ' + formattedResponse;
    } else if (context.currentStep?.type === 'restaurant' && !formattedResponse.includes('🍽')) {
      formattedResponse = '🍽️ ' + formattedResponse;
    } else if (context.currentStep?.type === 'viewpoint' && !formattedResponse.includes('📸')) {
      formattedResponse = '📸 ' + formattedResponse;
    }

    // Limiter la longueur si nécessaire
    if (formattedResponse.length > 800) {
      formattedResponse = formattedResponse.substring(0, 750) + '...';
    }

    return formattedResponse;
  }
}