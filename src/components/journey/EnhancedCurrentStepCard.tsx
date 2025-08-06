import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import SimpleGoogleMap from '@/components/maps/SimpleGoogleMap';
import QuizModal from '@/components/journey/QuizModal';
import {
  MapPin,
  Navigation,
  CheckCircle,
  Trophy,
  MessageCircle,
  Zap,
  Map,
  Route,
  Target,
  ArrowRight,
  Clock,
  AlertCircle,
  Navigation2
} from 'lucide-react';
import { JourneyStep } from '@/types/journey';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface EnhancedCurrentStepCardProps {
  currentStep: JourneyStep;
  isStepCompleted: boolean;
  location: LocationCoords | null;
  validatingStep: boolean;
  onRequestLocation: () => void;
  onValidateStep: () => void;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  nextStep?: JourneyStep;
  stepIndex: number;
  totalSteps: number;
}

const EnhancedCurrentStepCard: React.FC<EnhancedCurrentStepCardProps> = ({
  currentStep,
  isStepCompleted,
  location,
  validatingStep,
  onRequestLocation,
  onValidateStep,
  calculateDistance,
  nextStep,
  stepIndex,
  totalSteps
}) => {
  const [showDirections, setShowDirections] = useState(false);
  
  const distance = location ? Math.round(calculateDistance(
    location.latitude,
    location.longitude,
    currentStep.latitude,
    currentStep.longitude
  )) : null;

  const isNearby = distance ? distance <= (currentStep.validation_radius || 50) : false;
  
  const getDistanceStatus = () => {
    if (!distance) return null;
    if (distance <= 20) return { text: 'Vous y êtes !', color: 'text-green-600', icon: Target };
    if (distance <= 50) return { text: 'Très proche', color: 'text-blue-600', icon: Navigation };
    if (distance <= 150) return { text: 'À proximité', color: 'text-orange-600', icon: ArrowRight };
    return { text: 'En route', color: 'text-gray-600', icon: Route };
  };

  const distanceStatus = getDistanceStatus();

  const handleQuizComplete = (points: number) => {
    };

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${currentStep.latitude},${currentStep.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                {stepIndex + 1}
              </div>
              <div>
                <div className="font-semibold">Étape {stepIndex + 1} sur {totalSteps}</div>
                <div className="text-sm text-muted-foreground">Parcours en cours</div>
              </div>
            </div>
            {!isStepCompleted && (
              <Badge className="bg-primary/20 text-primary">
                <Trophy className="h-3 w-3 mr-1" />
                {currentStep.points_awarded} pts
              </Badge>
            )}
          </div>
          <Progress value={(stepIndex / totalSteps) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Main Step Card */}
      <Card className={isStepCompleted ? 'border-green-500 bg-green-50/50' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isStepCompleted ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <Target className="h-6 w-6 text-primary" />
            )}
            <div className="flex-1">
              <div>{currentStep.name}</div>
              {isStepCompleted && (
                <div className="text-sm font-normal text-green-600">✅ Étape complétée !</div>
              )}
            </div>
            
            {/* Quiz Button dans le header */}
            {currentStep.has_quiz && (
              <QuizModal
                stepId={currentStep.id}
                stepName={currentStep.name}
                onQuizComplete={handleQuizComplete}
                trigger={
                  <Button 
                    variant={isStepCompleted ? "secondary" : "default"} 
                    size="sm"
                    className={`gap-2 ${isStepCompleted ? 'opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    disabled={!isStepCompleted}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Quiz
                  </Button>
                }
              />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{currentStep.description}</p>

          {/* Location Status */}
          {location && distanceStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-lg bg-muted/50 ${distanceStatus.color}`}>
              <distanceStatus.icon className="h-5 w-5" />
              <div className="flex-1">
                <div className="font-medium">{distanceStatus.text}</div>
                <div className="text-sm opacity-75">Distance: {distance}m</div>
              </div>
              {!isNearby && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openDirections}
                  className="gap-1"
                >
                  <Navigation2 className="h-4 w-4" />
                  Itinéraire
                </Button>
              )}
            </div>
          )}

          {/* Interactive Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                <span className="font-medium">Localisation</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDirections(!showDirections)}
              >
                {showDirections ? 'Masquer' : 'Afficher'} la carte
              </Button>
            </div>
            
            {showDirections && (
              <div className="h-64 w-full rounded-lg overflow-hidden border">
                <SimpleGoogleMap
                  center={{
                    lat: currentStep.latitude,
                    lng: currentStep.longitude
                  }}
                  zoom={16}
                  markers={[
                    {
                      position: {
                        lat: currentStep.latitude,
                        lng: currentStep.longitude
                      },
                      title: currentStep.name,
                      info: currentStep.description
                    }
                  ]}
                  userLocation={location ? {
                    lat: location.latitude,
                    lng: location.longitude
                  } : null}
                  className="h-full w-full"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!location ? (
              <Button 
                onClick={onRequestLocation} 
                variant="outline" 
                className="w-full gap-2"
                size="lg"
              >
                <Navigation className="h-5 w-5" />
                Activer la Géolocalisation
              </Button>
            ) : !isStepCompleted ? (
              <div className="space-y-2">
                <Button 
                  onClick={onValidateStep}
                  disabled={validatingStep || !isNearby}
                  className={`w-full gap-2 ${isNearby ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  size="lg"
                >
                  {validatingStep ? (
                    <>
                      <Clock className="h-5 w-5 animate-spin" />
                      Validation en cours...
                    </>
                  ) : isNearby ? (
                    <>
                      <Zap className="h-5 w-5" />
                      🎯 Je suis Arrivé !
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5" />
                      Rapprochez-vous pour valider ({distance}m)
                    </>
                  )}
                </Button>
                
                {!isNearby && (
                  <div className="text-xs text-center text-muted-foreground">
                    Vous devez être à moins de {currentStep.validation_radius || 50}m pour valider cette étape
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-green-600 font-medium mb-2">🎉 Étape Validée !</div>
                {nextStep && (
                  <div className="text-sm text-muted-foreground">
                    Prochaine étape : <span className="font-medium">{nextStep.name}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCurrentStepCard;