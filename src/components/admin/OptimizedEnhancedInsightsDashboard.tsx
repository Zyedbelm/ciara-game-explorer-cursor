
import React, { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminGeographicalFilters } from './AdminGeographicalFilters';
import { useQuickStatsMetrics } from '@/hooks/useQuickStatsMetrics';
import { 
  BarChart3, 
  Map, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Info,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Lazy load heavy dashboard components
const HeatmapDashboard = lazy(() => import('./HeatmapDashboard').then(module => ({ default: module.HeatmapDashboard })));
const TourismMetricsDashboard = lazy(() => import('./TourismMetricsDashboard').then(module => ({ default: module.TourismMetricsDashboard })));
const AdvancedVisualizationsDashboard = lazy(() => import('./AdvancedVisualizationsDashboard').then(module => ({ default: module.AdvancedVisualizationsDashboard })));

interface GeographicalFilters {
  selectedCountry: string | null;
  selectedCity: string | null;
  searchTerm: string;
}

interface OptimizedEnhancedInsightsDashboardProps {
  timeRange?: string;
}

// Loading fallback component
const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Error boundary component
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Info className="h-5 w-5" />
              Erreur de chargement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Une erreur s'est produite lors du chargement de ce dashboard.
            </p>
            <Button 
              onClick={() => this.setState({ hasError: false })}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export const OptimizedEnhancedInsightsDashboard: React.FC<OptimizedEnhancedInsightsDashboardProps> = ({ 
  timeRange = '30d' 
}) => {
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('geographic');
  const [globalTimeRange, setGlobalTimeRange] = useState(timeRange);
  const [filters, setFilters] = useState<GeographicalFilters>({
    selectedCountry: null,
    selectedCity: null,
    searchTerm: ''
  });

  // Utiliser le hook pour les métriques dynamiques
  const { metrics: quickStats, loading: quickStatsLoading, refetch: refetchQuickStats } = useQuickStatsMetrics(filters);
  
  const isSuperAdmin = profile?.role === 'super_admin';
  
  // Determine effective city ID based on user role and filters
  const targetCityId = React.useMemo(() => {
    if (isSuperAdmin) {
      return filters.selectedCity;
    } else if (profile?.role === 'tenant_admin') {
      return profile.city_id;
    }
    return undefined;
  }, [isSuperAdmin, filters.selectedCity, profile]);

  const tabs = [
    {
      id: 'geographic',
      label: 'Analyse Géographique',
      icon: Map,
      description: 'Heatmaps interactives et analyse spatiale',
      component: HeatmapDashboard,
      badges: ['Temps réel', 'Maps API']
    },
    {
      id: 'tourism',
      label: 'Métriques Touristiques',
      icon: TrendingUp,
      description: 'KPIs spécialisés et alertes intelligentes',
      component: TourismMetricsDashboard,
      badges: ['IA Intégrée', 'Alertes']
    },
    {
      id: 'advanced',
      label: 'Calendrier d\'Activité',
      icon: BarChart3,
      description: 'Analyses approfondies et tendances prédictives',
      component: AdvancedVisualizationsDashboard,
      badges: ['D3.js', 'Prédictif']
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  // Handle filter changes
  const handleFiltersChange = React.useCallback((newFilters: GeographicalFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle refresh all
  const handleRefreshAll = React.useCallback(() => {
    refetchQuickStats();
    window.location.reload();
  }, [refetchQuickStats]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights Avancés</h1>
          <p className="text-muted-foreground">
            Analyses approfondies et visualisations interactives pour optimiser votre stratégie touristique
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={globalTimeRange} onValueChange={setGlobalTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période globale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">1 année</SelectItem>
              <SelectItem value="2y">2 années</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefreshAll}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser tout
          </Button>
        </div>
      </div>

      {/* Geographical Filters */}
      <AdminGeographicalFilters
        onFiltersChange={handleFiltersChange}
      />

      {/* Quick Stats Cards - Now Dynamic */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zones Actives</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {quickStatsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {quickStats?.activeZones || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  points chauds identifiés
                  {filters.selectedCity && ' (filtré)'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {quickStatsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {quickStats?.performanceScore?.toFixed(1) || '0.0'}
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  vs benchmark secteur
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {quickStatsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {quickStats?.activeAlerts?.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {quickStats?.activeAlerts?.high > 0 && (
                    <span className="text-red-600">{quickStats.activeAlerts.high} haute{quickStats.activeAlerts.high > 1 ? 's' : ''}</span>
                  )}
                  {quickStats?.activeAlerts?.high > 0 && quickStats?.activeAlerts?.medium > 0 && ', '}
                  {quickStats?.activeAlerts?.medium > 0 && (
                    <span className="text-orange-600">{quickStats.activeAlerts.medium} moyenne{quickStats.activeAlerts.medium > 1 ? 's' : ''}</span>
                  )}
                  {(quickStats?.activeAlerts?.high > 0 || quickStats?.activeAlerts?.medium > 0) && quickStats?.activeAlerts?.low > 0 && ', '}
                  {quickStats?.activeAlerts?.low > 0 && (
                    <span className="text-green-600">{quickStats.activeAlerts.low} faible{quickStats.activeAlerts.low > 1 ? 's' : ''}</span>
                  )}
                  {!quickStats?.activeAlerts?.total && 'Aucune alerte'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernière Maj</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {quickStatsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {quickStats?.lastUpdate || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  données temps réel
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            {/* Lazy-loaded dashboard component with error boundary */}
            <DashboardErrorBoundary>
              <Suspense 
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Chargement du dashboard {tab.label.toLowerCase()}...
                      </p>
                    </div>
                  </div>
                }
              >
                {React.createElement(tab.component, {
                  cityId: targetCityId,
                  timeRange: globalTimeRange
                })}
              </Suspense>
            </DashboardErrorBoundary>
          </TabsContent>
        ))}
      </Tabs>

    </div>
  );
};
