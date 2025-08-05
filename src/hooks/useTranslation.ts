import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';

export function useTranslation() {
  const { currentLanguage } = useLanguage();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }
    
    if (value && typeof value === 'object' && value[currentLanguage]) {
      return value[currentLanguage];
    }
    
    // Fallback to French if current language not found
    if (value && typeof value === 'object' && value['fr']) {
      return value['fr'];
    }
    
    // Return key if translation not found
    return key;
  };

  return { t, currentLanguage };
}