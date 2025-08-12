
import React, { useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import JourneyCard from '@/components/journey/JourneyCard';
import { UserJourneyProgress } from '@/services/userJourneysService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJourneyCards } from '@/contexts/JourneyCardsContext';
import { Sparkles, Navigation } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface OptimizedJourneyTabsContentProps {
  journeys: {
    inProgress: UserJourneyProgress[];
    completed: UserJourneyProgress[];
    saved: UserJourneyProgress[];
    abandoned: UserJourneyProgress[];
  };
  onStatusChange: () => void;
}

// Composant d'onglet vide optimisé
const EmptyTabContent = memo<{ 
  message: string; 
  actionMessage?: string; 
  actionButton?: React.ReactNode;
}>(({ message, actionMessage, actionButton }) => (
  <Card>
    <CardContent className="p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <Sparkles className="h-12 w-12 text-muted-foreground" />
        <div>
          <p className="font-medium mb-2">{message}</p>
          {actionMessage && (
            <p className="text-sm text-muted-foreground mb-4">
              {actionMessage}
            </p>
          )}
          {actionButton}
        </div>
      </div>
    </CardContent>
  </Card>
));

EmptyTabContent.displayName = 'EmptyTabContent';

// Fonction helper pour mapper correctement les variants
const getJourneyVariant = (status: string): 'saved' | 'in-progress' | 'completed' => {
  switch (status) {
    case 'saved':
      return 'saved';
    case 'in_progress': // Note : underscore dans la DB
      return 'in-progress'; // Note : tiret dans le composant
    case 'completed':
      return 'completed';
    default:
      return 'saved';
  }
};

interface JourneyGridWithControlsProps {
  journeys: UserJourneyProgress[];
  onStatusChange: () => void;
  columns?: string;
  title?: string;
}

// Grille de cartes optimisée avec contrôles d'expansion
const JourneyGridWithControls: React.FC<JourneyGridWithControlsProps> = memo(({ 
  journeys, 
  onStatusChange, 
  title,
  columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
}) => {
  const { expandAllCards, collapseAllCards } = useJourneyCards();
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between">
        {title && (
          <h3 className="text-lg font-semibold">{title}</h3>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => expandAllCards(journeys.map(j => j.id))}
            className="text-xs"
          >
            <Navigation className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">Tout déployer</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAllCards}
            className="text-xs"
          >
            <Navigation className="h-3 w-3 sm:mr-1 rotate-90" />
            <span className="hidden sm:inline">Tout replier</span>
          </Button>
        </div>
      </div>
      
      {/* Grille de cartes */}
      <div className={`grid ${columns} gap-6`}>
        {journeys.map((journey) => {
          const variant = getJourneyVariant(journey.status);
          return (
            <JourneyCard
              key={journey.id}
              journey={journey}
              variant={variant}
              onStatusChange={onStatusChange}
            />
          );
        })}
      </div>
    </div>
  );
});

JourneyGridWithControls.displayName = 'JourneyGridWithControls';

const OptimizedJourneyTabsContent: React.FC<OptimizedJourneyTabsContentProps> = memo(({ 
  journeys, 
  onStatusChange 
}) => {
  const { t } = useLanguage();
  const { expandAllCards, collapseAllCards } = useJourneyCards();

  const handleStatusChange = useCallback(() => {
    onStatusChange();
  }, [onStatusChange]);

  return (
    <>
      {/* Parcours sauvegardés - onglet optimisé */}
      <TabsContent value="saved" className="space-y-6">
        {journeys.saved.length === 0 ? (
          <EmptyTabContent
            message={t('no_saved_journeys')}
            actionMessage={t('create_first_ai_journey')}
            actionButton={
              <Link to="/cities">
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('discover_destinations')}
                </Button>
              </Link>
            }
          />
        ) : (
          <JourneyGridWithControls 
            journeys={journeys.saved} 
            onStatusChange={handleStatusChange}
            title="Parcours sauvegardés"
          />
        )}
      </TabsContent>

      {/* Parcours en cours - onglet optimisé */}
      <TabsContent value="in-progress" className="space-y-6">
        {journeys.inProgress.length === 0 ? (
          <EmptyTabContent message={t('my_journeys.no_data')} />
        ) : (
          <JourneyGridWithControls 
            journeys={journeys.inProgress} 
            onStatusChange={handleStatusChange}
            columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            title="Parcours en cours"
          />
        )}
      </TabsContent>

      {/* Parcours terminés - onglet optimisé */}
      <TabsContent value="completed" className="space-y-6">
        {journeys.completed.length === 0 ? (
          <EmptyTabContent message={t('my_journeys.no_data')} />
        ) : (
          <JourneyGridWithControls 
            journeys={journeys.completed} 
            onStatusChange={handleStatusChange}
            columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            title="Parcours terminés"
          />
        )}
      </TabsContent>
    </>
  );
});

OptimizedJourneyTabsContent.displayName = 'OptimizedJourneyTabsContent';

export default OptimizedJourneyTabsContent;
