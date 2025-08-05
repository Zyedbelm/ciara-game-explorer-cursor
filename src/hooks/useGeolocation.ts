
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { geolocationService } from '@/services/geolocationService';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  location: LocationCoords | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  watchLocation: () => void;
  stopWatching: () => void;
  isLocationEnabled: boolean;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const { toast } = useToast();

  // Check if geolocation is supported
  const isSupported = geolocationService.isSupported();

  const handleLocationUpdate = useCallback((newLocation: LocationCoords | null) => {
    console.log('🗺️ useGeolocation: Location updated:', newLocation);
    setLocation(newLocation);
    setError(null);
    setIsLocationEnabled(!!newLocation);
    setLoading(false);
  }, []);

  const handleLocationError = useCallback((errorMessage: string) => {
    console.log('🗺️ useGeolocation: Error:', errorMessage);
    setError(errorMessage);
    setLocation(null);
    setIsLocationEnabled(false);
    setLoading(false);
  }, []);

  const requestLocation = useCallback(async () => {
    if (!isSupported) {
      const errorMsg = "La géolocalisation n'est pas supportée par votre navigateur.";
      setError(errorMsg);
      toast({
        title: "Géolocalisation non supportée",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    if (loading) {
      console.log('🗺️ useGeolocation: Request already in progress');
      return;
    }

    setLoading(true);
    setError(null);
    console.log('🗺️ useGeolocation: Requesting current position...');

    try {
      const coords = await geolocationService.getCurrentPosition();
      handleLocationUpdate(coords);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      handleLocationError(errorMessage);
      
      toast({
        title: "Erreur de géolocalisation",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [isSupported, loading, handleLocationUpdate, handleLocationError, toast]);

  const watchLocation = useCallback(() => {
    if (!isSupported || isWatching) {
      console.log('🗺️ useGeolocation: Cannot start watching - not supported or already watching');
      return;
    }

    console.log('🗺️ useGeolocation: Starting location watch...');
    setIsWatching(true);
    
    const unsubscribe = geolocationService.subscribe(
      handleLocationUpdate,
      handleLocationError
    );

    // Store unsubscribe function for cleanup
    return unsubscribe;
  }, [isSupported, isWatching, handleLocationUpdate, handleLocationError]);

  const stopWatching = useCallback(() => {
    console.log('🗺️ useGeolocation: Stopping location watch...');
    setIsWatching(false);
    // Note: The actual unsubscribe happens in the effect cleanup
  }, []);

  // Effect to manage subscription
  useEffect(() => {
    if (!isWatching) return;

    const unsubscribe = geolocationService.subscribe(
      handleLocationUpdate,
      handleLocationError
    );

    return () => {
      unsubscribe();
      setIsWatching(false);
    };
  }, [isWatching, handleLocationUpdate, handleLocationError]);

  return {
    location,
    loading,
    error,
    requestLocation,
    watchLocation,
    stopWatching,
    isLocationEnabled,
  };
}
