import { useEffect, useRef } from 'react';
import { usePerformanceLogger } from './usePerformanceLogger';

/**
 * Hook de monitoring global pour les performances des parcours
 * Phase 4: Surveillance en temps réel
 */
export const useJourneyPerformanceMonitor = () => {
  const { measure, getSummary } = usePerformanceLogger({
    component: 'JourneySystem',
    threshold: 200
  });

  const performanceCheckRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check performance every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      performanceCheckRef.current = setInterval(() => {
        const summary = getSummary();
        if (summary && summary.actions.length > 0) {
          const slowActions = summary.actions.filter(action => action.avgDuration > 1000);
          if (slowActions.length > 0) {
          }
        }
      }, 30000);
    }

    return () => {
      if (performanceCheckRef.current) {
        clearInterval(performanceCheckRef.current);
      }
    };
  }, [getSummary]);

  return { measure };
};