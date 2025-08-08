
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { contactTranslations, translations } from '@/utils/translations';
import { myJourneysTranslations, rewardsTranslations } from '@/utils/myJourneysTranslations';
import { adminTranslations } from '@/utils/adminTranslations';
import { profileTranslations } from '@/utils/profileTranslations';
import { supabase } from '@/integrations/supabase/client';

export type Language = 'fr' | 'en' | 'de';

interface LanguageContextType {
  language: Language;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  refreshTranslations: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Create a type for our cached translations
interface TranslationsCache {
  [key: string]: {
    [lang: string]: string;
  };
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Simplified state management - no loading state to avoid render loops
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLanguage = localStorage.getItem('preferredLanguage');
      return (savedLanguage as Language) || 'fr';
    } catch (error) {
      return 'fr';
    }
  });

  // Simple translations cache with no complex loading logic
  const [dbTranslations, setDbTranslations] = useState<TranslationsCache>({});
  const [isLoading, setIsLoading] = useState(false);

  // Simplified fetch function with minimal logging
  const fetchTranslations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ui_translations')
        .select('key, language, value');
      
      if (error) {
        return;
      }
      
      if (data) {
        const translations: TranslationsCache = {};
        data.forEach(item => {
          if (!translations[item.key]) {
            translations[item.key] = {};
          }
          translations[item.key][item.language] = item.value;
        });
        setDbTranslations(translations);
      }
    } catch (error) {
    }
  }, []);

  // One-time initialization only
  useEffect(() => {
    fetchTranslations();
  }, []); // No dependencies to prevent loops

  // Simplified language setter
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('preferredLanguage', lang);
    } catch (error) {
    }
  }, [language]);

  // Simplified refresh function
  const refreshTranslations = useCallback(async () => {
    setIsLoading(true);
    await fetchTranslations();
    setIsLoading(false);
  }, [fetchTranslations]);

  // Simplified translation function with minimal logging
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    // Critical password reset translations with immediate fallbacks
    const passwordResetFallbacks: Record<string, Record<string, string>> = {
      password_reset_title: {
        fr: "Réinitialisation du mot de passe",
        en: "Password Reset",
        de: "Passwort zurücksetzen"
      },
      password_reset_instruction: {
        fr: "Entrez votre adresse email et nous vous enverrons un lien de réinitialisation pour changer votre mot de passe.",
        en: "Enter your email address and we'll send you a password reset link to change your password.",
        de: "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen des Passworts."
      },
      send_reset_link: {
        fr: "Envoyer le lien de réinitialisation",
        en: "Send Reset Link",
        de: "Reset-Link senden"
      },
      email_address: {
        fr: "Adresse email",
        en: "Email address", 
        de: "E-Mail-Adresse"
      }
    };
    
    // Helper function to process parameters
    const processParams = (translation: string, params?: Record<string, string | number>): string => {
      if (!params) return translation;
      let result = translation;
      Object.entries(params).forEach(([paramKey, value]) => {
        result = result.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(value));
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      });
      return result;
    };

    // Priority 1: Check if the key exists in Supabase translations
    if (dbTranslations[key]?.[language]) {
      return processParams(dbTranslations[key][language], params);
    }
    
    // Priority 2: Fall back to French if the language-specific translation doesn't exist
    if (dbTranslations[key]?.fr) {
      return processParams(dbTranslations[key].fr, params);
    }
    
    // Priority 2.5: Password reset fallbacks (before static files)
    if (passwordResetFallbacks[key]) {
      const fallbackTranslation = passwordResetFallbacks[key][language] || passwordResetFallbacks[key].fr;
      return processParams(fallbackTranslation, params);
    }
    
    // Priority 3: Check static translation files
    // First check contact translations
    const contactTranslation = contactTranslations[key as keyof typeof contactTranslations];
    if (contactTranslation) {
      // Handle both flat and nested translation structures
      if (typeof contactTranslation === 'object' && contactTranslation !== null) {
        // Check if it's a direct language object (has 'fr' property)
        if ('fr' in contactTranslation && typeof contactTranslation.fr === 'string') {
          return (contactTranslation as any)[language] || contactTranslation.fr || key;
        }
      }
    }

    // Then check myJourneys and rewards translations
    const myJourneysTranslation = myJourneysTranslations[language]?.[key];
    if (myJourneysTranslation) {
      return processParams(myJourneysTranslation, params);
    }

    const rewardsTranslation = rewardsTranslations[language]?.[key];
    if (rewardsTranslation) {
      return processParams(rewardsTranslation, params);
    }

    // Check admin translations
    const adminTranslation = adminTranslations[key as keyof typeof adminTranslations];
    if (adminTranslation) {
      return adminTranslation[language] || adminTranslation.fr || key;
    }

    // Check profile translations
    const profileTranslation = profileTranslations[language]?.[key];
    if (profileTranslation) {
      return processParams(profileTranslation, params);
    }

    // Priority 4: Check main translations object
    const mainTranslation = translations[key as keyof typeof translations];
    if (mainTranslation && typeof mainTranslation === 'object') {
      return (mainTranslation as any)[language] || (mainTranslation as any).fr || key;
    }

    // Priority 5: Check for dotted key paths in static translations
    const keys = key.split('.');
    let staticValue: any = contactTranslations;
    for (const k of keys) {
      staticValue = staticValue?.[k];
      if (!staticValue) break;
    }
    
    if (staticValue && typeof staticValue === 'object' && staticValue[language]) {
      return staticValue[language];
    }
    
    if (staticValue && typeof staticValue === 'object' && staticValue['fr']) {
      return staticValue['fr'];
    }
    
    // Final fallback: return the key itself if no translation is found
    return key;
  }, [language, dbTranslations]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    language, 
    currentLanguage: language,
    setLanguage, 
    t,
    isLoading,
    refreshTranslations
  }), [language, setLanguage, t, isLoading, refreshTranslations]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
