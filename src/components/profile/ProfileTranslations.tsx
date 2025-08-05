import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Check } from 'lucide-react';

interface ProfileTranslationsProps {
  onLanguageChange?: (language: string) => void;
}

const ProfileTranslations: React.FC<ProfileTranslationsProps> = ({ onLanguageChange }) => {
  const { currentLanguage, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
    onLanguageChange?.(newLanguage);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t('profile.language_preferences') || 'Préférences de langue'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('profile.interface_language') || 'Langue de l\'interface'}
          </label>
          <Select value={currentLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">
            {t('profile.content_languages') || 'Langues de contenu préférées'}
          </label>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <Badge 
                key={lang.code} 
                variant={currentLanguage === lang.code ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="mr-1">{lang.flag}</span>
                {lang.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            {t('profile.language_note') || 
              'La langue sélectionnée sera utilisée pour l\'interface et le contenu des parcours. Vous pouvez changer de langue à tout moment.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileTranslations;