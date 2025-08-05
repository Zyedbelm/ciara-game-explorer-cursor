
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAdminTranslation } from '@/utils/adminTranslations';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import OptimizedJourneyPlayer from './OptimizedJourneyPlayer';
import { ActiveJourney } from '@/types/journey';
import { useIsMobile } from '@/hooks/use-mobile';

interface JourneyContainerProps {
  journeyId: string;
  onComplete?: (totalPoints: number) => void;
}

const JourneyContainer: React.FC<JourneyContainerProps> = ({ journeyId, onComplete }) => {
  const { currentLanguage } = useLanguage();
  const [journey, setJourney] = useState<ActiveJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  const handleJourneyUpdate = (updatedJourney: ActiveJourney | null) => {
    setJourney(updatedJourney);
    setLoading(false);
  };

  const getHeaderTitle = () => {
    if (loading) {
      return getAdminTranslation('journey.detail.loading', currentLanguage);
    }
    if (!journey) {
      return getAdminTranslation('journey.detail.not_found', currentLanguage);
    }
    return isMobile && journey.name.length > 15 
      ? journey.name.substring(0, 15) + '...' 
      : journey.name;
  };

  const getHeaderSubtitle = () => {
    if (!journey) return undefined;
    const stepsCount = journey.steps?.length || 0;
    return `${stepsCount} étape${stepsCount > 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showBackButton 
        title={getHeaderTitle()}
        subtitle={journey ? getHeaderSubtitle() : undefined}
      />
      <div className="px-2 sm:px-0 pb-24">
        <OptimizedJourneyPlayer 
          journeyId={journeyId} 
          onComplete={onComplete}
          onJourneyUpdate={handleJourneyUpdate}
          onLoadingChange={setLoading}
        />
      </div>
      <Footer />
    </div>
  );
};

export default JourneyContainer;
