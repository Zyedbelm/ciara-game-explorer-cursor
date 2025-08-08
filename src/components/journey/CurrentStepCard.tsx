
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Navigation,
  CheckCircle,
  Clock,
  Trophy,
  Zap,
  Map
} from 'lucide-react';
import SimpleGoogleMap from '@/components/maps/SimpleGoogleMap';
import MapErrorBoundary from '@/components/maps/MapErrorBoundary';
import UnifiedAudioChatWidget from '@/components/chat/UnifiedAudioChatWidget';
import { usePerformanceLogger } from '@/hooks/usePerformanceLogger';
import { JourneyStep } from '@/types/journey';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface CurrentStepCardProps {
  currentStep: JourneyStep;
  isStepCompleted: boolean;
  location: LocationCoords | null;
  validatingStep: boolean;
  onRequestLocation: () => void;
  onValidateStep: () => void;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  allSteps?: JourneyStep[];
  currentStepIndex?: number;
}

const CurrentStepCard: React.FC<CurrentStepCardProps> = ({
  currentStep,
  isStepCompleted,
  location,
  validatingStep,
  onRequestLocation,
  onValidateStep,
  calculateDistance,
  allSteps = [],
  currentStepIndex = 0
}) => {
  const { t } = useLanguage();
  const { measure, startTimer, endTimer } = usePerformanceLogger({
    component: 'CurrentStepCard',
    threshold: 50
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {isStepCompleted ? (
            <CheckCircle className="h-5 w-5 text-success" />
          ) : (
            <MapPin className="h-5 w-5 text-primary" />
          )}
          <span className="flex-1 min-w-0 truncate">{currentStep.name}</span>
          {!isStepCompleted && (
            <div className="flex items-center gap-2">
              {currentStep.has_quiz && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 hidden sm:inline-flex">
                  Quiz
                </Badge>
              )}
              <Badge className="">
                <Trophy className="h-3 w-3 mr-1" />
                {currentStep.points_awarded} pts
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{currentStep.description}</p>

        {/* Interactive Map */}
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            <span className="text-sm font-medium">Parcours complet</span>
          </div>
          
          {/* Légende des couleurs */}
          <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-success rounded"></div>
              <span className="text-muted-foreground">Votre trajet vers la première étape</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-destructive rounded"></div>
              <span className="text-muted-foreground">Parcours planifié</span>
            </div>
          </div>
          
          <div className="h-[500px] w-full rounded-lg overflow-hidden border transition-all duration-300 hover:shadow-lg">
            <MapErrorBoundary>
              <SimpleGoogleMap
                center={{
                  lat: currentStep.latitude,
                  lng: currentStep.longitude
                }}
                zoom={15}
                markers={allSteps.length > 0 ? allSteps.map((step, index) => ({
                  position: {
                    lat: step.latitude,
                    lng: step.longitude
                  },
                  title: step.name,
                  info: step.description,
                  isCurrentStep: index === currentStepIndex
                })) : [
                  {
                    position: {
                      lat: currentStep.latitude,
                      lng: currentStep.longitude
                    },
                    title: currentStep.name,
                    info: currentStep.description,
                    isCurrentStep: true
                  }
                ]}
                userLocation={location ? {
                  lat: location.latitude,
                  lng: location.longitude
                } : null}
                className="h-full w-full"
              />
            </MapErrorBoundary>
          </div>
        </div>

        {/* Location Actions - Only show if step is not completed */}
        {!isStepCompleted && (
          <div className="flex flex-col sm:flex-row gap-2">
            {!location && (
              <Button onClick={onRequestLocation} variant="outline" className="sm:flex-1">
                <Navigation className="mr-2 h-4 w-4" />
                Activer la géolocalisation
              </Button>
            )}
            
            {location && (
              <Button 
                onClick={onValidateStep}
                disabled={validatingStep}
                className="sm:flex-1 sm:px-6 px-4 rounded-full"
              >
                {validatingStep ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Validation en cours...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    J'y suis
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Completed step message with enhanced UI */}
        {isStepCompleted && (
          <div className="space-y-3">
            {/* Success message */}
            <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-green-700 font-medium">
                  Étape terminée !
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <Trophy className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs text-green-600">
                    +{currentStep.points_awarded} points gagnés
                  </span>
                </div>
              </div>
            </div>
            
            {/* Next steps info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700">
                <div className="font-medium mb-1">Prochaines étapes :</div>
                <ul className="text-xs space-y-1 text-blue-600">
                  <li>• Continuez vers l'étape suivante</li>
                  <li>• Découvrez les quiz pour gagner des points bonus</li>
                  <li>• Consultez l'assistant IA pour plus d'informations</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Distance indicator */}
        {location && currentStep && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Distance: {Math.round(calculateDistance(
              location.latitude,
              location.longitude,
              currentStep.latitude,
              currentStep.longitude
            ))}m
          </div>
        )}
      </CardContent>
      
      {/* Chat IA contextuel pour découvrir l'étape */}
      <UnifiedAudioChatWidget
        currentJourney={`Étape: ${currentStep.name}`}
        currentStep={currentStep}
        userLocation={location ? {
          lat: location.latitude,
          lng: location.longitude
        } : undefined}
        isInJourney={true}
      />
    </Card>
  );
};

export default CurrentStepCard;
