
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Navigation, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Extend Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

interface MapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    info?: string;
    isCurrentStep?: boolean;
  }>;
  userLocation?: { lat: number; lng: number } | null;
  onMarkerClick?: (marker: any) => void;
  className?: string;
}

const SimpleGoogleMap: React.FC<MapProps> = ({
  center,
  zoom = 15,
  markers = [],
  userLocation,
  onMarkerClick,
  className = "w-full h-64"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const routeRendererRef = useRef<google.maps.DirectionsRenderer | google.maps.Polyline | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [userHeading, setUserHeading] = useState<number | null>(null);
  const [showDirectionIndicator, setShowDirectionIndicator] = useState(false);
  const userLocationMarkerRef = useRef<google.maps.Marker | null>(null);

  // Enhanced geolocation function with device orientation
  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    setIsLocating(true);
    
    // Watch position for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading } = position.coords;
        if (map) {
          const userPos = { lat: latitude, lng: longitude };
          map.setCenter(userPos);
          map.setZoom(16);
          
          // Update user location marker with heading if available
          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setMap(null);
          }
          
          // Create direction indicator icon
          const createDirectionIcon = (heading: number | null) => {
            if (heading === null || heading === undefined) {
              // Standard location marker without direction
              return {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#2563EB" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 12)
              };
            }
            
            // Direction indicator with radar-like effect
            return {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Radar sweep background -->
                  <circle cx="16" cy="16" r="14" fill="#2563EB" fill-opacity="0.1" stroke="#2563EB" stroke-width="1" stroke-opacity="0.3"/>
                  <circle cx="16" cy="16" r="10" fill="#2563EB" fill-opacity="0.2" stroke="#2563EB" stroke-width="1" stroke-opacity="0.5"/>
                  
                  <!-- Direction indicator -->
                  <g transform="rotate(${heading} 16 16)">
                    <!-- Arrow pointing up (north) -->
                    <path d="M16 4 L20 12 L16 10 L12 12 Z" fill="#2563EB" stroke="white" stroke-width="1"/>
                    <!-- Direction line -->
                    <line x1="16" y1="10" x2="16" y2="22" stroke="#2563EB" stroke-width="2" stroke-opacity="0.8"/>
                  </g>
                  
                  <!-- Center dot -->
                  <circle cx="16" cy="16" r="3" fill="#2563EB" stroke="white" stroke-width="2"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 16)
            };
          };
          
          const userMarker = new window.google.maps.Marker({
            position: userPos,
            map,
            title: heading !== null ? `Votre position (Direction: ${Math.round(heading)}°)` : 'Votre position',
            icon: createDirectionIcon(heading)
          });
          
          userLocationMarkerRef.current = userMarker;
          
          if (heading !== null) {
            setUserHeading(heading);
            setShowDirectionIndicator(true);
          }
        }
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    // Clean up watch on component unmount
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [map]);

  // Removed excessive console log to prevent re-render spam

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
      }
    };

    fetchApiKey();
  }, []);

  // Initialize map when API key is available and DOM is ready
  useEffect(() => {
    if (!apiKey || !mapRef.current || map) {
      return;
    }

    const initializeMap = async () => {
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
          apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();
        if (!mapRef.current) {
          throw new Error('Map element not available');
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: {
            lat: Number(center.lat),
            lng: Number(center.lng)
          },
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
          zoomControl: true
        });

        setMap(mapInstance);
        setIsLoading(false);
        
      } catch (err) {
        setError(`Erreur lors de l'initialisation de la carte: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeMap, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [apiKey, center.lat, center.lng, zoom, map]);

  // Create stable markers key for memoization
  const markersKey = useMemo(() => {
    return markers.map(m => `${m.position.lat}-${m.position.lng}-${m.title}-${!!m.isCurrentStep}`).join('|');
  }, [markers]);

  // Memoize user location to prevent unnecessary re-renders
  const userLocationKey = useMemo(() => {
    return userLocation ? `${userLocation.lat}-${userLocation.lng}` : 'null';
  }, [userLocation?.lat, userLocation?.lng]);

  // Add numbered markers and walking route
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers and route with explicit cleanup
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Clear route renderer/line with proper type checking
    if (routeRendererRef.current) {
      if (routeRendererRef.current instanceof window.google.maps.DirectionsRenderer) {
        routeRendererRef.current.setMap(null);
      } else if (routeRendererRef.current instanceof window.google.maps.Polyline) {
        routeRendererRef.current.setMap(null);
      }
      routeRendererRef.current = null;
    }

    // Add numbered step markers with different colors for current vs other steps
    markers.forEach((marker, index) => {
      const markerNumber = index + 1;
      const isCurrentStep = marker.isCurrentStep;
      const fillColor = isCurrentStep ? '#10B981' : '#EF4444'; // Green for current, red for others
      const strokeColor = isCurrentStep ? '#059669' : '#DC2626';
      
      const mapMarker = new window.google.maps.Marker({
        position: marker.position,
        map,
        title: `${markerNumber}. ${marker.title}${isCurrentStep ? ' (Étape actuelle)' : ''}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${fillColor}" stroke="white" stroke-width="3"/>
              <circle cx="20" cy="20" r="15" fill="${strokeColor}" stroke="none"/>
              <text x="20" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">${markerNumber}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }
      });

      markersRef.current.push(mapMarker);

      if (marker.info) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div class="p-3">
            <h3 class="font-semibold text-base mb-2">Étape ${markerNumber}</h3>
            <strong class="text-primary">${marker.title}</strong>
            <br/>
            <span class="text-sm text-gray-600">${marker.info}</span>
          </div>`
        });

        mapMarker.addListener('click', () => {
          infoWindow.open(map, mapMarker);
          onMarkerClick?.(marker);
        });
      }
    });

    // Calculate and draw walking route between markers
    if (markers.length > 1) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // Don't show default markers
        polylineOptions: {
          strokeColor: '#EF4444',
          strokeOpacity: 0.8,
          strokeWeight: 4
        }
      });

      directionsRenderer.setMap(map);
      routeRendererRef.current = directionsRenderer;

      // Create waypoints (all points except first and last)
      const waypoints = markers.slice(1, -1).map(marker => ({
        location: marker.position,
        stopover: true
      }));

      const request = {
        origin: markers[0].position,
        destination: markers[markers.length - 1].position,
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.WALKING,
        optimizeWaypoints: false
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
        } else {
          // Fallback to direct lines if directions service fails
          const routePath = markers.map(marker => marker.position);
          const routeLine = new window.google.maps.Polyline({
            path: routePath,
            geodesic: true,
            strokeColor: '#EF4444',
            strokeOpacity: 0.8,
            strokeWeight: 3
          });
          routeLine.setMap(map);
          routeRendererRef.current = routeLine;
        }
      });
    }

    // Add user location marker
    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map,
        title: 'Votre position',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#10B981" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        }
      });

      markersRef.current.push(userMarker);

      // Add route from user location to current step (if there's a current step)
      const currentStepMarker = markers.find(marker => marker.isCurrentStep);
      if (currentStepMarker) {
        const userToStepDirectionsService = new window.google.maps.DirectionsService();
        const userToStepRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#10B981',
            strokeOpacity: 0.9,
            strokeWeight: 3
          }
        });

        userToStepRenderer.setMap(map);

        const userToStepRequest = {
          origin: userLocation,
          destination: currentStepMarker.position,
          travelMode: window.google.maps.TravelMode.WALKING
        };

        userToStepDirectionsService.route(userToStepRequest, (result, status) => {
          if (status === 'OK' && result) {
            userToStepRenderer.setDirections(result);
          }
        });
      }
    }

    // Markers and route added successfully
  }, [map, markersKey, userLocationKey, onMarkerClick]);

  // Update center when it changes (with debouncing)
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
      if (zoom) {
        map.setZoom(zoom);
      }
    }
  }, [map, center.lat, center.lng, zoom]);

  // Always render the map div with overlays for loading/error states
  return (
    <div className={`${className} relative overflow-hidden rounded-lg`}>
      {/* Map container with smooth fade-in */}
      <div 
        ref={mapRef} 
        className={`w-full h-full transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`} 
      />
      
      {/* Geolocation button */}
      {!isLoading && !error && (
        <div className="absolute left-3 bottom-20 z-10 animate-fade-in">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleGeolocation}
            disabled={isLocating}
            className="bg-white/90 hover:bg-white shadow-lg border transition-all duration-200 hover:scale-105"
            title="Me géolocaliser"
          >
            {isLocating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      
      {/* Enhanced loading overlay with skeleton effect */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/90 to-muted/60 rounded-lg backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 mx-auto"></div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary absolute inset-0 mx-auto"></div>
              </div>
              <p className="text-muted-foreground text-sm font-medium animate-pulse">
                Chargement de la carte...
              </p>
              <div className="flex space-x-1 justify-center">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error overlay with smooth appearance */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 rounded-lg backdrop-blur-sm border border-red-200 animate-fade-in">
          <div className="text-center p-4 space-y-3">
            <div className="animate-bounce">
              <MapPin className="h-8 w-8 text-red-500 mx-auto" />
            </div>
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <p className="text-xs text-muted-foreground">
              Coordonnées: {center.lat}, {center.lng}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleGoogleMap;
