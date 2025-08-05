
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Crown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserStatsCardProps {
  user: any;
  profile: any;
  userRank: number | null;
  cityName: string;
  ranking?: Array<{
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    city_points: number;
    steps_completed: number;
    journeys_completed: number;
    rank_position: number;
  }>;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ 
  user, 
  profile, 
  userRank, 
  cityName,
  ranking = []
}) => {
  const { t } = useLanguage();
  
  // Find user's city-specific stats from the ranking data
  const userCityStats = ranking.find(u => u.user_id === user?.id);
  const cityPoints = userCityStats?.city_points || 0;
  const cityStepsCompleted = userCityStats?.steps_completed || 0;
  const cityJourneysCompleted = userCityStats?.journeys_completed || 0;
  if (!user || !profile) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t('your_progress')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {t('login_to_see_progress')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = Math.min(((profile.total_points || 0) % 100), 100);

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          {t('your_progress')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {profile.full_name ? profile.full_name[0] : profile.email[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              {profile.full_name || t('explorer')}
            </p>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t('global')}: {profile.total_points || 0} {t('points')} • {t('level')} {profile.current_level || 1}
              </p>
              {cityPoints > 0 && (
                <p className="text-xs text-primary font-medium">
                  {cityName}: {cityPoints} {t('points')} • {cityStepsCompleted} {t('steps')} • {cityJourneysCompleted} {t('journeys')}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('level_progression')}</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {userRank && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            {userRank === 1 ? (
              <Crown className="h-4 w-4 text-secondary" />
            ) : (
              <Trophy className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-medium">
              #{userRank} à {cityName}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
