
import { useRef, useEffect } from 'react';

interface RenderStats {
  count: number;
  lastRender: number;
  component: string;
}

/**
 * Hook pour détecter les re-rendus excessifs et les boucles infinies
 */
export function useRenderTracker(componentName: string, threshold = 10) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const warningShown = useRef(false);

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    // Si plus de 'threshold' rendus en moins de 1 seconde
    if (renderCount.current > threshold && timeSinceLastRender < 1000) {
      if (!warningShown.current) {
        warningShown.current = true;
      }
    }

    // Reset counter après 5 secondes de calme
    if (timeSinceLastRender > 5000) {
      renderCount.current = 1;
      warningShown.current = false;
    }

    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    resetWarning: () => { warningShown.current = false; }
  };
}
