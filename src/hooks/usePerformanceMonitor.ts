import { useEffect, useCallback, useRef, useState } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  translationCacheHitRate: number;
  imageLoadTime: number;
  apiResponseTime: number;
}

interface PerformanceThresholds {
  pageLoadTime: number; // 3 secondes
  firstContentfulPaint: number; // 1.8 secondes
  largestContentfulPaint: number; // 2.5 secondes
  cumulativeLayoutShift: number; // 0.1
  firstInputDelay: number; // 100ms
  translationCacheHitRate: number; // 0.8 (80%)
  imageLoadTime: number; // 2 secondes
  apiResponseTime: number; // 1 seconde
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  pageLoadTime: 3000,
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100,
  translationCacheHitRate: 0.8,
  imageLoadTime: 2000,
  apiResponseTime: 1000
};

export function usePerformanceMonitor(thresholds: Partial<PerformanceThresholds> = {}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const imageLoadTimesRef = useRef<number[]>([]);
  const apiResponseTimesRef = useRef<number[]>([]);
  const translationCacheHitsRef = useRef<number>(0);
  const translationCacheMissesRef = useRef<number>(0);

  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // Mesurer le temps de chargement de la page
  const measurePageLoadTime = useCallback(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        return navigation.loadEventEnd - navigation.loadEventStart;
      }
    }
    return Date.now() - startTimeRef.current;
  }, []);

  // Mesurer les Core Web Vitals
  const measureCoreWebVitals = useCallback(() => {
    return new Promise<Partial<PerformanceMetrics>>((resolve) => {
      const metrics: Partial<PerformanceMetrics> = {};

      // First Contentful Paint
      if ('PerformanceObserver' in window) {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            metrics.firstContentfulPaint = entries[0].startTime;
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            metrics.largestContentfulPaint = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // Cumulative Layout Shift
      if ('PerformanceObserver' in window) {
        const clsObserver = new PerformanceObserver((list) => {
          let cls = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += (entry as any).value;
            }
          }
          metrics.cumulativeLayoutShift = cls;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }

      // First Input Delay
      if ('PerformanceObserver' in window) {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            metrics.firstInputDelay = entries[0].processingStart - entries[0].startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      }

      // Attendre un peu pour collecter les métriques
      setTimeout(() => resolve(metrics), 1000);
    });
  }, []);

  // Monitorer les temps de chargement d'images
  const monitorImageLoadTimes = useCallback(() => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const startTime = Date.now();
      
      if (img.complete) {
        imageLoadTimesRef.current.push(0);
      } else {
        img.addEventListener('load', () => {
          const loadTime = Date.now() - startTime;
          imageLoadTimesRef.current.push(loadTime);
        });
        
        img.addEventListener('error', () => {
          imageLoadTimesRef.current.push(-1); // Erreur
        });
      }
    });
  }, []);

  // Monitorer les temps de réponse API
  const monitorApiResponseTimes = useCallback(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        const responseTime = Date.now() - startTime;
        apiResponseTimesRef.current.push(responseTime);
        return response;
      } catch (error) {
        apiResponseTimesRef.current.push(-1); // Erreur
        throw error;
      }
    };
  }, []);

  // Calculer les métriques moyennes
  const calculateAverageMetrics = useCallback(() => {
    const avgImageLoadTime = imageLoadTimesRef.current.length > 0 
      ? imageLoadTimesRef.current.filter(t => t >= 0).reduce((a, b) => a + b, 0) / imageLoadTimesRef.current.filter(t => t >= 0).length
      : 0;

    const avgApiResponseTime = apiResponseTimesRef.current.length > 0
      ? apiResponseTimesRef.current.filter(t => t >= 0).reduce((a, b) => a + b, 0) / apiResponseTimesRef.current.filter(t => t >= 0).length
      : 0;

    const translationCacheHitRate = (translationCacheHitsRef.current + translationCacheMissesRef.current) > 0
      ? translationCacheHitsRef.current / (translationCacheHitsRef.current + translationCacheMissesRef.current)
      : 0;

    return {
      imageLoadTime: avgImageLoadTime,
      apiResponseTime: avgApiResponseTime,
      translationCacheHitRate
    };
  }, []);

  // Détecter les problèmes de performance
  const detectPerformanceIssues = useCallback((metrics: PerformanceMetrics) => {
    const issues: string[] = [];

    if (metrics.pageLoadTime > finalThresholds.pageLoadTime) {
      issues.push(`Temps de chargement de page lent: ${metrics.pageLoadTime}ms (seuil: ${finalThresholds.pageLoadTime}ms)`);
    }

    if (metrics.firstContentfulPaint > finalThresholds.firstContentfulPaint) {
      issues.push(`First Contentful Paint lent: ${metrics.firstContentfulPaint}ms (seuil: ${finalThresholds.firstContentfulPaint}ms)`);
    }

    if (metrics.largestContentfulPaint > finalThresholds.largestContentfulPaint) {
      issues.push(`Largest Contentful Paint lent: ${metrics.largestContentfulPaint}ms (seuil: ${finalThresholds.largestContentfulPaint}ms)`);
    }

    if (metrics.cumulativeLayoutShift > finalThresholds.cumulativeLayoutShift) {
      issues.push(`Cumulative Layout Shift élevé: ${metrics.cumulativeLayoutShift} (seuil: ${finalThresholds.cumulativeLayoutShift})`);
    }

    if (metrics.firstInputDelay > finalThresholds.firstInputDelay) {
      issues.push(`First Input Delay élevé: ${metrics.firstInputDelay}ms (seuil: ${finalThresholds.firstInputDelay}ms)`);
    }

    if (metrics.translationCacheHitRate < finalThresholds.translationCacheHitRate) {
      issues.push(`Taux de cache des traductions faible: ${(metrics.translationCacheHitRate * 100).toFixed(1)}% (seuil: ${finalThresholds.translationCacheHitRate * 100}%)`);
    }

    if (metrics.imageLoadTime > finalThresholds.imageLoadTime) {
      issues.push(`Temps de chargement d'images lent: ${metrics.imageLoadTime}ms (seuil: ${finalThresholds.imageLoadTime}ms)`);
    }

    if (metrics.apiResponseTime > finalThresholds.apiResponseTime) {
      issues.push(`Temps de réponse API lent: ${metrics.apiResponseTime}ms (seuil: ${finalThresholds.apiResponseTime}ms)`);
    }

    return issues;
  }, [finalThresholds]);

  // Démarrer le monitoring
  const startMonitoring = useCallback(async () => {
    setIsMonitoring(true);
    startTimeRef.current = Date.now();

    // Monitorer les images et API
    monitorImageLoadTimes();
    monitorApiResponseTimes();

    // Attendre que la page soit chargée
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async () => {
        const coreWebVitals = await measureCoreWebVitals();
        const pageLoadTime = measurePageLoadTime();
        const averageMetrics = calculateAverageMetrics();

        const finalMetrics: PerformanceMetrics = {
          pageLoadTime,
          firstContentfulPaint: coreWebVitals.firstContentfulPaint || 0,
          largestContentfulPaint: coreWebVitals.largestContentfulPaint || 0,
          cumulativeLayoutShift: coreWebVitals.cumulativeLayoutShift || 0,
          firstInputDelay: coreWebVitals.firstInputDelay || 0,
          translationCacheHitRate: averageMetrics.translationCacheHitRate,
          imageLoadTime: averageMetrics.imageLoadTime,
          apiResponseTime: averageMetrics.apiResponseTime
        };

        setMetrics(finalMetrics);
        setIssues(detectPerformanceIssues(finalMetrics));
        setIsMonitoring(false);
      });
    } else {
      // Page déjà chargée
      const coreWebVitals = await measureCoreWebVitals();
      const pageLoadTime = measurePageLoadTime();
      const averageMetrics = calculateAverageMetrics();

      const finalMetrics: PerformanceMetrics = {
        pageLoadTime,
        firstContentfulPaint: coreWebVitals.firstContentfulPaint || 0,
        largestContentfulPaint: coreWebVitals.largestContentfulPaint || 0,
        cumulativeLayoutShift: coreWebVitals.cumulativeLayoutShift || 0,
        firstInputDelay: coreWebVitals.firstInputDelay || 0,
        translationCacheHitRate: averageMetrics.translationCacheHitRate,
        imageLoadTime: averageMetrics.imageLoadTime,
        apiResponseTime: averageMetrics.apiResponseTime
      };

      setMetrics(finalMetrics);
      setIssues(detectPerformanceIssues(finalMetrics));
      setIsMonitoring(false);
    }
  }, [measureCoreWebVitals, measurePageLoadTime, calculateAverageMetrics, detectPerformanceIssues, monitorImageLoadTimes, monitorApiResponseTimes]);

  // Enregistrer un hit de cache de traduction
  const recordTranslationCacheHit = useCallback(() => {
    translationCacheHitsRef.current++;
  }, []);

  // Enregistrer un miss de cache de traduction
  const recordTranslationCacheMiss = useCallback(() => {
    translationCacheMissesRef.current++;
  }, []);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    metrics,
    issues,
    isMonitoring,
    startMonitoring,
    recordTranslationCacheHit,
    recordTranslationCacheMiss,
    // Fonction pour obtenir un rapport de performance
    getPerformanceReport: () => ({
      metrics,
      issues,
      recommendations: issues.length > 0 ? [
        'Optimiser les images avec des formats modernes (WebP, AVIF)',
        'Implémenter le lazy loading pour les images',
        'Améliorer le cache des traductions',
        'Optimiser les requêtes API',
        'Réduire le JavaScript non critique'
      ] : ['Performance excellente !']
    })
  };
}