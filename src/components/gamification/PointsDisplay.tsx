import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';

const PointsDisplay = () => {
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();

  if (!profile) return null;

  const currentLevel = profile.current_level || 1;
  const totalPoints = profile.total_points || 0;
  const pointsForNextLevel = currentLevel * 100; // Simple progression
  const pointsInCurrentLevel = totalPoints % 100;
  const progressPercentage = (pointsInCurrentLevel / 100) * 100;

  const getLevelBadge = (level: number) => {
    if (level >= 10) return { name: 'Ambassadeur', color: 'bg-gradient-to-r from-yellow-400 to-orange-500', icon: Trophy };
    if (level >= 5) return { name: 'Expert Local', color: 'bg-gradient-to-r from-purple-400 to-pink-500', icon: Star };
    if (level >= 3) return { name: 'Aventurier', color: 'bg-gradient-to-r from-blue-400 to-cyan-500', icon: Target };
    return { name: 'Explorateur', color: 'bg-gradient-to-r from-green-400 to-blue-500', icon: TrendingUp };
  };

  const levelBadge = getLevelBadge(currentLevel);
  const IconComponent = levelBadge.icon;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${levelBadge.color} flex items-center justify-center text-white shadow-lg`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Niveau {currentLevel}</h3>
              <Badge className={`${levelBadge.color} text-white border-0`}>
                {levelBadge.name}
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {totalPoints.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">points</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progression niveau {currentLevel + 1}</span>
            <span className="font-medium">{pointsInCurrentLevel}/100</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-primary">
              {0}
            </div>
            <div className="text-xs text-muted-foreground">Badges</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-secondary">
              {Math.floor(totalPoints / 15)}
            </div>
            <div className="text-xs text-muted-foreground">Étapes complétées</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-accent">
              {currentLevel}
            </div>
            <div className="text-xs text-muted-foreground">Niveau</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsDisplay;