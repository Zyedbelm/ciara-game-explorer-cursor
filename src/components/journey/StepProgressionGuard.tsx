import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Lock, AlertTriangle, Navigation } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StepProgressionGuardProps {
  isOpen: boolean;
  onClose: () => void;
  onForceUnlock: () => void;
  stepName: string;
  stepIndex: number;
  currentStepIndex: number;
  missedSteps: number;
  allowForceProgression?: boolean;
}

export const StepProgressionGuard: React.FC<StepProgressionGuardProps> = ({
  isOpen,
  onClose,
  onForceUnlock,
  stepName,
  stepIndex,
  currentStepIndex,
  missedSteps,
  allowForceProgression = true
}) => {
  const { currentLanguage } = useLanguage();

  const getTitle = () => {
    if (currentLanguage === 'en') return 'Step Locked';
    if (currentLanguage === 'de') return 'Schritt Gesperrt';
    return 'Étape Verrouillée';
  };

  const getDescription = () => {
    if (currentLanguage === 'en') {
      return `You must complete ${missedSteps} previous step${missedSteps > 1 ? 's' : ''} before accessing "${stepName}". This ensures you don't miss important points and content.`;
    }
    if (currentLanguage === 'de') {
      return `Sie müssen ${missedSteps} vorherige${missedSteps > 1 ? ' Schritte' : 'n Schritt'} abschließen, bevor Sie auf "${stepName}" zugreifen können. Dies stellt sicher, dass Sie keine wichtigen Punkte und Inhalte verpassen.`;
    }
    return `Vous devez compléter ${missedSteps} étape${missedSteps > 1 ? 's' : ''} précédente${missedSteps > 1 ? 's' : ''} avant d'accéder à "${stepName}". Cela garantit que vous ne manquez pas de points et de contenu importants.`;
  };

  const getForceUnlockWarning = () => {
    if (currentLanguage === 'en') {
      return 'Warning: Skipping steps will cause you to lose potential points and miss important information.';
    }
    if (currentLanguage === 'de') {
      return 'Warnung: Das Überspringen von Schritten führt dazu, dass Sie potenzielle Punkte verlieren und wichtige Informationen verpassen.';
    }
    return 'Attention : Sauter des étapes vous fera perdre des points potentiels et manquer des informations importantes.';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-orange-500" />
            <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>{getDescription()}</p>
            
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Navigation className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {currentLanguage === 'en' ? 'Progression' : 
                   currentLanguage === 'de' ? 'Fortschritt' : 'Progression'}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {currentLanguage === 'en' ? 'Current' : 
                     currentLanguage === 'de' ? 'Aktuell' : 'Actuelle'}: {currentStepIndex + 1}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {currentLanguage === 'en' ? 'Requested' : 
                     currentLanguage === 'de' ? 'Angefragt' : 'Demandée'}: {stepIndex + 1}
                  </Badge>
                </div>
              </div>
            </div>

            {allowForceProgression && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">
                  {getForceUnlockWarning()}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col gap-2">
          <AlertDialogCancel className="w-full">
            {currentLanguage === 'en' ? 'Go Back' : 
             currentLanguage === 'de' ? 'Zurück' : 'Retour'}
          </AlertDialogCancel>
          
          {allowForceProgression && (
            <AlertDialogAction 
              onClick={onForceUnlock}
              className="w-full bg-destructive hover:bg-destructive/90"
            >
              {currentLanguage === 'en' ? 'Skip Steps (Lose Points)' : 
               currentLanguage === 'de' ? 'Schritte Überspringen (Punkte Verlieren)' : 
               'Ignorer les Étapes (Perdre des Points)'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};