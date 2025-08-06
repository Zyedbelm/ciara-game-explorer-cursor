
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface JourneyCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export function useJourneyCategory(categoryId: string | null) {
  return useQuery({
    queryKey: ['journey-category', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      
      const { data, error } = await supabase
        .from('journey_categories')
        .select('id, name, icon, color')
        .eq('id', categoryId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as JourneyCategory | null;
    },
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
