import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useStepQuizPoints = (stepId: string) => {
  const [quizPoints, setQuizPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuizPoints = async () => {
      if (!stepId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('points_awarded, bonus_points')
          .eq('step_id', stepId);

        if (error) throw error;

        const totalPoints = data?.reduce((sum, question) => 
          sum + (question.points_awarded || 0), 0
        ) || 0;

        setQuizPoints(totalPoints);
      } catch (error) {
        console.error('Error fetching quiz points:', error);
        setQuizPoints(0);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizPoints();
  }, [stepId]);

  return { quizPoints, loading };
};