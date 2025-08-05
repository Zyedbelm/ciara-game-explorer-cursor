
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import JourneyCard from '@/components/journey/JourneyCard';
import { UserJourneyProgress } from '@/services/userJourneysService';
import { useLanguage } from '@/contexts/LanguageContext';
import { myJourneysTranslations } from '@/utils/myJourneysTranslations';
import { Sparkles } from 'lucide-react';

interface JourneyTabsContentProps {
  journeys: {
    inProgress: UserJourneyProgress[];
    completed: UserJourneyProgress[];
    saved: UserJourneyProgress[];
    abandoned: UserJourneyProgress[];
  };
  onStatusChange: () => void;
}

const JourneyTabsContent: React.FC<JourneyTabsContentProps> = ({ 
  journeys, 
  onStatusChange 
}) => {
  const { currentLanguage, t: dbT } = useLanguage();

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    // First try to get from database translations
    const dbTranslation = dbT(key);
    if (dbTranslation !== key) {
      return dbTranslation;
    }
    
    // Fallback to local translations
    let translation = myJourneysTranslations[currentLanguage]?.[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{${paramKey}}`, String(value));
      });
    }
    
    return translation;
  }, [currentLanguage, dbT]);

  return (
    <>
      {/* Parcours sauvegardés */}
      <TabsContent value="saved" className="space-y-6">
        {journeys.saved.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <Sparkles className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-medium mb-2">{t('no_saved_journeys')}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('create_first_ai_journey')}
                  </p>
                  <Link to="/cities">
                    <Button>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t('discover_destinations')}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {journeys.saved.map((journey) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                variant="saved"
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Parcours en cours */}
      <TabsContent value="in-progress" className="space-y-6">
        {journeys.inProgress.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">{t('my_journeys.no_data')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {journeys.inProgress.map((journey) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                variant="in-progress"
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Parcours terminés */}
      <TabsContent value="completed" className="space-y-6">
        {journeys.completed.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">{t('my_journeys.no_data')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {journeys.completed.map((journey) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                variant="completed"
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </>
  );
};

export default JourneyTabsContent;
