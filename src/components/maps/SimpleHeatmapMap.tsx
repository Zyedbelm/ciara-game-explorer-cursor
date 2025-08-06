import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, TrendingUp, Route } from 'lucide-react';

interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  stepId: string;
  stepName: string;
  completions: number;
}

interface SimpleHeatmapMapProps {
  heatmapData: HeatmapPoint[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

const SimpleHeatmapMap: React.FC<SimpleHeatmapMapProps> = ({
  heatmapData,
  center = { lat: 46.2044, lng: 6.1432 },
  zoom = 13,
  className = "w-full h-96"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const heatmapLayerRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'clusters' | 'routes'>('heatmap');

  // Single initialization effect
  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        // Get API key
        let apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          const { data } = await supabase.functions.invoke('get-google-maps-key');
          apiKey = data?.apiKey;
        }

        if (!apiKey) {
          throw new Error('Google Maps API key not available');
        }

        // Load Google Maps API
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['visualization']
        });

        const google = await loader.load();
        
        if (!mounted || !mapRef.current) return;

        // Create map
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;
        
        if (mounted) {
          setIsLoaded(true);
          }

      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize map');
        }
      }
    };

    initializeMap();

    return () => {
      mounted = false;
    };
  }, [center.lat, center.lng, zoom]);

  // Update visualization when data or view mode changes
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !window.google) return;

    clearVisualization();
    createVisualization();
  }, [isLoaded, heatmapData, viewMode]);

  const clearVisualization = () => {
    // Clear heatmap
    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.setMap(null);
      heatmapLayerRef.current = null;
    }

    // Clear markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear polylines
    polylinesRef.current.forEach(line => line.setMap(null));
    polylinesRef.current = [];
  };

  const createVisualization = () => {
    if (!mapInstanceRef.current || !window.google || heatmapData.length === 0) return;

    const map = mapInstanceRef.current;

    switch (viewMode) {
      case 'heatmap':
        createHeatmap(map);
        break;
      case 'clusters':
        createClusters(map);
        break;
      case 'routes':
        createRoutes(map);
        break;
    }
  };

  const createHeatmap = (map: google.maps.Map) => {
    const heatmapDataPoints = heatmapData.map(point => ({
      location: new window.google.maps.LatLng(point.lat, point.lng),
      weight: point.weight
    }));

    const heatmap = new window.google.maps.visualization.HeatmapLayer({
      data: heatmapDataPoints,
      map,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ],
      radius: 20,
      opacity: 0.8
    });

    heatmapLayerRef.current = heatmap;
  };

  const createClusters = (map: google.maps.Map) => {
    heatmapData.forEach(point => {
      const size = Math.min(50, Math.max(20, point.weight * 30));
      const color = getColorByWeight(point.weight);

      const marker = new window.google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map,
        title: `${point.stepName} (${point.completions} complétions)`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
              <text x="${size/2}" y="${size/2 + 4}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle">${point.completions}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(size, size),
          anchor: new window.google.maps.Point(size/2, size/2)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">${point.stepName}</h3>
            <p style="margin: 0; color: #666;">Complétions: ${point.completions}</p>
            <p style="margin: 0; color: #666;">Poids: ${point.weight.toFixed(2)}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const createRoutes = (map: google.maps.Map) => {
    // Sort by weight and connect top points
    const sortedPoints = [...heatmapData].sort((a, b) => b.weight - a.weight);
    const topPoints = sortedPoints.slice(0, Math.min(10, sortedPoints.length));

    for (let i = 0; i < topPoints.length - 1; i++) {
      const start = topPoints[i];
      const end = topPoints[i + 1];

      const routeLine = new window.google.maps.Polyline({
        path: [
          { lat: start.lat, lng: start.lng },
          { lat: end.lat, lng: end.lng }
        ],
        geodesic: true,
        strokeColor: getColorByWeight((start.weight + end.weight) / 2),
        strokeOpacity: 0.8,
        strokeWeight: Math.max(2, Math.min(8, start.weight * 5))
      });

      routeLine.setMap(map);
      polylinesRef.current.push(routeLine);
    }

    // Add markers for route points
    topPoints.forEach((point, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map,
        title: `${index + 1}. ${point.stepName}`,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold'
        }
      });

      markersRef.current.push(marker);
    });
  };

  const getColorByWeight = (weight: number): string => {
    if (weight < 0.3) return '#10B981'; // Green
    if (weight < 0.6) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const handleRefresh = () => {
    setError(null);
    setIsLoaded(false);
    
    // Clean up current map
    if (mapInstanceRef.current) {
      clearVisualization();
      mapInstanceRef.current = null;
    }

    // Re-trigger initialization
    setTimeout(() => {
      if (mapRef.current) {
        // The useEffect will handle re-initialization
        setIsLoaded(false);
      }
    }, 100);
  };

  if (error) {
    return (
      <Card className={className}>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center mb-4">
            Erreur lors du chargement de la carte heatmap
          </p>
          <p className="text-xs text-muted-foreground text-center mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="relative h-full">
        {/* Loading overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
            </div>
          </div>
        )}

        {/* View mode controls */}
        {isLoaded && heatmapData.length > 0 && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'heatmap' ? 'default' : 'outline'}
              onClick={() => setViewMode('heatmap')}
              className="bg-white/90"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Heatmap
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'clusters' ? 'default' : 'outline'}
              onClick={() => setViewMode('clusters')}
              className="bg-white/90"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Clusters
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'routes' ? 'default' : 'outline'}
              onClick={() => setViewMode('routes')}
              className="bg-white/90"
            >
              <Route className="h-4 w-4 mr-1" />
              Routes
            </Button>
          </div>
        )}

        {/* Refresh button */}
        {isLoaded && (
          <div className="absolute top-4 left-4 z-10">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              className="bg-white/90"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* No data message */}
        {isLoaded && heatmapData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Aucune donnée à afficher</p>
            </div>
          </div>
        )}

        {/* Map container */}
        <div ref={mapRef} className="w-full h-full rounded-lg" />
      </div>
    </Card>
  );
};

export default SimpleHeatmapMap;