
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Map, 
  List, 
  MessageCircle, 
  Trophy,
  Clock,
  MapPin,
  Star
} from 'lucide-react';
import SimpleGoogleMap from '@/components/maps/SimpleGoogleMap';
import { JourneyDetail } from '@/types/journey';

interface JourneyTabsProps {
  journey: JourneyDetail;
  currentStep?: any;
  location?: { lat: number; lng: number } | null;
}

const JourneyTabs: React.FC<JourneyTabsProps> = ({ 
  journey, 
  currentStep,
  location 
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      case 'expert': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Tabs defaultValue="map" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="overview" className="flex items-center gap-1">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Vue</span>
        </TabsTrigger>
        <TabsTrigger value="map" className="flex items-center gap-1 bg-primary/10 text-primary font-semibold">
          <Map className="h-4 w-4" />
          <span className="hidden sm:inline">🗺️ Carte</span>
        </TabsTrigger>
        <TabsTrigger value="steps" className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Étapes</span>
        </TabsTrigger>
        <TabsTrigger value="quiz" className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Quiz</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Hero Section */}
        <Card className="overflow-hidden">
          <div className="relative h-48 bg-gradient-alpine">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative h-full flex items-center p-6">
              <div className="text-white">
                <h1 className="text-2xl md:text-4xl font-bold mb-2">{journey.name}</h1>
                <p className="text-sm md:text-xl opacity-90">{journey.description}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <div className="text-lg font-bold">{formatDuration(journey.estimated_duration)}</div>
                <div className="text-xs text-muted-foreground">Durée</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <div className="text-lg font-bold">{journey.distance_km} km</div>
                <div className="text-xs text-muted-foreground">Distance</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Trophy className="h-6 w-6 text-primary" />
              <div>
                <div className="text-lg font-bold">{journey.total_points}</div>
                <div className="text-xs text-muted-foreground">Points</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Star className="h-6 w-6 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getDifficultyColor(journey.difficulty)}`}></div>
                  <span className="text-lg font-bold capitalize">{journey.difficulty}</span>
                </div>
                <div className="text-xs text-muted-foreground">Difficulté</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="map" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Carte du Parcours Interactive
            </CardTitle>
            <CardDescription>
              La carte devrait s'afficher automatiquement. Si vous voyez ce message, vérifiez les logs de la console.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {(() => {
                const mapCenter = currentStep ? {
                  lat: currentStep.latitude,
                  lng: currentStep.longitude
                } : {
                  lat: journey.steps[0]?.latitude || 46.5197,
                  lng: journey.steps[0]?.longitude || 6.6323
                };
                
                const mapMarkers = journey.steps.map((step, index) => ({
                  position: {
                    lat: step.latitude,
                    lng: step.longitude
                  },
                  title: `${index + 1}. ${step.name}`,
                  info: step.description
                }));

                && !isNaN(m.position.lng)
                  )
                });

                return (
                  <SimpleGoogleMap
                    center={mapCenter}
                    zoom={14}
                    markers={mapMarkers}
                    userLocation={location}
                    className="h-full w-full rounded-lg"
                  />
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="steps" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Étapes du Parcours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {journey.steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{step.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{step.description}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {step.points_awarded} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="quiz" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quiz et Défis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quiz disponibles</h3>
              <p className="text-muted-foreground mb-4">
                Répondez aux quiz à chaque étape pour gagner des points bonus !
              </p>
              <div className="grid gap-4">
                {journey.steps.filter(step => step.has_quiz).map((step, index) => (
                  <div key={step.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{step.name}</h4>
                    <p className="text-sm text-muted-foreground">Quiz disponible à cette étape</p>
                  </div>
                ))}
                {journey.steps.filter(step => step.has_quiz).length === 0 && (
                  <p className="text-muted-foreground">Aucun quiz disponible pour ce parcours</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default JourneyTabs;
