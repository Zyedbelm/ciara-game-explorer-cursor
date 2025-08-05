
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import SimpleGoogleMap from '@/components/maps/SimpleGoogleMap';
import {
  Clock,
  MapPin,
  Trophy,
  Star,
  Users,
  Route,
  Target,
  Play,
  Navigation,
  Zap
} from 'lucide-react';
import { JourneyDetail } from '@/types/journey';
import { useLanguage } from '@/contexts/LanguageContext';

interface JourneyOverviewProps {
  journey: JourneyDetail;
  location?: { lat: number; lng: number } | null;
  user: any;
  startingJourney: boolean;
  onStartJourney: () => void;
  onRequestLocation: () => void;
}

const JourneyOverview: React.FC<JourneyOverviewProps> = ({
  journey,
  location,
  user,
  startingJourney,
  onStartJourney,
  onRequestLocation
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
      case 'easy': return 'from-green-500 to-green-600';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-red-500 to-red-600';
      case 'expert': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const mapCenter = {
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

  const handleAuthRedirect = () => {
    navigate('/auth');
  };

  return (
    <div className="space-y-6">
      {/* Hero Section avec Carte Intégrée */}
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Background Map */}
          <div className="h-80 relative">
            <SimpleGoogleMap
              center={mapCenter}
              zoom={13}
              markers={mapMarkers}
              userLocation={location}
              className="h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
          
          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`bg-gradient-to-r ${getDifficultyColor(journey.difficulty)} text-white border-0`}>
                    {journey.difficulty.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <Target className="h-3 w-3 mr-1" />
                    {journey.steps.length} {t('journey.steps')}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{journey.name}</h1>
                <p className="text-lg opacity-90 max-w-2xl">{journey.description}</p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex gap-4 md:flex-col md:items-end">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatDuration(journey.estimated_duration)}</div>
                  <div className="text-xs opacity-75">{t('journey.overview.duration').toUpperCase()}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{journey.distance_km}km</div>
                  <div className="text-xs opacity-75">{t('journey.overview.distance').toUpperCase()}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{journey.total_points}</div>
                  <div className="text-xs opacity-75">{t('journey.overview.points').toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats détaillées et étapes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {t('journey.overview.statistics')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-xl font-bold">{formatDuration(journey.estimated_duration)}</div>
                  <div className="text-sm text-muted-foreground">{t('journey.overview.estimated_time')}</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Route className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-xl font-bold">{journey.distance_km} km</div>
                  <div className="text-sm text-muted-foreground">{t('journey.overview.total_distance')}</div>
                </div>
            </div>
            
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{t('journey.overview.possible_points')}</span>
                  <span className="font-semibold">{journey.total_points} pts</span>
                </div>
                <Progress value={100} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {t('journey.overview.points_info')}
                </div>
              </div>
          </CardContent>
        </Card>

        {/* Aperçu des étapes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {t('journey.overview.steps_preview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {journey.steps.slice(0, 5).map((step, index) => (
                <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{step.name}</div>
                    <div className="text-xs text-muted-foreground">{step.points_awarded} points</div>
                  </div>
                </div>
              ))}
              {journey.steps.length > 5 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  ... {t('journey.overview.and')} {journey.steps.length - 5} {t('journey.overview.other_steps')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action principale */}
      {user ? (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="text-center p-8">
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">🎯 {t('journey.overview.ready_for_adventure')}</h3>
                <p className="text-muted-foreground">
                  {t('journey.overview.adventure_description')}
                </p>
              </div>
              
              <div className="space-y-3">
                {!location && (
                    <Button 
                      variant="outline" 
                      onClick={onRequestLocation}
                      className="w-full"
                      size="lg"
                    >
                      <Navigation className="mr-2 h-5 w-5" />
                      {t('journey.step.activate_location')}
                    </Button>
                )}
                
                <Button 
                  size="lg" 
                  onClick={onStartJourney} 
                  className="w-full text-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                  disabled={startingJourney}
                >
                  {startingJourney ? (
                    <>
                      <Zap className="mr-2 h-6 w-6 animate-pulse" />
                      {t('journey.overview.starting')}
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-6 w-6" />
                      {t('journey.overview.start_adventure')}
                    </>
                  )}
                </Button>
              </div>
              
              {location && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {t('journey.overview.location_active')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200">
          <CardContent className="text-center p-8">
            <div className="max-w-md mx-auto space-y-4">
              <Users className="h-12 w-12 text-orange-500 mx-auto" />
              <h3 className="text-xl font-bold">{t('journey.overview.login_to_participate')}</h3>
              <p className="text-muted-foreground">
                {t('journey.overview.login_description')}
              </p>
              <Button size="lg" className="w-full" onClick={handleAuthRedirect}>
                {t('journey.overview.login_signup')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JourneyOverview;
