import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Clock, Mail, Shield, TrendingUp, RefreshCw } from 'lucide-react';
import { useLogger } from '@/services/loggingService';
import type { LogEntry, EmailMetrics, PerformanceMetrics, LogLevel, LogCategory } from '@/services/loggingService';

interface EmailMonitoringDashboardProps {
  className?: string;
}

export const EmailMonitoringDashboard: React.FC<EmailMonitoringDashboardProps> = ({ 
  className = '' 
}) => {
  const logger = useLogger();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [emailMetrics, setEmailMetrics] = useState<EmailMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Auto-refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch logs with filters
      const logFilters: any = {
        timeRange: getTimeRangeFilter(),
        limit: 100
      };
      
      if (levelFilter !== 'all') {
        logFilters.level = [levelFilter];
      }
      
      if (categoryFilter !== 'all') {
        logFilters.category = [categoryFilter];
      }

      const [logsData, emailData, perfData] = await Promise.allSettled([
        logger.searchLogs(logFilters),
        logger.getEmailMetrics(timeRange === '30d' ? '7d' : timeRange),
        logger.getPerformanceMetrics(timeRange === '30d' ? '7d' : timeRange)
      ]);

      if (logsData.status === 'fulfilled') {
        setLogs(logsData.value.filter(log => 
          searchQuery === '' || 
          log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.category.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      }

      if (emailData.status === 'fulfilled') {
        setEmailMetrics(emailData.value);
      }

      if (perfData.status === 'fulfilled') {
        setPerformanceMetrics(perfData.value);
      }

    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      logger.error('system', 'Failed to fetch monitoring data', { error });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTimeRangeFilter = () => {
    const now = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case '1h':
        start.setHours(now.getHours() - 1);
        break;
      case '24h':
        start.setDate(now.getDate() - 1);
        break;
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
    }
    
    return { start: start.toISOString(), end: now.toISOString() };
  };

  const getLevelBadge = (level: LogLevel) => {
    const variants = {
      debug: 'secondary',
      info: 'default',
      warn: 'outline',
      error: 'destructive',
      critical: 'destructive'
    } as const;

    const icons = {
      debug: Clock,
      info: CheckCircle,
      warn: AlertTriangle,
      error: XCircle,
      critical: AlertTriangle
    };

    const Icon = icons[level];

    return (
      <Badge variant={variants[level]} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: LogCategory) => {
    const icons = {
      email: Mail,
      auth: Shield,
      journey: TrendingUp,
      payment: TrendingUp,
      security: Shield,
      performance: TrendingUp,
      system: TrendingUp
    };

    const Icon = icons[category] || TrendingUp;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Chargement des données de monitoring...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoring Email & Système</h2>
          <p className="text-muted-foreground">
            Surveillance en temps réel des emails et performances système
          </p>
        </div>
        <Button 
          onClick={fetchData} 
          variant="outline" 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {emailMetrics && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Envoyés</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailMetrics.sent}</div>
                <p className="text-xs text-muted-foreground">
                  Taux de succès: {emailMetrics.successRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Échecs</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{emailMetrics.failed}</div>
                <p className="text-xs text-muted-foreground">
                  Tentatives: {emailMetrics.retried}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {performanceMetrics && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temps de Réponse</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceMetrics.averageResponseTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Taux d'erreur: {performanceMetrics.errorRate.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Débit: {performanceMetrics.throughput.toFixed(1)}/s
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres et Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Rechercher dans les logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 heure</SelectItem>
                <SelectItem value="24h">24 heures</SelectItem>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={(value: any) => setLevelFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous niveaux</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warn</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="security">Sécurité</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle>Logs Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getCategoryIcon(log.category)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getLevelBadge(log.level)}
                      <span className="text-sm font-medium">{log.message}</span>
                    </div>
                    
                    {log.context && Object.keys(log.context).length > 0 && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">
                          Voir le contexte
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
              
              {logs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun log trouvé pour les critères sélectionnés
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};