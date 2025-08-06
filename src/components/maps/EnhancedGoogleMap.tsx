import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Navigation, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MapStep {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'completed' | 'current' | 'unlocked' | 'locked';
  points_awarded?: number;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface EnhancedGoogleMapProps {
  steps: MapStep[];
  userLocation?: LocationCoords | null;
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
  showRoute?: boolean;
  showUserLocation?: boolean;
}

export const EnhancedGoogleMap: React.FC<EnhancedGoogleMapProps> = ({
  steps,
  userLocation,
  currentStepIndex,
  onStepClick,
  className = '',
  showRoute = true,
  showUserLocation = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useLanguage();

  // Get step color based on status
  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e'; // Green
      case 'current': return '#3b82f6'; // Blue
      case 'unlocked': return '#f59e0b'; // Orange
      case 'locked': return '#6b7280'; // Gray
      default: return '#6b7280';
    }
  };

  // Get route segment color
  const getRouteSegmentColor = (fromStatus: string, toStatus: string) => {
    if (fromStatus === 'completed' && toStatus === 'completed') return '#22c55e'; // Green for completed segments
    if (fromStatus === 'completed' && toStatus === 'current') return '#3b82f6'; // Blue for current progress
    if (fromStatus === 'current' || toStatus === 'current') return '#3b82f6'; // Blue for current step
    if (fromStatus === 'unlocked' || toStatus === 'unlocked') return '#f59e0b'; // Orange for next steps
    return '#e5e7eb'; // Light gray for locked segments
  };

  // Initialize map
  const initializeMap = () => {
    if (!mapRef.current || !window.google || steps.length === 0) return;

    try {
      // Calculate center based on steps
      const bounds = new google.maps.LatLngBounds();
      steps.forEach(step => {
        bounds.extend(new google.maps.LatLng(step.latitude, step.longitude));
      });

      if (userLocation) {
        bounds.extend(new google.maps.LatLng(userLocation.latitude, userLocation.longitude));
      }

      // Create map
      const map = new google.maps.Map(mapRef.current, {
        zoom: 15,
        center: bounds.getCenter(),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ],
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false
      });

      mapInstanceRef.current = map;

      // Fit bounds with padding
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });

      // Add step markers
      addStepMarkers(map);

      // Add user location marker
      if (showUserLocation && userLocation) {
        addUserLocationMarker(map);
      }

      // Add route if enabled
      if (showRoute) {
        addRoute(map);
      }

      setIsLoading(false);
      } catch (error) {
      setError('Failed to load map');
      setIsLoading(false);
    }
  };

  // Add step markers with proper styling
  const addStepMarkers = (map: google.maps.Map) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    steps.forEach((step, index) => {
      const position = new google.maps.LatLng(step.latitude, step.longitude);
      const color = getStepColor(step.status);
      
      // Create custom marker icon
      const icon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: step.status === 'current' ? 12 : 8,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: step.status === 'current' ? 3 : 2,
      };

      const marker = new google.maps.Marker({
        position,
        map,
        icon,
        title: step.name,
        zIndex: step.status === 'current' ? 1000 : step.status === 'completed' ? 900 : 100
      });

      // Add number label for steps
      const label = new google.maps.Marker({
        position,
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">
                ${index + 1}
              </text>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        },
        zIndex: step.status === 'current' ? 1001 : step.status === 'completed' ? 901 : 101
      });

      // Add click handler
      marker.addListener('click', () => {
        if (onStepClick) {
          onStepClick(index);
        }
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-medium text-sm">${step.name}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs px-2 py-1 rounded" style="background-color: ${color}20; color: ${color}">
                ${step.status === 'completed' ? '✓ Complétée' : 
                  step.status === 'current' ? '→ Actuelle' : 
                  step.status === 'unlocked' ? '○ Disponible' : '🔒 Verrouillée'}
              </span>
              ${step.points_awarded ? `<span class="text-xs text-muted-foreground">${step.points_awarded} pts</span>` : ''}
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker, label);
    });
  };

  // Add user location marker
  const addUserLocationMarker = (map: google.maps.Map) => {
    if (!userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    const userMarker = new google.maps.Marker({
      position: new google.maps.LatLng(userLocation.latitude, userLocation.longitude),
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: currentLanguage === 'en' ? 'Your Location' : 
             currentLanguage === 'de' ? 'Ihr Standort' : 'Votre Position',
      zIndex: 2000
    });

    userMarkerRef.current = userMarker;
  };

  // Add enhanced route with segment coloring
  const addRoute = (map: google.maps.Map) => {
    if (steps.length < 2) return;

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create path segments with different colors
    for (let i = 0; i < steps.length - 1; i++) {
      const fromStep = steps[i];
      const toStep = steps[i + 1];
      
      const segmentPath = [
        new google.maps.LatLng(fromStep.latitude, fromStep.longitude),
        new google.maps.LatLng(toStep.latitude, toStep.longitude)
      ];

      const segmentColor = getRouteSegmentColor(fromStep.status, toStep.status);
      const strokeWeight = (fromStep.status === 'current' || toStep.status === 'current') ? 4 : 3;
      
      const polyline = new google.maps.Polyline({
        path: segmentPath,
        geodesic: true,
        strokeColor: segmentColor,
        strokeOpacity: 0.8,
        strokeWeight,
        zIndex: 500
      });

      polyline.setMap(map);
    }
  };

  // Load Google Maps
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google) {
        initializeMap();
        return;
      }

      try {
        // This would normally load from your environment
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        script.onerror = () => setError('Failed to load Google Maps');
        document.head.appendChild(script);
      } catch (error) {
        setError('Failed to initialize Google Maps');
      }
    };

    loadGoogleMaps();
  }, []);

  // Update map when steps or user location changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      addStepMarkers(mapInstanceRef.current);
      if (showUserLocation && userLocation) {
        addUserLocationMarker(mapInstanceRef.current);
      }
      if (showRoute) {
        addRoute(mapInstanceRef.current);
      }
    }
  }, [steps, userLocation, currentStepIndex, showRoute, showUserLocation]);

  if (error) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {currentLanguage === 'en' ? 'Loading map...' : 
               currentLanguage === 'de' ? 'Karte wird geladen...' : 'Chargement de la carte...'}
            </span>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full min-h-[300px] rounded-lg" />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>{currentLanguage === 'en' ? 'Completed' : 'Complétée'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>{currentLanguage === 'en' ? 'Current' : 'Actuelle'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>{currentLanguage === 'en' ? 'Available' : 'Disponible'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>{currentLanguage === 'en' ? 'Locked' : 'Verrouillée'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};