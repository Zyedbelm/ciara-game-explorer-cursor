import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, TrendingUp, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BadgeDisplayProps {
  currentPoints: number;
  className?: string;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ currentPoints, className }) => {
  const { t } = useLanguage();

  const badges = [
    {
      id: 'explorer',
      name: t('profile.badges.explorer'),
      points: 0,
      icon: TrendingUp,
      color: 'from-green-400 to-blue-500',
      description: t('profile.badges.explorer_desc')
    },
    {
      id: 'adventurer',
      name: t('profile.badges.adventurer'),
      points: 100,
      icon: Target,
      color: 'from-blue-400 to-cyan-500',
      description: t('profile.badges.adventurer_desc')
    },
    {
      id: 'expert',
      name: t('profile.badges.expert'),
      points: 500,
      icon: Star,
      color: 'from-purple-400 to-pink-500',
      description: t('profile.badges.expert_desc')
    },
    {
      id: 'ambassador',
      name: t('profile.badges.ambassador'),
      points: 1000,
      icon: Trophy,
      color: 'from-yellow-400 to-orange-500',
      description: t('profile.badges.ambassador_desc')
    }
  ];

  const getNextBadge = () => {
    return badges.find(badge => badge.points > currentPoints);
  };

  const nextBadge = getNextBadge();
  const pointsToNext = nextBadge ? nextBadge.points - currentPoints : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {t('profile.badges.title')}
        </CardTitle>
        {nextBadge && (
          <p className="text-sm text-muted-foreground">
            {t('profile.badges.next_badge', { 
              points: pointsToNext.toString(), 
              badge: nextBadge.name 
            })}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge) => {
            const IconComponent = badge.icon;
            const isEarned = currentPoints >= badge.points;
            
            return (
              <div key={badge.id} className="relative group">
                <div
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-300
                    ${isEarned 
                      ? 'border-primary/20 bg-gradient-to-br from-background to-muted/30 shadow-md' 
                      : 'border-muted/30 bg-muted/10 opacity-60'
                    }
                    hover:scale-105 hover:shadow-lg
                  `}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300
                        ${isEarned 
                          ? `bg-gradient-to-r ${badge.color}` 
                          : 'bg-muted/50'
                        }
                      `}
                    >
                      {isEarned ? (
                        <IconComponent className="h-6 w-6" />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className={`font-semibold text-sm ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {badge.name}
                      </h4>
                      <Badge 
                        variant={isEarned ? "default" : "secondary"}
                        className={`text-xs mt-1 ${isEarned ? `bg-gradient-to-r ${badge.color} text-white border-0` : ''}`}
                      >
                        {badge.points} {t('profile.badges.points')}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                    {badge.description}
                  </div>
                </div>
                
                {/* Achievement animation for earned badges */}
                {isEarned && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {!nextBadge && (
          <div className="mt-4 text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
              {t('profile.badges.all_earned')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgeDisplay;