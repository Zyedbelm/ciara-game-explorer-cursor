
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, MapPin, Trophy, Clock, HelpCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface JourneyStep {
  id: string;
  name: string;
  description: string | null;
  points_awarded: number;
  validation_radius: number;
  has_quiz: boolean;
}

interface JourneyStepsListProps {
  steps: JourneyStep[];
  isOpen: boolean;
  onToggle: () => void;
  estimatedDuration?: number | null;
}

const JourneyStepsList: React.FC<JourneyStepsListProps> = ({
  steps,
  isOpen,
  onToggle,
  estimatedDuration
}) => {
  const isMobile = useIsMobile();

  const truncateDescription = (description: string, maxLength: number = 60) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between p-2 h-auto hover:bg-muted/50"
        >
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">{steps.length} étapes</span>
          </div>
          <ChevronDown 
            className={`h-4 w-4 transition-transform duration-200 text-muted-foreground ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-0 mt-2 animate-accordion-down">
        <div className="border-l-2 border-primary/20 ml-3 pl-3 space-y-3 max-h-48 overflow-y-auto">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className="relative group"
            >
              <div className="absolute -left-5 top-2 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-sm"></div>
              
              <div className={`space-y-${isMobile ? '2' : '1'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm text-foreground line-clamp-1 ${isMobile ? 'leading-5' : ''}`}>
                      {index + 1}. {step.name}
                    </h4>
                    {step.description && (
                      <p className={`text-xs text-muted-foreground mt-1 leading-relaxed ${
                        isMobile ? 'line-clamp-2' : 'line-clamp-2'
                      }`}>
                        {isMobile ? truncateDescription(step.description, 50) : step.description}
                      </p>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-1.5 flex-shrink-0 ${isMobile ? 'flex-col' : ''}`}>
                    {step.has_quiz && (
                      <Badge variant="secondary" className={`text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 ${isMobile ? 'mb-1' : ''}`}>
                        <HelpCircle className="h-2.5 w-2.5 mr-1" />
                        Quiz
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs font-medium text-primary">
                      <Trophy className="h-3 w-3" />
                      <span>{step.points_awarded}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary footer */}
        <div className={`mt-3 pt-2 border-t border-muted/30 ${isMobile ? 'px-1' : ''}`}>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total des points disponibles</span>
            <div className="flex items-center gap-1 font-medium text-primary">
              <Trophy className="h-3 w-3" />
              <span>{steps.reduce((total, step) => total + step.points_awarded, 0)}</span>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default JourneyStepsList;
