import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Hook simplifié pour les traductions qui évite les conflits avec useOptimizedTranslations
 * et se concentre sur une approche directe pour les pages d'articles
 */
export function useSimplifiedTranslations() {
  const { t, currentLanguage, isLoading } = useLanguage();

  return {
    t,
    currentLanguage,
    isLoading
  };
}