import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Clock, Trophy, ArrowRight } from 'lucide-react';

interface MyJourneyBannerProps {
  userStats?: {
    totalJourneys: number;
    completedJourneys: number;
    inProgressJourneys: number;
    totalPoints: number;
    level: number;
  };
  currentCity?: string;
  className?: string;
}

const MyJourneyBanner: React.FC<MyJourneyBannerProps> = ({ 
  userStats, 
  currentCity = 'Sion',
  className = '' 
}) => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();

  const getTranslation = (key: string, fallback: string) => {
    return t(key) || fallback;
  };

  const handleNavigateToMyJourneys = () => {
    navigate('/my-journeys');
  };

  if (!userStats) {
    return (
      <Card className={`bg-gradient-to-r from-primary/10 to-secondary/10 border-0 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {getTranslation('banner.start_exploring', 'Commencez votre exploration')}
                </h3>
                <p className="text-muted-foreground">
                  {getTranslation('banner.discover_journeys', 'Découvrez les parcours de')} {currentCity}
                </p>
              </div>
            </div>
            <Button onClick={handleNavigateToMyJourneys} className="flex items-center gap-2">
              {getTranslation('banner.explore', 'Explorer')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-0 shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white">
              <Trophy className="h-8 w-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold">
                {getTranslation('banner.my_journey', 'Mon Parcours')}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{currentCity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {getTranslation('banner.level', 'Niveau')} {userStats.level}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {userStats.totalPoints.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {getTranslation('banner.points', 'points')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold">
                {userStats.completedJourneys}/{userStats.totalJourneys}
              </div>
              <div className="text-xs text-muted-foreground">
                {getTranslation('banner.completed', 'terminés')}
              </div>
            </div>

            {userStats.inProgressJourneys > 0 && (
              <Badge variant="secondary" className="px-3 py-1">
                {userStats.inProgressJourneys} {getTranslation('banner.in_progress', 'en cours')}
              </Badge>
            )}

            <Button 
              onClick={handleNavigateToMyJourneys}
              variant="outline"
              className="bg-white/50 hover:bg-white/80 flex items-center gap-2"
            >
              {getTranslation('banner.view_all', 'Voir tout')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyJourneyBanner;