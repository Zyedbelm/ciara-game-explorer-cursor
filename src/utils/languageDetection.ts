import { franc } from 'franc';

// Enhanced language detection utility
export function detectLanguage(text: string): 'fr' | 'en' | 'de' {
  if (!text || text.trim().length < 3) {
    return 'fr'; // Default fallback
  }

  const cleanText = text.trim().toLowerCase();
  
  // Keyword-based detection for better accuracy with short texts
  const keywordDetection = {
    fr: ['bonjour', 'merci', 'comment', 'quel', 'quelle', 'où', 'pourquoi', 'que', 'qui', 'est-ce', 'peux-tu', 'pouvez-vous', 'aide', 'raconte', 'explique', 'salut', 'allô'],
    en: ['hello', 'thank', 'thanks', 'how', 'what', 'where', 'why', 'who', 'can you', 'help', 'tell me', 'explain', 'please', 'hi', 'hey'],
    de: ['hallo', 'danke', 'wie', 'was', 'wo', 'warum', 'wer', 'können sie', 'hilfe', 'erzählen', 'erklären', 'bitte', 'guten']
  };

  // Check for keywords first (more reliable for short texts)
  for (const [lang, keywords] of Object.entries(keywordDetection)) {
    if (keywords.some(keyword => cleanText.includes(keyword))) {
      console.log(`🔍 Language detected via keywords: ${lang} for text: "${text.substring(0, 50)}..."`);
      return lang as 'fr' | 'en' | 'de';
    }
  }

  try {
    const detected = franc(cleanText, { minLength: 3 });
    console.log(`🔍 Franc detected language: ${detected} for text: "${text.substring(0, 50)}..."`);
    
    // Map franc codes to our supported languages
    const languageMap: Record<string, 'fr' | 'en' | 'de'> = {
      'fra': 'fr',
      'eng': 'en', 
      'deu': 'de',
      'ger': 'de', // Alternative German code
    };

    const mappedLanguage = languageMap[detected];
    if (mappedLanguage) {
      console.log(`✅ Language mapped to: ${mappedLanguage}`);
      return mappedLanguage;
    } else {
      console.log(`⚠️ Unknown language detected: ${detected}, defaulting to French`);
      return 'fr';
    }
  } catch (error) {
    console.warn('Language detection failed:', error);
    return 'fr';
  }
}

// Get language-specific welcome messages
export function getWelcomeMessage(language: 'fr' | 'en' | 'de', cityName?: string): string {
  const messages = {
    fr: `👋 Bonjour ! Je suis CIARA, votre guide touristique et assistant de la plateforme CIARA. Je peux vous aider à découvrir ${cityName || 'les destinations'}, comprendre le système de points et récompenses, ou vous guider dans vos parcours ! Que souhaitez-vous découvrir aujourd'hui ?`,
    en: `👋 Hello! I'm CIARA, your tourism guide and CIARA platform assistant. I can help you discover ${cityName || 'the destinations'}, understand the points and rewards system, or guide you through your journeys! What would you like to explore today?`,
    de: `👋 Hallo! Ich bin CIARA, Ihr Tourismusführer und CIARA-Plattform-Assistent. Ich kann Ihnen helfen, ${cityName || 'die Reiseziele'} zu entdecken, das Punkte- und Belohnungssystem zu verstehen oder Sie durch Ihre Reisen zu führen! Was möchten Sie heute erkunden?`
  };

  return messages[language];
}

// Get language-specific suggestions for homepage
export function getLanguageSpecificSuggestions(language: 'fr' | 'en' | 'de'): string[] {
  const suggestions = {
    fr: [
      "Quelles villes sont disponibles sur CIARA ?",
      "Comment gagner des points et récompenses ?",
      "Comment débuter mon premier parcours ?",
      "Expliquez-moi le système de gamification"
    ],
    en: [
      "Which cities are available on CIARA?",
      "How to earn points and rewards?",
      "How do I start my first journey?",
      "Explain the gamification system"
    ],
    de: [
      "Welche Städte sind auf CIARA verfügbar?",
      "Wie verdiene ich Punkte und Belohnungen?",
      "Wie starte ich meine erste Reise?",
      "Erklären Sie das Gamification-System"
    ]
  };

  return suggestions[language];
}