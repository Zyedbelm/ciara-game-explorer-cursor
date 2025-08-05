import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  stepId: string;
  stepName: string;
  completions: number;
}

export interface PopularRoute {
  from: { lat: number; lng: number; name: string; stepId: string };
  to: { lat: number; lng: number; name: string; stepId: string };
  frequency: number;
  avgDuration: number;
}

export interface GeographicAnalytics {
  heatmapData: HeatmapPoint[];
  popularRoutes: PopularRoute[];
  stepClusters: Array<{
    center: { lat: number; lng: number };
    steps: Array<{ id: string; name: string; completions: number }>;
    totalCompletions: number;
  }>;
  visitDistribution: {
    hourly: Record<string, number>;
    daily: Record<string, number>;
    seasonal: Record<string, number>;
  };
}

export const useGeographicAnalytics = (cityId?: string, timeRange: string = '30d') => {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<GeographicAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Debounce inputs to prevent rapid re-renders
  const debouncedCityId = useDebounce(cityId, 300);
  const debouncedTimeRange = useDebounce(timeRange, 300);

  // Stable values using useMemo to prevent unnecessary re-renders
  const stableCityId = useMemo(() => debouncedCityId, [debouncedCityId]);
  const stableTimeRange = useMemo(() => debouncedTimeRange, [debouncedTimeRange]);
  const stableProfile = useMemo(() => profile, [profile?.role, profile?.city_id]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchGeographicAnalytics = useCallback(async () => {
    // Guard conditions to prevent unnecessary API calls
    if (!stableProfile || !isMountedRef.current) {
      return;
    }
    
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      setError(null);

      const isSuperAdmin = stableProfile?.role === 'super_admin';
      const targetCityId = isSuperAdmin ? stableCityId : stableProfile?.city_id;

      // Fetch step completion data with geographic info
      let query = supabase
        .from('step_completions')
        .select(`
          *,
          step:steps!inner(
            id,
            name,
            latitude,
            longitude,
            city_id
          )
        `)
        .not('step.latitude', 'is', null)
        .not('step.longitude', 'is', null);

      if (targetCityId) {
        query = query.eq('step.city_id', targetCityId);
      }

      // Apply time range filter
      const now = new Date();
      const timeRangeMap: Record<string, number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      const daysBack = timeRangeMap[stableTimeRange] || 30;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      
      query = query.gte('completed_at', startDate.toISOString());

      const { data: completions, error: completionsError } = await query;

      if (completionsError) throw completionsError;
      if (!isMountedRef.current) return;

      // Process heatmap data
      const stepCompletions = new Map<string, { step: any; completions: number }>();
      
      completions?.forEach(completion => {
        const stepId = completion.step.id;
        if (stepCompletions.has(stepId)) {
          stepCompletions.get(stepId)!.completions++;
        } else {
          stepCompletions.set(stepId, {
            step: completion.step,
            completions: 1
          });
        }
      });

      const heatmapData: HeatmapPoint[] = Array.from(stepCompletions.entries()).map(([stepId, data]) => ({
        lat: data.step.latitude,
        lng: data.step.longitude,
        weight: Math.min(data.completions / 10, 1), // Normalize weight
        stepId,
        stepName: data.step.name,
        completions: data.completions
      }));

      // Generate popular routes (simplified logic)
      const popularRoutes: PopularRoute[] = [];
      const stepsByJourney = new Map<string, any[]>();
      
      // Group completions by journey and user to find sequential patterns
      completions?.forEach(completion => {
        if (completion.journey_id) {
          if (!stepsByJourney.has(completion.journey_id)) {
            stepsByJourney.set(completion.journey_id, []);
          }
          stepsByJourney.get(completion.journey_id)!.push(completion);
        }
      });

      // Process visit distribution
      const hourlyDist: Record<string, number> = {};
      const dailyDist: Record<string, number> = {};
      const seasonalDist: Record<string, number> = { 'Printemps': 0, 'Été': 0, 'Automne': 0, 'Hiver': 0 };

      completions?.forEach(completion => {
        const date = new Date(completion.completed_at);
        const hour = date.getHours().toString();
        const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
        const month = date.getMonth();

        hourlyDist[hour] = (hourlyDist[hour] || 0) + 1;
        dailyDist[day] = (dailyDist[day] || 0) + 1;

        // Seasonal distribution
        if (month >= 3 && month <= 5) seasonalDist['Printemps']++;
        else if (month >= 6 && month <= 8) seasonalDist['Été']++;
        else if (month >= 9 && month <= 11) seasonalDist['Automne']++;
        else seasonalDist['Hiver']++;
      });

      // Create step clusters (simplified clustering by proximity)
      const stepClusters = Array.from(stepCompletions.values())
        .filter(item => item.step.latitude && item.step.longitude)
        .map(item => ({
          center: { lat: item.step.latitude, lng: item.step.longitude },
          steps: [{
            id: item.step.id,
            name: item.step.name,
            completions: item.completions
          }],
          totalCompletions: item.completions
        }));

      const result = {
        heatmapData,
        popularRoutes,
        stepClusters,
        visitDistribution: {
          hourly: hourlyDist,
          daily: dailyDist,
          seasonal: seasonalDist
        }
      };

      // Successfully fetched analytics data
      if (!isMountedRef.current) return;
      setAnalytics(result);

    } catch (err) {
      console.error('Error fetching geographic analytics:', err);
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des analytics géographiques');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [stableProfile, stableCityId, stableTimeRange]);

  useEffect(() => {
    if (stableProfile) {
      fetchGeographicAnalytics();
    }
  }, [fetchGeographicAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchGeographicAnalytics
  };
};