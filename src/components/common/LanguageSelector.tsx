
import React from 'react';
import { Check, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const languages = [
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'transparent';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'default' 
}) => {
  const { currentLanguage, setLanguage, isLoading } = useLanguage();

  const currentLangData = languages.find(lang => lang.code === currentLanguage);
  const isTransparent = variant === 'transparent';

  if (isLoading) {
    return (
      <Button 
        variant="ghost" 
        size="sm"
        disabled
        className={`h-8 gap-2 px-3 ${
          isTransparent 
            ? 'text-white/60 border-white/20' 
            : 'text-muted-foreground'
        }`}
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm">...</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`h-8 gap-2 px-3 ${
            isTransparent 
              ? 'text-white hover:bg-white/10 hover:text-white border border-white/20' 
              : 'text-foreground hover:bg-muted border border-border'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{currentLangData?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
