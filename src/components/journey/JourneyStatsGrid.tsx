
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserStats } from '@/services/userJourneysService';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Trophy, 
  Play,
  MapPin, 
  Star,
  Target
} from 'lucide-react';

interface JourneyStatsGridProps {
  stats: UserStats | null;
}

const JourneyStatsGrid: React.FC<JourneyStatsGridProps> = ({ stats }) => {
  const { t } = useLanguage();
  
  // Calculate progress percentages
  const journeyCompletionRate = stats?.totalJourneys ? 
    Math.round((stats.completedJourneys / stats.totalJourneys) * 100) : 0;
  
  const stepCompletionRate = stats?.totalSteps ? 
    Math.round((stats.completedSteps / stats.totalSteps) * 100) : 0;

  const currentLevel = stats?.level || 1;
  const pointsForCurrentLevel = (currentLevel - 1) * 100;
  const pointsForNextLevel = currentLevel * 100;
  const currentLevelProgress = stats?.totalPoints ? 
    Math.round(((stats.totalPoints - pointsForCurrentLevel) / 100) * 100) : 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Main stats grid */}
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardContent className="p-3 text-center">
            <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary mx-auto mb-1" />
            <div className="text-lg md:text-xl font-bold">{stats?.completedJourneys || 0}</div>
            <div className="text-xs md:text-sm text-muted-foreground leading-tight">{t('my_journeys.stats.completed')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 text-center">
            <Play className="h-5 w-5 md:h-6 md:w-6 text-blue-500 mx-auto mb-1" />
            <div className="text-lg md:text-xl font-bold">{stats?.inProgressJourneys || 0}</div>
            <div className="text-xs md:text-sm text-muted-foreground leading-tight">{t('my_journeys.stats.in_progress')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 text-center">
            <MapPin className="h-5 w-5 md:h-6 md:w-6 text-green-500 mx-auto mb-1" />
            <div className="text-lg md:text-xl font-bold">{stats?.completedSteps || 0}</div>
            <div className="text-xs md:text-sm text-muted-foreground leading-tight">{t('my_journeys.stats.steps')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 text-center">
            <Star className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 mx-auto mb-1" />
            <div className="text-lg md:text-xl font-bold">{stats?.totalPoints || 0}</div>
            <div className="text-xs md:text-sm text-muted-foreground leading-tight">{t('my_journeys.stats.points')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Journey completion progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{t('my_journeys.progress.journeys')}</span>
            </div>
            <Progress value={journeyCompletionRate} className="mb-2" />
            <div className="text-xs text-muted-foreground">
              {journeyCompletionRate}% {t('my_journeys.progress.completed')} ({stats?.completedJourneys || 0}/{stats?.totalJourneys || 0})
            </div>
          </CardContent>
        </Card>

        {/* Step completion progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{t('my_journeys.progress.steps')}</span>
            </div>
            <Progress value={stepCompletionRate} className="mb-2" />
            <div className="text-xs text-muted-foreground">
              {stepCompletionRate}% {t('my_journeys.progress.completed')} ({stats?.completedSteps || 0}/{stats?.totalSteps || 0})
            </div>
          </CardContent>
        </Card>

        {/* Level progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{t('my_journeys.progress.level')} {currentLevel}</span>
            </div>
            <Progress value={Math.min(currentLevelProgress, 100)} className="mb-2" />
            <div className="text-xs text-muted-foreground">
              {Math.max(0, pointsForNextLevel - (stats?.totalPoints || 0))} {t('my_journeys.progress.points_for_level')} {currentLevel + 1}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JourneyStatsGrid;
