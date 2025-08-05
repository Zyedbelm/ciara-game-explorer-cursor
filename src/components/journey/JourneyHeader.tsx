
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import { ActiveJourney } from '@/types/journey';
import { useLanguage } from '@/contexts/LanguageContext';

interface JourneyHeaderProps {
  journey: ActiveJourney;
}

const JourneyHeader: React.FC<JourneyHeaderProps> = ({ journey }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // S'assurer que completedSteps est un tableau et filtrer les valeurs valides
  const validCompletedSteps = Array.isArray(journey.completedSteps) 
    ? journey.completedSteps.filter(step => typeof step === 'number' && step >= 0) 
    : [];
  const progress = journey.steps.length > 0 ? (validCompletedSteps.length / journey.steps.length) * 100 : 0;

  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div>
            <CardTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-xl">
              <Target className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">{journey.name}</span>
            </CardTitle>
            <div className="relative">
              <CardDescription className={`text-xs sm:text-sm ${!isExpanded ? 'line-clamp-2 sm:line-clamp-none' : ''}`}>
                {journey.description}
              </CardDescription>
              {/* Afficher le bouton uniquement sur mobile quand le texte est long */}
              <div className="sm:hidden">
                {journey.description && journey.description.length > 100 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground mt-1"
                  >
                    {isExpanded ? (
                      <>
                        Voir moins <ChevronUp className="ml-1 h-3 w-3" />
                      </>
                    ) : (
                      <>
                        Voir plus <ChevronDown className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto text-xs whitespace-nowrap">
            Étape {Math.min(journey.currentStepIndex + 1, journey.steps.length)}/{journey.steps.length}
          </Badge>
        </div>
        <div className="space-y-1 sm:space-y-2 mt-2 sm:mt-0">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>{t('journey.progression')}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 sm:h-2" />
        </div>
      </CardHeader>
    </Card>
  );
};

export default JourneyHeader;
