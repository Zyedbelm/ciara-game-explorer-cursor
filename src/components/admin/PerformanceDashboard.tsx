import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Database, 
  Clock, 
  TrendingUp, 
  RefreshCw, 
  Gauge, 
  MemoryStick,
  Network,
  Timer,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useOptimizedEmailService } from '@/services/optimizedEmailService';
import { useLogger } from '@/services/loggingService';

interface PerformanceDashboardProps {
  className?: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  className = '' 
}) => {
  const optimizedEmailService = useOptimizedEmailService();
  const logger = useLogger();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      
      const [
        emailMetrics,
        performanceMetrics,
        cacheMetrics
      ] = await Promise.allSettled([
        optimizedEmailService.getPerformanceMetrics(),
        logger.getPerformanceMetrics('1h'),
        optimizedEmailService.getPerformanceMetrics()
      ]);

      if (emailMetrics.status === 'fulfilled') {
        setMetrics(emailMetrics.value);
      }

      if (performanceMetrics.status === 'fulfilled') {
        setSystemMetrics(performanceMetrics.value);
      }

      if (cacheMetrics.status === 'fulfilled') {
        setCacheStats(cacheMetrics.value.cacheStats);
      }

    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      logger.error('performance', 'Failed to fetch performance metrics', { error });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCacheClear = async () => {
    try {
      optimizedEmailService.invalidateTemplateCache();
      logger.info('performance', 'Cache cleared manually');
      await fetchMetrics();
    } catch (error) {
      logger.error('performance', 'Failed to clear cache', { error });
    }
  };

  const handlePreloadTemplates = async () => {
    try {
      await optimizedEmailService.preloadCommonTemplates();
      logger.info('performance', 'Templates preloaded');
      await fetchMetrics();
    } catch (error) {
      logger.error('performance', 'Failed to preload templates', { error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Chargement des métriques de performance...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Performance</h2>
          <p className="text-muted-foreground">
            Monitoring temps réel des performances système et cache
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handlePreloadTemplates} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Précharger Templates
          </Button>
          <Button 
            onClick={handleCacheClear} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Vider Cache
          </Button>
          <Button 
            onClick={fetchMetrics} 
            variant="outline" 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Queue Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File d'Attente</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.queueSize || 0}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${
                metrics?.processingStatus ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span>
                {metrics?.processingStatus ? 'En traitement' : 'En attente'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Connection Pool */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pool Connexions</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.connectionPoolSize || 0}/8
            </div>
            <Progress 
              value={(metrics?.connectionPoolSize || 0) / 8 * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Cache Hit Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Cache</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats?.hitRate?.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              {cacheStats?.hits || 0} hits / {cacheStats?.misses || 0} miss
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Réponse</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics?.averageResponseTime?.toFixed(0) || 0}ms
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {(systemMetrics?.averageResponseTime || 0) < 1000 ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
              )}
              <span className="text-muted-foreground">
                Seuil: 1000ms
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="cache" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cache">Cache & Templates</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        {/* Cache Tab */}
        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Statistiques Cache
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Entrées en cache</span>
                  <Badge variant="secondary">{cacheStats?.size || 0}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Utilisation mémoire</span>
                  <span className="text-sm text-muted-foreground">
                    {((cacheStats?.memoryUsage || 0) / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taux de succès</span>
                    <span>{cacheStats?.hitRate?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={cacheStats?.hitRate || 0} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {cacheStats?.hits || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Cache Hits</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {cacheStats?.misses || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Cache Miss</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="w-5 h-5" />
                  Optimisations Actives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cache Templates</span>
                  <Badge variant="default">Activé</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compression</span>
                  <Badge variant="default">Activé</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Traitement par lots</span>
                  <Badge variant="default">Activé</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pool de connexions</span>
                  <Badge variant="default">8 connexions</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Priorisation</span>
                  <Badge variant="default">Activé</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Métriques Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">File d'attente</span>
                  <span className="font-medium">{metrics?.queueSize || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Connexions libres</span>
                  <span className="font-medium">{metrics?.connectionPoolSize || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Statut traitement</span>
                  <Badge variant={metrics?.processingStatus ? "default" : "secondary"}>
                    {metrics?.processingStatus ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Latence Système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Temps moyen</span>
                  <span className="font-medium">
                    {systemMetrics?.averageResponseTime?.toFixed(0) || 0}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taux d'erreur</span>
                  <span className="font-medium">
                    {systemMetrics?.errorRate?.toFixed(2) || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Débit</span>
                  <span className="font-medium">
                    {systemMetrics?.throughput?.toFixed(1) || 0}/s
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Utilisation Ressources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cache mémoire</span>
                    <span>{((cacheStats?.memoryUsage || 0) / 1024).toFixed(1)} KB</span>
                  </div>
                  <Progress value={Math.min((cacheStats?.memoryUsage || 0) / 10240 * 100, 100)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pool connexions</span>
                    <span>{metrics?.connectionPoolSize || 0}/8</span>
                  </div>
                  <Progress value={(metrics?.connectionPoolSize || 0) / 8 * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Santé du Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {systemMetrics?.activeUsers || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Utilisateurs Actifs</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {systemMetrics?.throughput?.toFixed(1) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Requêtes/sec</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {systemMetrics?.errorRate?.toFixed(2) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Taux d'Erreur</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {systemMetrics?.averageResponseTime?.toFixed(0) || 0}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Latence Moy.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};