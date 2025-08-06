import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  component: string;
  action: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface UsePerformanceLoggerOptions {
  enabled?: boolean;
  component: string;
  logToConsole?: boolean;
  threshold?: number; // Log only if duration exceeds this (ms)
}

/**
 * Hook pour mesurer et logger les performances
 * Phase 4.1: Monitoring des performances en temps réel
 */
export const usePerformanceLogger = ({
  enabled = process.env.NODE_ENV === 'development',
  component,
  logToConsole = true,
  threshold = 100
}: UsePerformanceLoggerOptions) => {
  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  // Start timing an action
  const startTimer = useCallback((action: string) => {
    if (!enabled) return;
    
    const key = `${component}-${action}`;
    timersRef.current.set(key, performance.now());
    
    }, [enabled, component]);

  // End timing and log metrics
  const endTimer = useCallback((action: string, metadata?: Record<string, any>) => {
    if (!enabled) return;
    
    const key = `${component}-${action}`;
    const startTime = timersRef.current.get(key);
    
    if (startTime === undefined) {
      return;
    }
    
    const duration = performance.now() - startTime;
    timersRef.current.delete(key);
    
    // Only log if duration exceeds threshold
    if (duration >= threshold) {
      const metrics: PerformanceMetrics = {
        component,
        action,
        duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
        timestamp: Date.now(),
        metadata
      };
      
      metricsRef.current.push(metrics);
      
      if (logToConsole) {
        }

      // Keep only last 100 metrics
      if (metricsRef.current.length > 100) {
        metricsRef.current = metricsRef.current.slice(-100);
      }
    }
  }, [enabled, component, threshold, logToConsole]);

  // Measure a function execution
  const measure = useCallback(async <T>(
    action: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    if (!enabled) {
      return fn();
    }
    
    startTimer(action);
    try {
      const result = await fn();
      endTimer(action, metadata);
      return result;
    } catch (error) {
      endTimer(action, { ...metadata, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }, [enabled, startTimer, endTimer]);

  // Get performance metrics
  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  // Get performance summary
  const getSummary = useCallback(() => {
    const metrics = metricsRef.current;
    if (metrics.length === 0) return null;

    const actionStats = metrics.reduce((acc, metric) => {
      if (!acc[metric.action]) {
        acc[metric.action] = {
          count: 0,
          totalDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
          avgDuration: 0
        };
      }
      
      const stats = acc[metric.action];
      stats.count++;
      stats.totalDuration += metric.duration;
      stats.minDuration = Math.min(stats.minDuration, metric.duration);
      stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
      stats.avgDuration = stats.totalDuration / stats.count;
      
      return acc;
    }, {} as Record<string, any>);

    return {
      component,
      totalMeasurements: metrics.length,
      actions: Object.keys(actionStats).map(action => ({
        action,
        ...actionStats[action],
        avgDuration: Math.round(actionStats[action].avgDuration * 100) / 100
      }))
    };
  }, [component]);

  // Log summary on component unmount
  useEffect(() => {
    return () => {
      if (enabled && logToConsole && metricsRef.current.length > 0) {
        const summary = getSummary();
        if (summary) {
          }
      }
    };
  }, [enabled, logToConsole, component, getSummary]);

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.clear();
    };
  }, []);

  return {
    startTimer,
    endTimer,
    measure,
    getMetrics,
    getSummary,
    // Convenience methods for common operations
    logRender: () => startTimer('render'),
    endRender: () => endTimer('render'),
    logMount: () => startTimer('mount'),
    endMount: () => endTimer('mount'),
    logUpdate: () => startTimer('update'),
    endUpdate: () => endTimer('update')
  };
};
