import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Map, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { OptimizedHeatmapDashboard } from './OptimizedHeatmapDashboard';
import { TourismMetricsDashboard } from './TourismMetricsDashboard';
import { AdvancedVisualizationsDashboard } from './AdvancedVisualizationsDashboard';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';

interface EnhancedInsightsDashboardProps {
  cityId?: string;
}

export const EnhancedInsightsDashboard: React.FC<EnhancedInsightsDashboardProps> = ({ cityId }) => {
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { captureError } = useErrorBoundary();
  const [activeTab, setActiveTab] = useState('geographic');
  const [globalTimeRange, setGlobalTimeRange] = useState('30d');
  
  // Memoized calculations to prevent unnecessary re-renders
  const isSuperAdmin = useMemo(() => profile?.role === 'super_admin', [profile?.role]);
  const targetCityId = useMemo(() => isSuperAdmin ? cityId : profile?.city_id, [isSuperAdmin, cityId, profile?.city_id]);
  
  // Prevent renders while profile is loading
  const isProfileReady = useMemo(() => !!profile, [profile]);

  const tabs = [
    {
      id: 'geographic',
      label: 'Analyse Géographique',
      icon: Map,
      description: 'Heatmaps interactives et analyse spatiale',
      component: OptimizedHeatmapDashboard
    },
    {
      id: 'tourism',
      label: 'Métriques Touristiques',
      icon: TrendingUp,
      description: 'KPIs spécialisés et alertes',
      component: TourismMetricsDashboard
    },
    {
      id: 'advanced',
      label: 'Visualisations Avancées',
      icon: BarChart3,
      description: 'Analyses approfondies et tendances',
      component: AdvancedVisualizationsDashboard
    }
  ];

  const currentTab = useMemo(() => tabs.find(tab => tab.id === activeTab), [tabs, activeTab]);
  const TabComponent = currentTab?.component;

  const handleRefresh = useCallback(() => {
    try {
      window.location.reload();
    } catch (err) {
      captureError(err as Error);
    }
  }, [captureError]);

  // Show loading state while profile is loading
  if (!isProfileReady) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du profil utilisateur...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser tout
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zones Actives</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              points chauds identifiés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.7<span className="text-sm text-muted-foreground">/10</span></div>
            <p className="text-xs text-muted-foreground">
              vs benchmark secteur
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">2 moyennes</span>, <span className="text-red-600">1 haute</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernière Maj</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2min</div>
            <p className="text-xs text-muted-foreground">
              données temps réel
            </p>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{tab.label}</h2>
                <p className="text-sm text-muted-foreground">{tab.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Temps réel
                </Badge>
                {tab.id === 'geographic' && (
                  <Badge variant="secondary" className="text-xs">
                    Maps API
                  </Badge>
                )}
                {tab.id === 'tourism' && (
                  <Badge variant="secondary" className="text-xs">
                    IA Intégrée
                  </Badge>
                )}
                {tab.id === 'advanced' && (
                  <Badge variant="secondary" className="text-xs">
                    D3.js
                  </Badge>
                )}
              </div>
            </div>
            
            {TabComponent && (
              <TabComponent cityId={targetCityId} timeRange={globalTimeRange} />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Footer Information */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">À propos de ces analyses</p>
              <p className="text-xs text-muted-foreground">
                Les données sont actualisées en temps réel et incluent des analyses prédictives basées sur l'IA. 
                Les benchmarks sectoriels sont fournis par l'observatoire du tourisme numérique.
                {isSuperAdmin && " En tant que super admin, vous voyez les données agrégées de toutes les destinations."}
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Données en temps réel</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Analyses prédictives</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Benchmarks sectoriels</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};