
import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface JourneyStep {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface JourneyMiniMapProps {
  steps: JourneyStep[];
  className?: string;
}

const JourneyMiniMap: React.FC<JourneyMiniMapProps> = ({ steps, className = "" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || steps.length === 0) return;

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
        });

        await loader.load();

        // Calculer le centre et les limites
        const bounds = new google.maps.LatLngBounds();
        steps.forEach(step => {
          bounds.extend(new google.maps.LatLng(step.latitude, step.longitude));
        });

        const map = new google.maps.Map(mapRef.current!, {
          center: bounds.getCenter(),
          zoom: 14,
          disableDefaultUI: true,
          gestureHandling: 'none',
          clickableIcons: false,
          styles: [
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'transit',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Ajouter les marqueurs pour chaque étape
        steps.forEach((step, index) => {
          new google.maps.Marker({
            position: { lat: step.latitude, lng: step.longitude },
            map: map,
            title: step.name,
            label: {
              text: (index + 1).toString(),
              color: 'white',
              fontWeight: 'bold',
              fontSize: '12px'
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
              scale: 12
            }
          });
        });

        // Ajuster la vue pour inclure tous les marqueurs
        if (steps.length > 1) {
          map.fitBounds(bounds, 20);
        }

      } catch (error) {
        console.error('Erreur lors du chargement de la carte:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [steps]);

  if (steps.length === 0) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-sm text-muted-foreground">Aucune étape disponible</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden bg-muted ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default JourneyMiniMap;
