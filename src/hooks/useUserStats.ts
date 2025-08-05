
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { userJourneysService, UserStats } from '@/services/userJourneysService';
import { supabase } from '@/integrations/supabase/client';

export function useUserStats() {
  const { profile } = useSimpleAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Valeur stable pour les dépendances
  const userId = profile?.user_id;

  // Fonction de fetch optimisée et stabilisée
  const fetchStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📊 [Optimized] Fetching stats for user:', userId);
      const userStats = await userJourneysService.getUserStats(userId);
      setStats(userStats);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques';
      console.error('❌ [Optimized] Error fetching stats:', errorMessage);
      setError(errorMessage);
      
      // Affichage de l'erreur avec toast
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Auto-refresh profile when it updates
  useEffect(() => {
    fetchStats();
    
    // Set up real-time listeners for automatic updates
    if (userId) {
      const channel = supabase
        .channel('user-stats-changes')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles',
            filter: `user_id=eq.${userId}`
          }, 
          () => {
            console.log('🔄 Profile updated, refreshing stats');
            setTimeout(fetchStats, 100); // Small delay to ensure data consistency
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public', 
            table: 'user_journey_progress',
            filter: `user_id=eq.${userId}`
          }, 
          (payload) => {
            console.log('🔄 User journey progress changed, refreshing stats:', payload.eventType);
            setTimeout(fetchStats, 100); // Small delay to ensure data consistency
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', // Listen to all events
            schema: 'public', 
            table: 'step_completions',
            filter: `user_id=eq.${userId}`
          }, 
          (payload) => {
            console.log('🔄 Step completion changed, refreshing stats:', payload.eventType);
            setTimeout(fetchStats, 100);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchStats, userId]);

  // Retour optimisé avec memoization
  return useMemo(() => ({
    stats,
    loading,
    error,
    refetch: fetchStats
  }), [stats, loading, error, fetchStats]);
}
