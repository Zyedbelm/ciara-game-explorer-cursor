
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface QuickStatsMetrics {
  activeZones: number;
  performanceScore: number;
  activeAlerts: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  lastUpdate: string;
}

interface GeographicalFilters {
  selectedCountry: string | null;
  selectedCity: string | null;
  searchTerm: string;
}

export const useQuickStatsMetrics = (filters: GeographicalFilters) => {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<QuickStatsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuickStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isSuperAdmin = profile?.role === 'super_admin';
      const targetCityId = isSuperAdmin ? filters.selectedCity : profile?.city_id;

      // Calculer les zones actives (étapes avec des complétions récentes)
      let activeZonesQuery = supabase
        .from('step_completions')
        .select(`
          step_id,
          steps!inner(
            id,
            name,
            city_id,
            latitude,
            longitude
          )
        `)
        .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('steps.latitude', 'is', null)
        .not('steps.longitude', 'is', null);

      if (targetCityId) {
        activeZonesQuery = activeZonesQuery.eq('steps.city_id', targetCityId);
      }

      if (filters.selectedCountry && !targetCityId) {
        const { data: citiesInCountry } = await supabase
          .from('cities')
          .select('id')
          .eq('country_id', filters.selectedCountry);
        
        if (citiesInCountry?.length) {
          activeZonesQuery = activeZonesQuery.in('steps.city_id', citiesInCountry.map(c => c.id));
        }
      }

      const { data: activeZonesData, error: activeZonesError } = await activeZonesQuery;
      if (activeZonesError) throw activeZonesError;

      // Compter les zones uniques (étapes distinctes)
      const uniqueSteps = new Set(activeZonesData?.map(completion => completion.step_id) || []);
      const activeZones = uniqueSteps.size;

      // Calculer le score de performance basé sur le taux de complétion
      let performanceQuery = supabase
        .from('user_journey_progress')
        .select(`
          id,
          is_completed,
          journeys!inner(
            id,
            city_id
          )
        `);

      if (targetCityId) {
        performanceQuery = performanceQuery.eq('journeys.city_id', targetCityId);
      }

      if (filters.selectedCountry && !targetCityId) {
        const { data: citiesInCountry } = await supabase
          .from('cities')
          .select('id')
          .eq('country_id', filters.selectedCountry);
        
        if (citiesInCountry?.length) {
          performanceQuery = performanceQuery.in('journeys.city_id', citiesInCountry.map(c => c.id));
        }
      }

      const { data: progressData, error: progressError } = await performanceQuery;
      if (progressError) throw progressError;

      const totalJourneys = progressData?.length || 0;
      const completedJourneys = progressData?.filter(p => p.is_completed).length || 0;
      const completionRate = totalJourneys > 0 ? (completedJourneys / totalJourneys) : 0;
      const performanceScore = Math.round(completionRate * 10 * 100) / 100; // Score sur 10

      // Simuler les alertes basées sur les données réelles
      const activeAlerts = {
        total: 0,
        high: 0,
        medium: 0,
        low: 0
      };

      // Alerte si taux de complétion faible
      if (completionRate < 0.3) {
        activeAlerts.high += 1;
      } else if (completionRate < 0.5) {
        activeAlerts.medium += 1;
      }

      // Alerte si peu de zones actives
      if (activeZones < 5) {
        activeAlerts.medium += 1;
      } else if (activeZones < 3) {
        activeAlerts.high += 1;
      }

      // Alerte de routine (information)
      if (activeZones > 0) {
        activeAlerts.low += 1;
      }

      activeAlerts.total = activeAlerts.high + activeAlerts.medium + activeAlerts.low;

      setMetrics({
        activeZones,
        performanceScore,
        activeAlerts,
        lastUpdate: new Date().toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [profile, filters.selectedCity, filters.selectedCountry]);

  useEffect(() => {
    if (profile) {
      fetchQuickStats();
    }
  }, [profile, fetchQuickStats]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchQuickStats
  };
};
