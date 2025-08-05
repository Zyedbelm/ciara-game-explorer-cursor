import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  Image, 
  Globe, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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

interface PerformanceDiagnosticProps {
  metrics: PerformanceMetrics | null;
  issues: string[];
  cacheStats: {
    size: number;
    isPreloaded: boolean;
    currentLanguage: string;
  };
  isVisible?: boolean;
}

const PerformanceDiagnostic: React.FC<PerformanceDiagnosticProps> = ({
  metrics,
  issues,
  cacheStats,
  isVisible = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getMetricStatus = (value: number, threshold: number, isLowerBetter = true) => {
    const isGood = isLowerBetter ? value <= threshold : value >= threshold;
    return {
      status: isGood ? 'good' : 'warning',
      icon: isGood ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />
    };
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-black/90 text-white border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Diagnostic
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0 text-white hover:bg-white/10"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 space-y-3">
            {/* Cache des traductions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Cache Traductions
                </span>
                <Badge variant={cacheStats.isPreloaded ? "default" : "secondary"} className="text-xs">
                  {cacheStats.size} items
                </Badge>
              </div>
              <div className="text-xs text-gray-300">
                Langue: {cacheStats.currentLanguage} | 
                Préchargé: {cacheStats.isPreloaded ? '✓' : '✗'}
              </div>
            </div>

            {/* Métriques de performance */}
            {metrics && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-300">Métriques</div>
                
                {/* Page Load Time */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Page Load
                  </span>
                  <span className={getMetricStatus(metrics.pageLoadTime, 3000).status === 'good' ? 'text-green-400' : 'text-yellow-400'}>
                    {formatTime(metrics.pageLoadTime)}
                  </span>
                </div>

                {/* First Contentful Paint */}
                <div className="flex items-center justify-between text-xs">
                  <span>FCP</span>
                  <span className={getMetricStatus(metrics.firstContentfulPaint, 1800).status === 'good' ? 'text-green-400' : 'text-yellow-400'}>
                    {formatTime(metrics.firstContentfulPaint)}
                  </span>
                </div>

                {/* Largest Contentful Paint */}
                <div className="flex items-center justify-between text-xs">
                  <span>LCP</span>
                  <span className={getMetricStatus(metrics.largestContentfulPaint, 2500).status === 'good' ? 'text-green-400' : 'text-yellow-400'}>
                    {formatTime(metrics.largestContentfulPaint)}
                  </span>
                </div>

                {/* Cumulative Layout Shift */}
                <div className="flex items-center justify-between text-xs">
                  <span>CLS</span>
                  <span className={getMetricStatus(metrics.cumulativeLayoutShift, 0.1).status === 'good' ? 'text-green-400' : 'text-yellow-400'}>
                    {metrics.cumulativeLayoutShift.toFixed(3)}
                  </span>
                </div>

                {/* Translation Cache Hit Rate */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    Cache Hit Rate
                  </span>
                  <span className={getMetricStatus(metrics.translationCacheHitRate, 0.8, false).status === 'good' ? 'text-green-400' : 'text-yellow-400'}>
                    {formatPercentage(metrics.translationCacheHitRate)}
                  </span>
                </div>

                {/* Image Load Time */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Image className="h-3 w-3" />
                    Image Load
                  </span>
                  <span className={getMetricStatus(metrics.imageLoadTime, 2000).status === 'good' ? 'text-green-400' : 'text-yellow-400'}>
                    {formatTime(metrics.imageLoadTime)}
                  </span>
                </div>

                {/* API Response Time */}
                <div className="flex items-center justify-between text-xs">
                  <span>API Response</span>
                  <span className={getMetricStatus(metrics.apiResponseTime, 1000).status === 'good' ? 'text-green-400' : 'text-yellow-400'}>
                    {formatTime(metrics.apiResponseTime)}
                  </span>
                </div>
              </div>
            )}

            {/* Problèmes détectés */}
            {issues.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Problèmes détectés ({issues.length})
                </div>
                <div className="space-y-1">
                  {issues.slice(0, 3).map((issue, index) => (
                    <div key={index} className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                      {issue}
                    </div>
                  ))}
                  {issues.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{issues.length - 3} autres problèmes...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommandations */}
            {issues.length === 0 && metrics && (
              <Alert className="bg-green-900/20 border-green-700">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-xs text-green-300">
                  Performance excellente ! Toutes les métriques sont dans les seuils recommandés.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-700">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-6 px-2 border-gray-600 text-white hover:bg-white/10"
                onClick={() => window.location.reload()}
              >
                Reload
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-6 px-2 border-gray-600 text-white hover:bg-white/10"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Clear Cache
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default PerformanceDiagnostic; 