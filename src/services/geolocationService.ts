
export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp?: number;
  heading?: number;
  speed?: number;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number; // Minimum distance in meters to trigger update
}

class GeolocationService {
  private watchId: number | null = null;
  private isWatching = false;
  private lastLocation: LocationCoords | null = null;
  private callbacks = new Set<(location: LocationCoords | null) => void>();
  private errorCallbacks = new Set<(error: string) => void>();
  private distanceFilter: number = 10; // Default 10 meters

  private readonly defaultOptions: PositionOptions = {
    enableHighAccuracy: true, // Better accuracy for tourism
    timeout: 30000,
    maximumAge: 60000, // 1 minute cache
  };

  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  subscribe(
    onLocation: (location: LocationCoords | null) => void,
    onError?: (error: string) => void,
    options?: GeolocationOptions
  ): () => void {
    this.callbacks.add(onLocation);
    if (onError) {
      this.errorCallbacks.add(onError);
    }

    if (options?.distanceFilter) {
      this.distanceFilter = options.distanceFilter;
    }

    // Send current location immediately if available
    if (this.lastLocation) {
      onLocation(this.lastLocation);
    }

    // Start watching if not already watching
    if (!this.isWatching) {
      this.startWatching(options);
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(onLocation);
      if (onError) {
        this.errorCallbacks.delete(onError);
      }

      // Stop watching if no more subscribers
      if (this.callbacks.size === 0) {
        this.stopWatching();
      }
    };
  }

  async getCurrentPosition(options?: GeolocationOptions): Promise<LocationCoords> {
    if (!this.isSupported()) {
      throw new Error("Geolocation is not supported");
    }

    // Check if we have a recent cached location
    if (this.lastLocation && options?.maximumAge) {
      const now = Date.now();
      const locationAge = now - (this.lastLocation.timestamp || 0);
      if (locationAge < options.maximumAge) {
        console.log('🗺️ GeolocationService: Using cached location');
        return this.lastLocation;
      }
    }

    const positionOptions = { ...this.defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          };
          this.lastLocation = coords;
          this.notifyCallbacks(coords);
          resolve(coords);
        },
        (error) => {
          const errorMessage = this.getErrorMessage(error);
          this.notifyErrorCallbacks(errorMessage);
          reject(new Error(errorMessage));
        },
        { ...positionOptions, timeout: 15000 } // Shorter timeout for explicit requests
      );
    });
  }

  private startWatching(options?: GeolocationOptions): void {
    if (!this.isSupported() || this.isWatching) return;

    console.log('🗺️ GeolocationService: Starting location watch');
    this.isWatching = true;

    const watchOptions = { ...this.defaultOptions, ...options };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords: LocationCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        };
        
        // Apply distance filter
        if (this.lastLocation && this.distanceFilter > 0) {
          const distance = this.calculateDistance(
            this.lastLocation.latitude,
            this.lastLocation.longitude,
            coords.latitude,
            coords.longitude
          );
          
          if (distance * 1000 < this.distanceFilter) {
            // Location hasn't changed significantly, skip update
            return;
          }
        }
        
        console.log('🗺️ GeolocationService: Location updated:', coords);
        this.lastLocation = coords;
        this.notifyCallbacks(coords);
      },
      (error) => {
        const errorMessage = this.getErrorMessage(error);
        console.log('🗺️ GeolocationService: Watch error:', errorMessage);
        
        // Don't notify errors for timeout in watch mode
        if (error.code !== error.TIMEOUT) {
          this.notifyErrorCallbacks(errorMessage);
        }
      },
      watchOptions
    );
  }

  private stopWatching(): void {
    if (this.watchId !== null) {
      console.log('🗺️ GeolocationService: Stopping location watch');
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isWatching = false;
    }
  }

  private notifyCallbacks(location: LocationCoords): void {
    this.callbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in geolocation callback:', error);
      }
    });
  }

  private notifyErrorCallbacks(error: string): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('Error in geolocation error callback:', err);
      }
    });
  }

  private getErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "L'accès à la localisation a été refusé. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur.";
      case error.POSITION_UNAVAILABLE:
        return "Votre position n'a pas pu être déterminée. Vérifiez que votre GPS est activé.";
      case error.TIMEOUT:
        return "La demande de localisation a pris trop de temps. Réessayez.";
      default:
        return "Une erreur inconnue s'est produite lors de la géolocalisation.";
    }
  }

  // Get last known location
  getLastKnownLocation(): LocationCoords | null {
    return this.lastLocation;
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Check if user is within radius of a location
  isWithinRadius(
    userLat: number,
    userLon: number,
    targetLat: number,
    targetLon: number,
    radiusInMeters: number
  ): boolean {
    const distance = this.calculateDistance(userLat, userLon, targetLat, targetLon);
    return distance * 1000 <= radiusInMeters; // Convert km to meters
  }

  // Get accuracy level description
  getAccuracyDescription(accuracy: number): string {
    if (accuracy <= 5) return "Très précise";
    if (accuracy <= 20) return "Précise";
    if (accuracy <= 100) return "Modérée";
    return "Approximative";
  }

  // Format coordinates for display
  formatCoordinates(lat: number, lon: number): string {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }

  // Clear cached location
  clearCache(): void {
    this.lastLocation = null;
    console.log('🗺️ GeolocationService: Cache cleared');
  }

  // Cleanup method
  cleanup(): void {
    this.stopWatching();
    this.callbacks.clear();
    this.errorCallbacks.clear();
    this.lastLocation = null;
  }
}

export const geolocationService = new GeolocationService();
