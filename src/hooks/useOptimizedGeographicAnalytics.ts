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

interface AnalyticsCache {
  data: GeographicAnalytics;
  timestamp: number;
  cityId: string | undefined;
  timeRange: string;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const DEBOUNCE_DELAY = 500;

// Global cache to persist across component unmounts/mounts
let globalCache: AnalyticsCache | null = null;

/**
 * Optimized hook for geographic analytics with aggressive caching and debouncing
 */
export const useOptimizedGeographicAnalytics = (cityId?: string, timeRange: string = '30d') => {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<GeographicAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Aggressive debouncing to prevent cascade re-renders
  const debouncedCityId = useDebounce(cityId, DEBOUNCE_DELAY);
  const debouncedTimeRange = useDebounce(timeRange, DEBOUNCE_DELAY);

  // Ultra-stable references
  const stableCityId = useMemo(() => debouncedCityId, [debouncedCityId]);
  const stableTimeRange = useMemo(() => debouncedTimeRange, [debouncedTimeRange]);
  const stableProfileId = useMemo(() => profile?.user_id, [profile?.user_id]);
  const stableRole = useMemo(() => profile?.role, [profile?.role]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Cache validation
  const isCacheValid = useCallback(() => {
    if (!globalCache) return false;
    
    const now = Date.now();
    const isWithinCacheDuration = (now - globalCache.timestamp) < CACHE_DURATION;
    const isSameParams = globalCache.cityId === stableCityId && globalCache.timeRange === stableTimeRange;
    
    return isWithinCacheDuration && isSameParams;
  }, [stableCityId, stableTimeRange]);

  const fetchGeographicAnalytics = useCallback(async () => {
    // Strict guards to prevent unnecessary API calls
    if (!stableProfileId || !stableRole || !isMountedRef.current) {
      return;
    }

    // Check cache first
    if (isCacheValid()) {
      if (isMountedRef.current) {
        setAnalytics(globalCache!.data);
        setLoading(false);
        setError(null);
      }
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    try {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      setError(null);
      const isSuperAdmin = stableRole === 'super_admin';
      const targetCityId = isSuperAdmin ? stableCityId : profile?.city_id;

      // Build optimized query
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

      // Apply time range filter with optimized date calculation
      const timeRangeMap: Record<string, number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      const daysBack = timeRangeMap[stableTimeRange] || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      query = query.gte('completed_at', startDate.toISOString());

      const { data: completions, error: completionsError } = await query
        .abortSignal(abortControllerRef.current.signal);

      if (completionsError) throw completionsError;
      if (!isMountedRef.current) return;

      // Optimized data processing
      const stepCompletions = new Map<string, { step: any; completions: number }>();
      
      completions?.forEach(completion => {
        const stepId = completion.step.id;
        const existing = stepCompletions.get(stepId);
        if (existing) {
          existing.completions++;
        } else {
          stepCompletions.set(stepId, {
            step: completion.step,
            completions: 1
          });
        }
      });

      // Generate heatmap data
      const heatmapData: HeatmapPoint[] = Array.from(stepCompletions.entries()).map(([stepId, data]) => ({
        lat: data.step.latitude,
        lng: data.step.longitude,
        weight: Math.min(data.completions / 10, 1),
        stepId,
        stepName: data.step.name,
        completions: data.completions
      }));

      // Simplified route analysis (empty for now)
      const popularRoutes: PopularRoute[] = [];

      // Optimized visit distribution
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

      // Create step clusters
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

      // Update global cache
      globalCache = {
        data: result,
        timestamp: Date.now(),
        cityId: stableCityId,
        timeRange: stableTimeRange
      };

      if (!isMountedRef.current) return;
      setAnalytics(result);
      } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Error loading geographic analytics');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [stableProfileId, stableRole, stableCityId, stableTimeRange, profile?.city_id, isCacheValid]);

  const refetch = useCallback(() => {
    globalCache = null; // Clear cache
    fetchGeographicAnalytics();
  }, [fetchGeographicAnalytics]);

  // Trigger fetch only when dependencies change
  useEffect(() => {
    if (stableProfileId && stableRole) {
      fetchGeographicAnalytics();
    }
  }, [fetchGeographicAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch,
    hasData: !!analytics?.heatmapData?.length
  };
};