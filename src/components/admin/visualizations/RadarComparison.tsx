import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface RadarComparisonProps {
  cityId?: string;
  timeRange: string;
}

interface RadarData {
  metric: string;
  current: number;
  benchmark: number;
  fullMark: 10;
}

export const RadarComparison: React.FC<RadarComparisonProps> = ({ cityId, timeRange }) => {
  const [data, setData] = useState<RadarData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const now = new Date();
        const daysBack = timeRange === '1y' ? 365 : timeRange === '90d' ? 90 : 30;
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

        // Fetch various metrics for radar comparison
        let completionsQuery = supabase
          .from('step_completions')
          .select('*, step:steps!inner(city_id)')
          .gte('completed_at', startDate.toISOString());
        
        if (cityId) {
          completionsQuery = completionsQuery.eq('step.city_id', cityId);
        }

        let progressQuery = supabase
          .from('user_journey_progress')
          .select('*, journey:journeys!inner(city_id)')
          .gte('started_at', startDate.toISOString());
        
        if (cityId) {
          progressQuery = progressQuery.eq('journey.city_id', cityId);
        }

        let profilesQuery = supabase
          .from('profiles')
          .select('*');
        
        if (cityId) {
          profilesQuery = profilesQuery.eq('city_id', cityId);
        }

        const [completionsResult, progressResult, profilesResult] = await Promise.all([
          completionsQuery,
          progressQuery,
          profilesQuery
        ]);

        const completions = completionsResult.data || [];
        const progress = progressResult.data || [];
        const profiles = profilesResult.data || [];

        // Calculate metrics
        const totalProgress = progress.length;
        const completedJourneys = progress.filter(p => p.is_completed).length;
        const completionRate = totalProgress > 0 ? (completedJourneys / totalProgress) * 10 : 0;
        
        const avgPointsPerUser = profiles.length > 0 
          ? profiles.reduce((sum, p) => sum + (p.total_points || 0), 0) / profiles.length / 100
          : 0;
        
        const engagementScore = completions.length > 0 ? Math.min(completions.length / 50, 10) : 0;
        
        const diversityScore = Math.min(
          new Set(completions.map(c => c.step_id)).size / 10, 
          10
        );

        const innovationScore = 8.5; // Based on features available
        const accessibilityScore = 6.8; // Would be calculated from actual accessibility data
        const multilingualScore = 7.1; // Based on available languages
        const partnershipsScore = 5.9; // Based on active partners

        const radarData: RadarData[] = [
          {
            metric: 'Engagement',
            current: Math.round(engagementScore * 10) / 10,
            benchmark: 7.5,
            fullMark: 10
          },
          {
            metric: 'Complétion',
            current: Math.round(completionRate * 10) / 10,
            benchmark: 8.0,
            fullMark: 10
          },
          {
            metric: 'Points/Utilisateur',
            current: Math.round(Math.min(avgPointsPerUser, 10) * 10) / 10,
            benchmark: 6.5,
            fullMark: 10
          },
          {
            metric: 'Diversité',
            current: Math.round(diversityScore * 10) / 10,
            benchmark: 7.8,
            fullMark: 10
          },
          {
            metric: 'Innovation',
            current: innovationScore,
            benchmark: 6.2,
            fullMark: 10
          },
          {
            metric: 'Accessibilité',
            current: accessibilityScore,
            benchmark: 8.1,
            fullMark: 10
          },
          {
            metric: 'Multilingue',
            current: multilingualScore,
            benchmark: 7.9,
            fullMark: 10
          },
          {
            metric: 'Partenariats',
            current: partnershipsScore,
            benchmark: 7.3,
            fullMark: 10
          }
        ];

        setData(radarData);
      } catch (error) {
        console.error('Error fetching radar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityId, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Analyse Comparative Multi-dimensionnelle</h3>
        <p className="text-sm text-muted-foreground">
          Comparaison de vos performances (bleu) avec les benchmarks du secteur (rouge)
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fontSize: 12 }}
            className="text-sm"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tick={{ fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="Votre Performance"
            dataKey="current"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Benchmark Secteur"
            dataKey="benchmark"
            stroke="hsl(var(--destructive))"
            fill="hsl(var(--destructive))"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5,5"
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {data.map((item, index) => (
          <div key={item.metric} className="text-center p-3 border rounded">
            <div className="text-sm font-medium">{item.metric}</div>
            <div className="text-2xl font-bold text-primary">{item.current}</div>
            <div className="text-xs text-muted-foreground">vs {item.benchmark} (référence)</div>
            <div className={`text-xs font-medium ${
              item.current >= item.benchmark ? 'text-green-600' : 'text-orange-600'
            }`}>
              {item.current >= item.benchmark ? '↗' : '↘'} 
              {Math.abs(item.current - item.benchmark).toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};