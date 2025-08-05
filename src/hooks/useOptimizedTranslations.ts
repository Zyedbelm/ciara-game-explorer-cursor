import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Cache global pour les traductions avec TTL (Time To Live)
interface CachedTranslation {
  value: string;
  timestamp: number;
  ttl: number; // 5 minutes par défaut
}

const translationCache = new Map<string, CachedTranslation>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Traductions de fallback critiques pour la homepage
const CRITICAL_FALLBACKS: Record<string, Record<string, string>> = {
  discover_intelligent_tourism: {
    fr: "Découvrez le Tourisme Intelligent",
    en: "Discover Intelligent Tourism",
    de: "Entdecken Sie den Intelligenten Tourismus"
  },
  explore_destinations_gamified: {
    fr: "Explorez vos destinations préférées avec des parcours gamifiés, gagnez des points et débloquez des récompenses exclusives.",
    en: "Explore your favorite destinations with gamified routes, earn points and unlock exclusive rewards.",
    de: "Erkunden Sie Ihre Lieblingsdestinationen mit spielerischen Routen, sammeln Sie Punkte und schalten Sie exklusive Belohnungen frei."
  },
  start_adventure: {
    fr: "Commencer l'Aventure",
    en: "Start Adventure",
    de: "Abenteuer Beginnen"
  },
  unique_experience: {
    fr: "Une Expérience Unique",
    en: "A Unique Experience",
    de: "Ein Einzigartiges Erlebnis"
  },
  transform_exploration: {
    fr: "CIARA transforme votre façon d'explorer en combinant technologie et découverte locale",
    en: "CIARA transforms how you explore by combining technology and local discovery",
    de: "CIARA verwandelt Ihre Art zu erkunden, indem es Technologie und lokale Entdeckungen kombiniert"
  },
  interactive_routes: {
    fr: "Parcours Interactifs",
    en: "Interactive Routes",
    de: "Interaktive Routen"
  },
  discover_destination_gamified: {
    fr: "Découvrez votre destination avec des parcours gamifiés et personnalisés",
    en: "Discover your destination with gamified and personalized routes",
    de: "Erkunden Sie Ihr Reiseziel mit spielerischen und personalisierten Routen"
  },
  reward_system: {
    fr: "Système de Récompenses",
    en: "Reward System",
    de: "Belohnungssystem"
  },
  earn_points_unlock_benefits: {
    fr: "Gagnez des points et débloquez des avantages chez nos partenaires locaux",
    en: "Earn points and unlock benefits from our local partners",
    de: "Sammeln Sie Punkte und schalten Sie Vorteile bei unseren lokalen Partnern frei"
  },
  personalized_ai: {
    fr: "IA Personnalisée",
    en: "Personalized AI",
    de: "Personalisierte KI"
  },
  intelligent_recommendations: {
    fr: "Des recommandations intelligentes basées sur vos préférences",
    en: "Intelligent recommendations based on your preferences",
    de: "Intelligente Empfehlungen basierend auf Ihren Vorlieben"
  },
  smart_analytics: {
    fr: "Analytics Intelligents",
    en: "Smart Analytics",
    de: "Intelligente Analytik"
  },
  track_progress_insights: {
    fr: "Suivez vos progrès et obtenez des insights personnalisés",
    en: "Track your progress and get personalized insights",
    de: "Verfolgen Sie Ihre Fortschritte und erhalten Sie personalisierte Einblicke"
  },
  available_destinations: {
    fr: "Destinations Disponibles",
    en: "Available Destinations",
    de: "Verfügbare Reiseziele"
  },
  each_destination_unique: {
    fr: "Chaque destination offre une expérience unique avec des parcours sur mesure",
    en: "Each destination offers a unique experience with custom routes",
    de: "Jedes Reiseziel bietet ein einzigartiges Erlebnis mit maßgeschneiderten Routen"
  },
  explore_now: {
    fr: "Explorer maintenant",
    en: "Explore now",
    de: "Jetzt erkunden"
  },
  see_all_cities: {
    fr: "Voir toutes les villes",
    en: "See all cities",
    de: "Alle Städte anzeigen"
  },
  ready_for_adventure: {
    fr: "Prêt pour l'Aventure ?",
    en: "Ready for Adventure?",
    de: "Bereit für das Abenteuer?"
  },
  join_thousands_explorers: {
    fr: "Rejoignez des milliers d'explorateurs qui ont déjà découvert une nouvelle façon de voyager",
    en: "Join thousands of explorers who have already discovered a new way to travel",
    de: "Schließen Sie sich Tausenden von Entdeckern an, die bereits eine neue Art des Reisens entdeckt haben"
  },
  loading: {
    fr: "Chargement...",
    en: "Loading...",
    de: "Laden..."
  }
};

export function useOptimizedTranslations() {
  const { t, currentLanguage, isLoading } = useLanguage();
  const [cachedTranslations, setCachedTranslations] = useState<Map<string, string>>(new Map());
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Nettoyer le cache expiré
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    for (const [key, cached] of translationCache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        translationCache.delete(key);
      }
    }
  }, []);

  // Fonction de traduction optimisée avec fallbacks robustes
  const tOptimized = useCallback((key: string, params?: Record<string, string | number>): string => {
    const cacheKey = `${currentLanguage}-${key}`;
    
    // Nettoyer le cache expiré périodiquement
    cleanExpiredCache();
    
    // Vérifier le cache global d'abord
    const cached = translationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return processParams(cached.value, params);
    }

    // Vérifier le cache local
    if (cachedTranslations.has(key)) {
      const localValue = cachedTranslations.get(key)!;
      translationCache.set(cacheKey, {
        value: localValue,
        timestamp: Date.now(),
        ttl: CACHE_TTL
      });
      return processParams(localValue, params);
    }

    // Essayer la fonction de traduction normale
    let translation = t(key);
    
    // Si la traduction retourne la clé (pas trouvée), utiliser les fallbacks critiques
    if (translation === key && CRITICAL_FALLBACKS[key]) {
      translation = CRITICAL_FALLBACKS[key][currentLanguage] || CRITICAL_FALLBACKS[key].fr || key;
    }
    
    // Mettre en cache seulement si ce n'est pas la clé elle-même
    if (translation !== key) {
      translationCache.set(cacheKey, {
        value: translation,
        timestamp: Date.now(),
        ttl: CACHE_TTL
      });
    }
    
    return processParams(translation, params);
  }, [t, currentLanguage, cachedTranslations, cleanExpiredCache]);

  // Traitement des paramètres dans les traductions
  const processParams = useCallback((translation: string, params?: Record<string, string | number>): string => {
    if (!params) return translation;
    let result = translation;
    Object.entries(params).forEach(([paramKey, value]) => {
      result = result.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(value));
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    });
    return result;
  }, []);

  // Précharger les traductions critiques
  const preloadCriticalTranslations = useCallback(() => {
    if (isPreloaded) return;
    
    const criticalKeys = Object.keys(CRITICAL_FALLBACKS);
    const newCache = new Map(cachedTranslations);
    let hasUpdates = false;

    criticalKeys.forEach(key => {
      const cacheKey = `${currentLanguage}-${key}`;
      if (!translationCache.has(cacheKey)) {
        const translation = tOptimized(key);
        newCache.set(key, translation);
        hasUpdates = true;
      } else {
        newCache.set(key, translationCache.get(cacheKey)!.value);
      }
    });

    if (hasUpdates) {
      setCachedTranslations(newCache);
    }
    
    setIsPreloaded(true);
  }, [currentLanguage, cachedTranslations, tOptimized, isPreloaded]);

  // Précharger les traductions communes
  const preloadCommonTranslations = useCallback(() => {
    const commonKeys = [
      'home', 'explore', 'my_journeys', 'rewards', 'profile',
      'generate_journey', 'ai_journey_generator',
      'sion_description', 'lausanne_description', 'geneva_description'
    ];

    const newCache = new Map(cachedTranslations);
    let hasUpdates = false;

    commonKeys.forEach(key => {
      const cacheKey = `${currentLanguage}-${key}`;
      if (!translationCache.has(cacheKey)) {
        const translation = tOptimized(key);
        newCache.set(key, translation);
        hasUpdates = true;
      } else {
        newCache.set(key, translationCache.get(cacheKey)!.value);
      }
    });

    if (hasUpdates) {
      setCachedTranslations(newCache);
    }
  }, [currentLanguage, cachedTranslations, tOptimized]);

  // Préchargement automatique avec gestion intelligente du cache
  useEffect(() => {
    if (!isLoading && currentLanguage) {
      // Vérifier si on a déjà des traductions pour cette langue
      const hasTranslationsForLanguage = Array.from(translationCache.keys()).some(key => 
        key.startsWith(`${currentLanguage}-`)
      );
      
      if (!hasTranslationsForLanguage) {
        // Seulement vider le cache si on n'a pas de traductions pour cette langue
        setIsPreloaded(false);
        
        // Précharger les traductions critiques immédiatement
        preloadCriticalTranslations();
        
        // Précharger les autres traductions après un délai
        const timer = setTimeout(preloadCommonTranslations, 200);
        return () => clearTimeout(timer);
      } else {
        // Si on a déjà des traductions pour cette langue, juste marquer comme préchargé
        setIsPreloaded(true);
      }
    }
  }, [isLoading, currentLanguage, preloadCriticalTranslations, preloadCommonTranslations]);

  // Statistiques du cache
  const cacheStats = useMemo(() => ({
    size: translationCache.size,
    isPreloaded,
    currentLanguage
  }), [isPreloaded, currentLanguage]);

  return {
    t: tOptimized,
    isLoading: isLoading || !isPreloaded,
    currentLanguage,
    preloadTranslations: preloadCriticalTranslations,
    cacheStats,
    // Fonction pour forcer le rechargement
    refreshCache: () => {
      translationCache.clear();
      setCachedTranslations(new Map());
      setIsPreloaded(false);
      preloadCriticalTranslations();
    }
  };
}