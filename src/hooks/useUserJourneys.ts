
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { userJourneysService, UserJourneyProgress } from '@/services/userJourneysService';

export function useUserJourneys() {
  const { profile } = useSimpleAuth();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  
  const [journeys, setJourneys] = useState<{
    inProgress: UserJourneyProgress[];
    completed: UserJourneyProgress[];
    saved: UserJourneyProgress[];
    abandoned: UserJourneyProgress[];
  }>({
    inProgress: [],
    completed: [],
    saved: [],
    abandoned: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Valeurs stables pour les dépendances
  const userId = profile?.user_id;
  const language = currentLanguage;

  // Fonction de fetch optimisée et stabilisée
  const fetchJourneys = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [Optimized] Fetching journeys for user:', userId);

      const allProgress = await userJourneysService.getUserJourneyProgress(userId, language);

      // Traitement optimisé des données
      const categorizedJourneys = {
        saved: allProgress.filter(j => j.status === 'saved'),
        inProgress: allProgress.filter(j => j.status === 'in_progress'),
        completed: allProgress.filter(j => j.status === 'completed'),
        abandoned: allProgress.filter(j => j.status === 'abandoned')
      };

      console.log('📊 [Optimized] Journey categories:', {
        saved: categorizedJourneys.saved.length,
        inProgress: categorizedJourneys.inProgress.length,
        completed: categorizedJourneys.completed.length,
        abandoned: categorizedJourneys.abandoned.length
      });

      setJourneys(categorizedJourneys);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des parcours';
      console.error('❌ [Optimized] Error fetching journeys:', errorMessage);
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
  }, [userId, language, toast]);

  // Effect avec dépendances stables
  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  // Retour optimisé avec memoization
  return useMemo(() => ({
    journeys,
    loading,
    error,
    refetch: fetchJourneys
  }), [journeys, loading, error, fetchJourneys]);
}
