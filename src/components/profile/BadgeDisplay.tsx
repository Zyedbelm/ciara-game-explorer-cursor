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
    <div className={className}>
      {/* Header info seulement si pas intégré */}
      {!className?.includes('bg-transparent') && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">{t('profile.badges.title')}</h3>
          </div>
          {nextBadge && (
            <p className="text-sm text-muted-foreground">
              {t('profile.badges.next_badge', { 
                points: pointsToNext.toString(), 
                badge: nextBadge.name 
              })}
            </p>
          )}
        </div>
      )}
      
      {/* Grid compact 4 colonnes sur desktop, 2 sur mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {badges.map((badge) => {
          const IconComponent = badge.icon;
          const isEarned = currentPoints >= badge.points;
          
          return (
            <div key={badge.id} className="relative group">
              <div
                className={`
                  relative p-2 rounded-lg border transition-all duration-300
                  ${isEarned 
                    ? 'border-primary/30 bg-gradient-to-br from-background to-primary/5 shadow-md' 
                    : 'border-muted/30 bg-muted/10 opacity-60'
                  }
                  hover:scale-105 hover:shadow-lg
                `}
              >
                <div className="flex flex-col items-center text-center space-y-1">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300
                      ${isEarned 
                        ? `bg-gradient-to-r ${badge.color}` 
                        : 'bg-muted/50'
                      }
                    `}
                  >
                    {isEarned ? (
                      <IconComponent className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className={`font-medium text-xs ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {badge.name}
                    </h4>
                    <Badge 
                      variant={isEarned ? "default" : "secondary"}
                      className={`text-xs mt-0.5 ${isEarned ? `bg-gradient-to-r ${badge.color} text-white border-0` : ''}`}
                    >
                      {badge.points}pts
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
                  <div className="w-3 h-3 bg-nature rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {nextBadge && (
        <div className="mt-3 text-center p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground">
            <strong>{pointsToNext} points</strong> pour débloquer <strong>{nextBadge.name}</strong>
          </p>
        </div>
      )}
      
      {!nextBadge && (
        <div className="mt-3 text-center p-3 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg border border-secondary/30">
          <Trophy className="h-6 w-6 text-secondary mx-auto mb-1" />
          <p className="text-xs font-semibold text-secondary-dark">
            {t('profile.badges.all_earned')}
          </p>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;