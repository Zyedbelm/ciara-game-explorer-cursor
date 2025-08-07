import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    description?: string;
    completed?: boolean;
  }>;
  userLocation?: { lat: number; lng: number } | null;
  onMarkerClick?: (marker: any) => void;
  className?: string;
}

const GoogleMap: React.FC<MapProps> = ({
  center = { lat: 46.2044, lng: 6.1432 }, // Geneva default
  zoom = 13,
  markers = [],
  userLocation,
  onMarkerClick,
  className = "w-full h-96"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch Google Maps API key with fallback support
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        // Try to get API key from environment variable first (for development)
        const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (envApiKey) {
          setApiKey(envApiKey);
          return;
        }

        // Fallback to Supabase function
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        if (error) {
          throw error;
        }
        if (!data?.apiKey) {
          throw new Error('API key not found in response');
        }
        setApiKey(data.apiKey);
      } catch (err) {
        setError('Impossible de charger la carte - clé API non disponible');
        setIsLoading(false);
        toast({
          title: "Erreur de carte",
          description: "Impossible de charger Google Maps - configuration API manquante",
          variant: "destructive",
        });
      }
    };

    fetchApiKey();
  }, [toast]);

  // Initialize map when API key is available
  useEffect(() => {
    let mounted = true;
    
    const initializeMap = async () => {
      if (!apiKey) {
        return;
      }

      if (!mapRef.current) {
        setTimeout(() => {
          if (mounted) initializeMap();
        }, 100);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Validate coordinates
        if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number' || 
            isNaN(center.lat) || isNaN(center.lng) || 
            center.lat < -90 || center.lat > 90 || 
            center.lng < -180 || center.lng > 180) {
          throw new Error(`Coordonnées invalides: ${JSON.stringify(center)}`);
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: "weekly",
          libraries: ["places", "geometry"]
        });

        const google = await loader.load();
        if (!mounted || !mapRef.current) {
          return;
        }

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;
        // Add markers
        updateMarkers(map, google);

        // Add user location marker if available
        if (userLocation) {
          // Use AdvancedMarkerElement if available, fallback to Marker
          if (google.maps.marker?.AdvancedMarkerElement) {
            const { AdvancedMarkerElement } = google.maps.marker;
            new AdvancedMarkerElement({
              position: userLocation,
              map,
              title: "Votre position",
              content: new google.maps.marker.PinElement({
                background: "#3B82F6",
                borderColor: "white",
                glyph: "📍"
              }).element
            });
          } else {
            // Fallback to deprecated Marker
            new google.maps.Marker({
              position: userLocation,
              map,
              title: "Votre position",
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(24, 24),
                anchor: new google.maps.Point(12, 12)
              }
            });
          }
        }

        if (mounted) {
          setIsLoading(false);
        }
        
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load map');
          setIsLoading(false);
          toast({
            title: "Erreur de carte",
            description: "Impossible de charger Google Maps",
            variant: "destructive",
          });
        }
      }
    };

    if (apiKey) {
      initializeMap();
    }

    return () => {
      mounted = false;
    };
  }, [apiKey, center.lat, center.lng, zoom, userLocation, toast]);

  const updateMarkers = (map: any, google: any) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      let marker;
      
      // Use AdvancedMarkerElement if available, fallback to Marker
      if (google.maps.marker?.AdvancedMarkerElement) {
        const { AdvancedMarkerElement } = google.maps.marker;
        marker = new AdvancedMarkerElement({
          position: markerData.position,
          map,
          title: markerData.title,
          content: new google.maps.marker.PinElement({
            background: markerData.completed ? "#10B981" : "#EF4444",
            borderColor: "white",
            glyph: markerData.completed ? "✅" : "📍"
          }).element
        });
      } else {
        // Fallback to deprecated Marker
        marker = new google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
                      fill="${markerData.completed ? '#10B981' : '#EF4444'}" 
                      stroke="white" 
                      stroke-width="2"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
          }
        });
      }

      if (markerData.description) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold;">${markerData.title}</h3>
              <p style="margin: 0; color: #666;">${markerData.description}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          onMarkerClick?.(markerData);
        });
      } else if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(markerData));
      }

      markersRef.current.push(marker);
    });
  };

  // Update markers when props change
  useEffect(() => {
    if (mapInstanceRef.current && (window as any).google) {
      updateMarkers(mapInstanceRef.current, (window as any).google);
    }
  }, [markers, onMarkerClick]);

  // Update user location when it changes
  useEffect(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setCenter(userLocation);
    }
  }, [userLocation]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Carte indisponible</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default GoogleMap;