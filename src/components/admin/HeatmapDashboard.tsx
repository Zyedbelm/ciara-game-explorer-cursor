
import React, { useState, useCallback, useEffect, memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Clock, Users } from 'lucide-react';
import { useGeographicAnalytics } from '@/hooks/useGeographicAnalytics';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SimpleHeatmapMap from '@/components/maps/SimpleHeatmapMap';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { useDebounce } from '@/hooks/useDebounce';

interface HeatmapDashboardProps {
  cityId?: string;
  timeRange?: string;
}

const HeatmapDashboardComponent: React.FC<HeatmapDashboardProps> = ({ cityId, timeRange: propTimeRange }) => {
  const [timeRange, setTimeRange] = useState(propTimeRange || '30d');
  const [mapApiKey, setMapApiKey] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  // Stable references to prevent infinite re-renders
  const stableCityId = useMemo(() => cityId, [cityId]);
  const stableTimeRange = useMemo(() => timeRange, [timeRange]);
  
  const { analytics, loading, error, refetch } = useGeographicAnalytics(stableCityId, stableTimeRange);
  const { toast } = useToast();
  const { captureError } = useErrorBoundary();

  // Move all memoized calculations to the beginning before any early returns
  const shouldShowHeatmap = useMemo(() => 
    stableCityId && analytics?.heatmapData?.length > 0, 
    [stableCityId, analytics?.heatmapData?.length]
  );
  
  const hasNoDataForCity = useMemo(() => 
    stableCityId && (!analytics?.heatmapData || analytics.heatmapData.length === 0),
    [stableCityId, analytics?.heatmapData]
  );

  const canShowMap = useMemo(() => 
    isReady && mapApiKey && !mapLoading && shouldShowHeatmap,
    [isReady, mapApiKey, mapLoading, shouldShowHeatmap]
  );

  // Memoize data processing functions
  const topHours = useMemo(() => {
    if (!analytics?.visitDistribution.hourly) return [];
    return Object.entries(analytics.visitDistribution.hourly)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: `${hour}h`, count }));
  }, [analytics?.visitDistribution.hourly]);

  const topDays = useMemo(() => {
    if (!analytics?.visitDistribution.daily) return [];
    return Object.entries(analytics.visitDistribution.daily)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day, count]) => ({ day, count }));
  }, [analytics?.visitDistribution.daily]);

  console.log('🗺️ HeatmapDashboard - cityId:', stableCityId, 'timeRange:', stableTimeRange, 'hasAnalytics:', !!analytics, 'isReady:', isReady);

  // Fetch Google Maps API key - stable callback
  const fetchApiKey = useCallback(async () => {
    try {
      console.log('🗺️ Fetching Google Maps API key...');
      setMapLoading(true);
      const { data, error } = await supabase.functions.invoke('get-google-maps-key');
      
      if (error) throw error;
      
      if (data?.apiKey) {
        setMapApiKey(data.apiKey);
        console.log('✅ Google Maps API key loaded successfully');
      } else {
        throw new Error('Clé API Google Maps non disponible');
      }
    } catch (err) {
      console.error('❌ Error fetching Google Maps API key:', err);
      captureError(err as Error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la carte. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setMapLoading(false);
    }
  }, [toast, captureError]);

  // Component ready state management
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady) {
      fetchApiKey();
    }
  }, [fetchApiKey, isReady]);

  if (!isReady || loading || mapLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse Géographique</CardTitle>
          <CardDescription>
            {!isReady ? 'Préparation du composant...' : 'Chargement des données géographiques...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse Géographique</CardTitle>
          <CardDescription>Erreur lors du chargement</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button onClick={refetch} className="mt-4">Réessayer</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analyse Géographique Interactive</h2>
          <p className="text-muted-foreground">Visualisation des données de fréquentation par zone</p>
        </div>
        <div className="flex gap-4">
          <Select value={stableTimeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">1 année</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refetch} variant="outline">
            Actualiser
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Chauds</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.heatmapData.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Zones d'activité
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clusters Populaires</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.stepClusters.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Groupes d'étapes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Routes Populaires</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.popularRoutes.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Connexions identifiées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heures de Pointe</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topHours[0]?.hour || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Pic d'activité
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle>Heatmap Interactive</CardTitle>
          <CardDescription>
            Visualisation des zones de forte activité touristique
            {stableCityId && " - Vue filtrée par ville"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!stableCityId ? (
            // Aucune ville sélectionnée - Message informatif
            <div className="h-96 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
              <div className="text-center max-w-md">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez une ville</h3>
                <p className="text-muted-foreground">
                  Pour afficher la heatmap interactive, veuillez sélectionner une ville spécifique dans les filtres géographiques ci-dessus.
                </p>
              </div>
            </div>
          ) : hasNoDataForCity ? (
            // Ville sélectionnée mais pas de données
            <div className="h-96 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
              <div className="text-center max-w-md">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune donnée disponible</h3>
                <p className="text-muted-foreground">
                  Aucune activité touristique n'a été enregistrée pour cette ville sur la période sélectionnée.
                </p>
                <Button onClick={refetch} className="mt-4" variant="outline">
                  Actualiser les données
                </Button>
              </div>
            </div>
          ) : !mapApiKey ? (
            // Problème avec l'API key
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Carte indisponible</h3>
                <p className="text-muted-foreground">
                  La clé API Google Maps n'est pas configurée.
                </p>
                <Button onClick={fetchApiKey} className="mt-4">
                  Réessayer
                </Button>
              </div>
            </div>
          ) : (
            // Ville sélectionnée avec données - Afficher la heatmap
            <SimpleHeatmapMap 
              heatmapData={analytics?.heatmapData || []}
              center={{ lat: 46.2276, lng: 7.3594 }} // Sion coordinates - could be dynamic based on city
              zoom={13}
              className="w-full h-[400px]"
            />
          )}
        </CardContent>
      </Card>

      {/* Distribution Analysis - Seulement si on a des données */}
      {shouldShowHeatmap && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Horaire</CardTitle>
              <CardDescription>Répartition des visites par heure de la journée</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topHours.map((item, index) => (
                  <div key={item.hour} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{item.hour}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...topHours.map(h => h.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribution Hebdomadaire</CardTitle>
              <CardDescription>Répartition des visites par jour de la semaine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDays.map((item, index) => (
                  <div key={item.day} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium capitalize">{item.day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...topDays.map(d => d.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popular Locations - Seulement si on a des données */}
      {shouldShowHeatmap && (
        <Card>
          <CardHeader>
            <CardTitle>Étapes les Plus Populaires</CardTitle>
            <CardDescription>Classement des étapes par nombre de complétions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.heatmapData
                .sort((a, b) => b.completions - a.completions)
                .slice(0, 5)
                .map((point, index) => (
                  <div key={point.stepId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{point.stepName}</p>
                        <p className="text-sm text-muted-foreground">
                          {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{point.completions}</p>
                      <p className="text-sm text-muted-foreground">complétions</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const HeatmapDashboard = memo(HeatmapDashboardComponent, (prevProps, nextProps) => {
  return (
    prevProps.cityId === nextProps.cityId &&
    prevProps.timeRange === nextProps.timeRange
  );
});
