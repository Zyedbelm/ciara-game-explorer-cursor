import { useMemo, useRef, useEffect } from 'react';
import { useOptimizedTranslations } from './useOptimizedTranslations';

export function useStableTranslations() {
  const { t, isLoading, currentLanguage, cacheStats } = useOptimizedTranslations();
  const stableTranslationsRef = useRef<Map<string, string>>(new Map());
  const lastLanguageRef = useRef<string>('');

  // Stabiliser les traductions pour éviter les clignotements
  const stableT = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const cacheKey = `${currentLanguage}-${key}`;
      
      // Si la langue a changé, vider le cache stable
      if (lastLanguageRef.current !== currentLanguage) {
        stableTranslationsRef.current.clear();
        lastLanguageRef.current = currentLanguage;
      }
      
      // Vérifier le cache stable
      if (stableTranslationsRef.current.has(cacheKey)) {
        const cached = stableTranslationsRef.current.get(cacheKey)!;
        return processParams(cached, params);
      }
      
      // Obtenir la traduction
      const translation = t(key);
      
      // Mettre en cache stable seulement si c'est une vraie traduction
      if (translation !== key) {
        stableTranslationsRef.current.set(cacheKey, translation);
      }
      
      return processParams(translation, params);
    };
  }, [t, currentLanguage]);

  // Fonction pour traiter les paramètres
  const processParams = (translation: string, params?: Record<string, string | number>): string => {
    if (!params) return translation;
    let result = translation;
    Object.entries(params).forEach(([paramKey, value]) => {
      result = result.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(value));
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    });
    return result;
  };

  // Nettoyer le cache quand la langue change
  useEffect(() => {
    if (lastLanguageRef.current !== currentLanguage) {
      stableTranslationsRef.current.clear();
      lastLanguageRef.current = currentLanguage;
    }
  }, [currentLanguage]);

  return {
    t: stableT,
    isLoading,
    currentLanguage,
    cacheStats
  };
} 