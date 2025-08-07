import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useToast } from '@/hooks/use-toast';
import { userJourneysService, UserStats } from '@/services/userJourneysService';
import { supabase } from '@/integrations/supabase/client';

// Cache global pour les statistiques
const statsCache = new Map<string, { stats: UserStats; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export function useOptimizedUserStats() {
  const { profile } = useOptimizedAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  const userId = profile?.user_id;

  // Fonction de fetch optimisée avec cache
  const fetchStats = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      setStats(null);
      setLoading(false);
      return;
    }

    // Vérifier le cache
    if (!forceRefresh) {
      const cached = statsCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setStats(cached.stats);
        setLoading(false);
        setError(null);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const userStats = await userJourneysService.getUserStats(userId);
      
      // Mettre en cache
      statsCache.set(userId, { stats: userStats, timestamp: Date.now() });
      setStats(userStats);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
      
      // Nettoyer le cache en cas d'erreur
      statsCache.delete(userId);
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Configuration des listeners en temps réel optimisée
  useEffect(() => {
    if (!userId) {
      // Nettoyer l'ancienne subscription
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      return;
    }

    // Charger les stats initiales
    fetchStats();

    // Configurer les listeners en temps réel (une seule fois)
    if (!subscriptionRef.current) {
      subscriptionRef.current = supabase
        .channel('user-stats-changes')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles',
            filter: `user_id=eq.${userId}`
          }, 
          () => {
            // Invalider le cache et recharger
            statsCache.delete(userId);
            fetchStats(true);
          }
        )
        .on('postgres_changes', 
          { 
            event: '*',
            schema: 'public', 
            table: 'user_journey_progress',
            filter: `user_id=eq.${userId}`
          }, 
          () => {
            statsCache.delete(userId);
            fetchStats(true);
          }
        )
        .on('postgres_changes', 
          { 
            event: '*',
            schema: 'public', 
            table: 'step_completions',
            filter: `user_id=eq.${userId}`
          }, 
          () => {
            statsCache.delete(userId);
            fetchStats(true);
          }
        )
        .subscribe();
    }

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [userId, fetchStats]);

  // Fonction de rafraîchissement manuel
  const refetch = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  // Retour optimisé avec memoization
  return useMemo(() => ({
    stats,
    loading,
    error,
    refetch
  }), [stats, loading, error, refetch]);
}
