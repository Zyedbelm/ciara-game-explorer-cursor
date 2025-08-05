import { translations } from '@/utils/translations';

/**
 * Fallback translation hook that doesn't depend on LanguageContext
 * Used when LanguageContext is not available (e.g., in AuthGuard)
 */
export function useTranslationFallback() {
  const t = (key: string, fallbackLang: string = 'fr'): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }
    
    // Check if value exists and has the fallback language
    if (value && typeof value === 'object' && value[fallbackLang]) {
      return value[fallbackLang];
    }
    
    // Return the key if translation not found
    return key;
  };

  return { t };
}