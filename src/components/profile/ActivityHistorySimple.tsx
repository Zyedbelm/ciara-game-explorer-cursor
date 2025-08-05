import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Activity, CheckCircle, Trophy } from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'step_completion' | 'journey_completion';
  date: string;
  points_earned?: number;
  details: {
    step_name?: string;
    journey_name?: string;
  };
}

const ActivityHistorySimple: React.FC = () => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { t } = useLanguage();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.user_id) {
      fetchActivityHistory();
    }
  }, [profile?.user_id]);

  const fetchActivityHistory = async () => {
    if (!profile?.user_id) return;

    try {
      setLoading(true);
      
      const { data: stepCompletions, error } = await supabase
        .from('step_completions')
        .select(`
          id,
          completed_at,
          points_earned,
          steps(name)
        `)
        .eq('user_id', profile.user_id)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const activities: ActivityEvent[] = stepCompletions?.map(completion => ({
        id: completion.id,
        type: 'step_completion',
        date: completion.completed_at,
        points_earned: completion.points_earned,
        details: {
          step_name: completion.steps?.name
        }
      })) || [];

      setActivities(activities);
    } catch (error) {
      console.error('Error fetching activity history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t('profile.activity_history') || 'Historique d\'activité'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Aucune activité trouvée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="border-l-4 border-l-green-500 p-3 bg-muted/30 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium">
                            Étape "{activity.details.step_name}" complétée
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.date)}
                          </span>
                          {activity.points_earned && (
                            <div className="mt-1">
                              <Badge variant="default" className="text-xs">
                                +{activity.points_earned} pts
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityHistorySimple;