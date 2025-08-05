
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface JourneyStep {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  points_awarded: number;
  validation_radius: number;
  has_quiz: boolean;
}

export function useJourneySteps(journeyId: string | null) {
  return useQuery({
    queryKey: ['journey-steps', journeyId],
    queryFn: async () => {
      if (!journeyId) return [];
      
      const { data, error } = await supabase
        .from('journey_steps')
        .select(`
          step_order,
          steps(
            id,
            name,
            description,
            latitude,
            longitude,
            points_awarded,
            validation_radius,
            has_quiz
          )
        `)
        .eq('journey_id', journeyId)
        .order('step_order');

      if (error) {
        console.error('Erreur lors de la récupération des étapes:', error);
        throw error;
      }

      return data
        .filter(item => item.steps)
        .map(item => item.steps) as JourneyStep[];
    },
    enabled: !!journeyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
