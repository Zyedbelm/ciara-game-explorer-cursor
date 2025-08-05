import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import JourneyGeneratorModal from '@/components/ai/JourneyGeneratorModal';
import { useLanguage } from '@/contexts/LanguageContext';

interface AIJourneyGeneratorProps {
  cityName: string;
}

const AIJourneyGenerator: React.FC<AIJourneyGeneratorProps> = ({ cityName }) => {
  const { t } = useLanguage();
  
  return (
    <JourneyGeneratorModal 
      trigger={
        <Button 
          size="default"
          className="bg-white text-primary hover:bg-white/90 font-semibold px-4 md:px-6 py-2 text-sm md:text-base w-full sm:w-auto"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t('generate_journey')}</span>
          <span className="sm:hidden">{t('generate_journey').split(' ')[0]}</span>
        </Button>
      }
    />
  );
};

export default AIJourneyGenerator;