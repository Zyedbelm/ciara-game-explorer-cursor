import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { resilientService } from '@/services/supabaseResilientService';
import { websocketService } from '@/services/websocketStabilizationService';

interface ResilientQueryOptions {
  cache?: boolean;
  cacheTTL?: number;
  retryConfig?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  };
  circuitBreakerKey?: string;
  showToast?: boolean;
}

interface ResilientQueryResult<T> {
  data: T | null;
  error: any;
  loading: boolean;
  refetch: () => Promise<void>;
}

export const useResilientSupabase = <T>(
  operation: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: ResilientQueryOptions = {}
) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const {
    cache = true,
    cacheTTL = 60000,
    retryConfig = {},
    circuitBreakerKey,
    showToast = true
  } = options;

  const executeQuery = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await resilientService.resilientQuery(
        operation,
        queryFn,
        {
          cache,
          cacheTTL,
          retryConfig,
          circuitBreakerKey: circuitBreakerKey || operation
        }
      );

      if (result.error) {
        setError(result.error);
        if (showToast) {
          toast({
            title: "Erreur",
            description: `Impossible de charger les données: ${result.error.message}`,
            variant: "destructive",
          });
        }
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError(err);
      if (showToast) {
        toast({
          title: "Erreur",
          description: "Une erreur inattendue s'est produite",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [operation, queryFn, cache, cacheTTL, retryConfig, circuitBreakerKey, showToast, toast]);

  // Méthodes spécialisées pour les opérations courantes
  const getProfiles = useCallback((filters: any = {}) => {
    return resilientService.getProfiles(filters);
  }, []);

  const getJourneys = useCallback((filters: any = {}) => {
    return resilientService.getJourneys(filters);
  }, []);

  const getPartners = useCallback((filters: any = {}) => {
    return resilientService.getPartners(filters);
  }, []);

  const getRewards = useCallback((filters: any = {}) => {
    return resilientService.getRewards(filters);
  }, []);

  // Méthodes de gestion
  const clearCache = useCallback((pattern?: string) => {
    resilientService.clearCache(pattern);
  }, []);

  const resetCircuitBreakers = useCallback(() => {
    resilientService.resetCircuitBreakers();
  }, []);

  const getStats = useCallback(() => {
    return resilientService.getStats();
  }, []);

  // WebSocket management
  const getWebSocketStatus = useCallback(() => {
    return websocketService.getConnectionStatus();
  }, []);

  const forceWebSocketReconnect = useCallback(() => {
    websocketService.forceReconnectNow();
  }, []);

  return {
    // Query state
    data,
    error,
    loading,
    refetch: executeQuery,

    // Specialized methods
    getProfiles,
    getJourneys,
    getPartners,
    getRewards,

    // Management methods
    clearCache,
    resetCircuitBreakers,
    getStats,

    // WebSocket methods
    getWebSocketStatus,
    forceWebSocketReconnect,

    // Execute custom query
    executeQuery
  };
};

// Hook spécialisé pour les données d'administration
export const useAdminResilientData = () => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const getProfilesWithFilters = useCallback(async (filters: any = {}) => {
    try {
      // Construire le filtre de ville de manière sécurisée
      const isSuperAdmin = profile?.role === 'super_admin';
      const cityFilter = isSuperAdmin || !profile?.city_id ? {} : { city_id: profile.city_id };

      const result = await resilientService.getProfiles(cityFilter);
      
      if (result.error) {
        console.error('Error fetching profiles:', result.error);
        return { data: [], error: result.error };
      }

      return result;
    } catch (error) {
      console.error('Unexpected error in getProfilesWithFilters:', error);
      return { data: [], error };
    }
  }, [profile]);

  const getJourneysWithFilters = useCallback(async (filters: any = {}) => {
    try {
      // Construire le filtre de ville de manière sécurisée
      const isSuperAdmin = profile?.role === 'super_admin';
      const cityFilter = isSuperAdmin || !profile?.city_id ? {} : { city_id: profile.city_id };

      const result = await resilientService.getJourneys(cityFilter);
      
      if (result.error) {
        console.error('Error fetching journeys:', result.error);
        return { data: [], error: result.error };
      }

      return result;
    } catch (error) {
      console.error('Unexpected error in getJourneysWithFilters:', error);
      return { data: [], error };
    }
  }, [profile]);

  const getPartnersWithFilters = useCallback(async (filters: any = {}) => {
    try {
      // Construire le filtre de ville de manière sécurisée
      const isSuperAdmin = profile?.role === 'super_admin';
      const cityFilter = isSuperAdmin || !profile?.city_id ? {} : { city_id: profile.city_id };

      const result = await resilientService.getPartners(cityFilter);
      
      if (result.error) {
        console.error('Error fetching partners:', result.error);
        return { data: [], error: result.error };
      }

      return result;
    } catch (error) {
      console.error('Unexpected error in getPartnersWithFilters:', error);
      return { data: [], error };
    }
  }, [profile]);

  return {
    getProfilesWithFilters,
    getJourneysWithFilters,
    getPartnersWithFilters,
    clearCache: resilientService.clearCache.bind(resilientService),
    resetCircuitBreakers: resilientService.resetCircuitBreakers.bind(resilientService),
    getStats: resilientService.getStats.bind(resilientService),
    getWebSocketStatus: websocketService.getConnectionStatus.bind(websocketService),
    forceWebSocketReconnect: websocketService.forceReconnectNow.bind(websocketService)
  };
}; 