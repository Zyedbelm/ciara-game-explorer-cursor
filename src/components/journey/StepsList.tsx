
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Brain, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { ActiveJourney } from '@/types/journey';
import QuizModal from './QuizModal';
import { StepProgressionGuard } from './StepProgressionGuard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStepQuizPoints } from '@/hooks/useStepQuizPoints';

interface StepsListProps {
  journey: ActiveJourney;
  onStepClick?: (stepIndex: number) => void;
  onForceStepSkip?: (stepIndex: number) => void;
}

// Component pour gérer les points du quiz individuellement
const QuizPointsDisplay: React.FC<{ stepId: string; isMobile: boolean }> = ({ stepId, isMobile }) => {
  const { quizPoints } = useStepQuizPoints(stepId);
  
  return (
    <>
      <span className={`ml-1 ${isMobile ? 'text-2xs' : 'text-xs'} font-medium text-purple-700 group-hover:text-purple-800`}>
        Quiz
      </span>
      {quizPoints > 0 && (
        <span className={`ml-1 ${isMobile ? 'text-2xs' : 'text-2xs'} font-medium text-purple-600 group-hover:text-purple-700`}>
          (+{quizPoints} pts)
        </span>
      )}
    </>
  );
};

const StepsList: React.FC<StepsListProps> = ({ journey, onStepClick, onForceStepSkip }) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [guardState, setGuardState] = useState<{
    isOpen: boolean;
    targetStepIndex: number;
    stepName: string;
    missedSteps: number;
  }>({
    isOpen: false,
    targetStepIndex: 0,
    stepName: '',
    missedSteps: 0
  });
  
  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const truncateDescription = (description: string, maxLength: number = 80) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const handleStepClick = (stepIndex: number) => {
    const targetStep = journey.steps[stepIndex];
    const currentIndex = journey.currentStepIndex;
    
    // Check if user is trying to access a step beyond what they should have access to
    // Allow access if:
    // 1. It's the current step or a previous step
    // 2. It's the next step after the current one (even if currentIndex hasn't been updated yet)
    // 3. All previous steps have been completed
    const canAccess = 
      stepIndex <= currentIndex || // Current or previous step
      stepIndex === currentIndex + 1 || // Next logical step
      journey.completedSteps?.includes(stepIndex) || // Already completed
      (stepIndex > 0 && journey.completedSteps?.includes(stepIndex - 1)); // Previous step is completed
    
    if (!canAccess) {
      const missedSteps = stepIndex - currentIndex;
      setGuardState({
        isOpen: true,
        targetStepIndex: stepIndex,
        stepName: targetStep.name,
        missedSteps
      });
      return;
    }
    
    // Otherwise, allow normal navigation
    onStepClick?.(stepIndex);
  };

  const handleForceUnlock = () => {
    onForceStepSkip?.(guardState.targetStepIndex);
    setGuardState(prev => ({ ...prev, isOpen: false }));
  };

  const closeGuard = () => {
    setGuardState(prev => ({ ...prev, isOpen: false }));
  };
  
  return (
    <Card>
      <CardHeader className={isMobile ? 'pb-4' : undefined}>
        <CardTitle className={isMobile ? 'text-lg' : undefined}>{t('journey.steps_list.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`space-y-${isMobile ? '4' : '3'}`}>
          {journey.steps.map((step, index) => {
            const isCompleted = journey.completedSteps?.includes(index) || false;
            const isCurrent = index === journey.currentStepIndex;
            const isExpanded = expandedSteps.has(step.id);
            const hasLongDescription = step.description && step.description.length > 80;
            
            // Debug logging for step completion state
            if (index === 0) {
              console.log('🔍 Steps completion debug:', {
                journeyCompletedSteps: journey.completedSteps,
                currentStepIndex: journey.currentStepIndex,
                totalSteps: journey.steps.length
              });
            }
            
            return (
              <div
                key={step.id}
                className={`flex flex-col gap-3 p-${isMobile ? '4' : '3'} rounded-lg border transition-all duration-200 hover:shadow-md ${
                  isCompleted ? 'border-green-300 bg-green-50/80 opacity-90' : 
                  isCurrent ? 'border-primary bg-primary/5 shadow-sm' : 'border-border'
                }`}
              >
                <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-3'}`}>
                  <div className={`flex items-center gap-3 ${isMobile ? 'w-full' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-green-500 text-white' : 
                      isCurrent ? 'bg-primary text-white' : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    <div 
                      className="flex-1 cursor-pointer min-w-0"
                      onClick={() => handleStepClick(index)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-semibold ${
                          isCompleted ? 'text-gray-500 line-through decoration-2 decoration-gray-600' : 'text-foreground'
                        } ${
                          isMobile ? 'text-base leading-tight line-clamp-2' : 'text-sm line-clamp-1'
                        }`}>
                          {step.name}
                        </h4>
                        
                        {/* Points de l'étape à droite du titre */}
                        <Badge variant={isCompleted ? 'default' : 'outline'} className={`${isMobile ? 'text-xs px-2 py-0.5' : ''} flex-shrink-0`}>
                          {step.points_awarded} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                   {/* Bouton Quiz - affiché seulement si l'étape a un quiz */}
                   <div className={`flex items-center gap-2 ${
                     isMobile ? 'justify-end ml-11' : 'flex-shrink-0'
                   }`}>
                     {step.has_quiz && (
                       <QuizModal
                         stepId={step.id}
                         stepName={step.name}
                         trigger={
                           <Button
                             variant="outline"
                             size={isMobile ? "sm" : "sm"}
                             className="group relative overflow-hidden bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-300/50 hover:border-purple-400 hover:shadow-md hover:scale-105 transition-all duration-200"
                             onClick={(e) => e.stopPropagation()}
                           >
                             <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 to-pink-500/40 opacity-30 group-hover:opacity-60 transition-opacity duration-200"></div>
                              <Sparkles className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-pink-500 animate-pulse`} />
                              <QuizPointsDisplay stepId={step.id} isMobile={isMobile} />
                           </Button>
                         }
                       />
                     )}
                   </div>
                </div>

                {/* Description avec expand/collapse sur mobile */}
                {step.description && (
                  <div className="ml-11">
                    <p className={`leading-relaxed ${
                      isCompleted ? 'text-muted-foreground/50' : 'text-muted-foreground'
                    } ${
                      isMobile ? 'text-sm' : ''
                    }`}>
                      {isMobile && hasLongDescription && !isExpanded 
                        ? truncateDescription(step.description)
                        : step.description
                      }
                    </p>
                    
                    {isMobile && hasLongDescription && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStepExpansion(step.id)}
                        className="mt-2 p-0 h-auto font-normal text-xs text-primary hover:bg-transparent"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Voir moins
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Voir plus
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
      
      {/* Step Progression Guard */}
      <StepProgressionGuard
        isOpen={guardState.isOpen}
        onClose={closeGuard}
        onForceUnlock={handleForceUnlock}
        stepName={guardState.stepName}
        stepIndex={guardState.targetStepIndex}
        currentStepIndex={journey.currentStepIndex}
        missedSteps={guardState.missedSteps}
        allowForceProgression={true}
      />
    </Card>
  );
};

export default StepsList;
