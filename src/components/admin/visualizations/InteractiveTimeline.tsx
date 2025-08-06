import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Brush, ReferenceLine } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface InteractiveTimelineProps {
  cityId?: string;
  timeRange: string;
}

interface TimelineData {
  date: string;
  visitors: number;
  completions: number;
  newUsers: number;
  revenue: number;
}

interface Event {
  date: string;
  title: string;
  description: string;
  impact: number;
  type: 'positive' | 'negative' | 'neutral';
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({ cityId, timeRange }) => {
  const [data, setData] = useState<TimelineData[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const now = new Date();
        const daysBack = timeRange === '2y' ? 730 : timeRange === '1y' ? 365 : 90;
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

        // Fetch completions data
        let completionsQuery = supabase
          .from('step_completions')
          .select('completed_at, points_earned, user_id, step:steps!inner(city_id)')
          .gte('completed_at', startDate.toISOString());

        if (cityId) {
          completionsQuery = completionsQuery.eq('step.city_id', cityId);
        }

        const { data: completions } = await completionsQuery;

        // Fetch user registrations
        let profilesQuery = supabase
          .from('profiles')
          .select('created_at, user_id')
          .gte('created_at', startDate.toISOString());

        if (cityId) {
          profilesQuery = profilesQuery.eq('city_id', cityId);
        }

        const { data: profiles } = await profilesQuery;

        // Process daily data
        const dailyData = new Map<string, {
          visitors: Set<string>;
          completions: number;
          newUsers: Set<string>;
          revenue: number;
        }>();

        // Process completions
        completions?.forEach(completion => {
          const date = new Date(completion.completed_at).toISOString().split('T')[0];
          if (!dailyData.has(date)) {
            dailyData.set(date, {
              visitors: new Set(),
              completions: 0,
              newUsers: new Set(),
              revenue: 0
            });
          }
          const dayData = dailyData.get(date)!;
          dayData.visitors.add(completion.user_id);
          dayData.completions++;
          dayData.revenue += (completion.points_earned || 0) * 0.1; // Estimated revenue per point
        });

        // Process new users
        profiles?.forEach(profile => {
          const date = new Date(profile.created_at).toISOString().split('T')[0];
          if (!dailyData.has(date)) {
            dailyData.set(date, {
              visitors: new Set(),
              completions: 0,
              newUsers: new Set(),
              revenue: 0
            });
          }
          dailyData.get(date)!.newUsers.add(profile.user_id);
        });

        // Convert to timeline format
        const timelineData: TimelineData[] = [];
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const dayData = dailyData.get(dateStr);
          
          timelineData.push({
            date: dateStr,
            visitors: dayData?.visitors.size || 0,
            completions: dayData?.completions || 0,
            newUsers: dayData?.newUsers.size || 0,
            revenue: dayData?.revenue || 0
          });
        }

        // Generate mock events (in real app, these would come from a database)
        const mockEvents: Event[] = [
          {
            date: '2024-07-15',
            title: 'Lancement Festival d\'Été',
            description: 'Début du festival d\'été local avec parcours spéciaux',
            impact: 150,
            type: 'positive' as const
          },
          {
            date: '2024-08-03',
            title: 'Nouveau Parcours Gastronomique',
            description: 'Ajout d\'un parcours dédié à la gastronomie locale',
            impact: 75,
            type: 'positive' as const
          },
          {
            date: '2024-09-12',
            title: 'Partenariat Musée',
            description: 'Collaboration avec le musée local pour des contenus enrichis',
            impact: 30,
            type: 'positive' as const
          },
          {
            date: '2024-06-20',
            title: 'Maintenance Technique',
            description: 'Maintenance planifiée de l\'infrastructure',
            impact: -40,
            type: 'negative' as const
          }
        ].filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= startDate && eventDate <= now;
        });

        setData(timelineData);
        setEvents(mockEvents);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityId, timeRange]);

  const formatTooltip = (value: any, name: string) => {
    switch (name) {
      case 'visitors':
        return [`${value} visiteurs`, 'Visiteurs uniques'];
      case 'completions':
        return [`${value} complétions`, 'Étapes complétées'];
      case 'newUsers':
        return [`${value} nouveaux`, 'Nouveaux utilisateurs'];
      case 'revenue':
        return [`${value.toFixed(2)} CHF`, 'Revenus estimés'];
      default:
        return [value, name];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Timeline Interactive avec Brush Selection</h3>
        <p className="text-sm text-muted-foreground">
          Utilisez la barre de sélection en bas pour zoomer sur une période spécifique. 
          Les lignes verticales indiquent des événements marquants.
        </p>
      </div>

      {/* Main Timeline Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
              formatter={formatTooltip}
            />
            
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="visitors" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="completions" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="newUsers" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              dot={false}
            />
            
            {/* Event markers */}
            {events.map((event, index) => (
              <ReferenceLine 
                key={index}
                x={event.date} 
                stroke={event.type === 'positive' ? '#22c55e' : event.type === 'negative' ? '#ef4444' : '#6b7280'}
                strokeDasharray="5 5"
                label={{ value: event.title, position: 'top' }}
              />
            ))}
            
            {/* Brush for selection */}
            <Brush 
              dataKey="date" 
              height={30}
              stroke="hsl(var(--primary))"
              tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short' })}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold">Événements Marquants</h4>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div 
              key={index}
              className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors
                ${selectedEvent?.date === event.date ? 'bg-muted' : 'hover:bg-muted/50'}`}
              onClick={() => setSelectedEvent(selectedEvent?.date === event.date ? null : event)}
            >
              <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                event.type === 'positive' ? 'bg-green-500' :
                event.type === 'negative' ? 'bg-red-500' : 'bg-gray-500'
              }`} />
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold">{event.title}</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className={`text-sm font-medium ${
                      event.impact > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {event.impact > 0 ? '+' : ''}{event.impact}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{data.reduce((sum, d) => sum + d.visitors, 0).toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total des visiteurs</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{data.reduce((sum, d) => sum + d.completions, 0).toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total des complétions</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{data.reduce((sum, d) => sum + d.newUsers, 0).toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Nouveaux utilisateurs</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{data.reduce((sum, d) => sum + d.revenue, 0).toFixed(0)} CHF</div>
          <div className="text-sm text-muted-foreground">Revenus estimés</div>
        </div>
      </div>
    </div>
  );
};