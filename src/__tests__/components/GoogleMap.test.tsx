import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoogleMap from '@/components/maps/GoogleMap';

// Mock the Google Maps JavaScript API
const mockGoogleMaps = {
  maps: {
    Map: vi.fn().mockImplementation(() => ({
      setCenter: vi.fn(),
      setZoom: vi.fn(),
    })),
    Marker: vi.fn().mockImplementation(() => ({
      setMap: vi.fn(),
      addListener: vi.fn(),
    })),
    InfoWindow: vi.fn().mockImplementation(() => ({
      open: vi.fn(),
    })),
    Size: vi.fn(),
    Point: vi.fn(),
  },
};

// Mock the Google Maps API Loader
vi.mock('@googlemaps/js-api-loader', () => ({
  Loader: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue(mockGoogleMaps),
  })),
}));

// Mock Supabase client
const mockSupabase = {
  functions: {
    invoke: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock import.meta.env
const mockImportMeta = {
  env: {},
};

Object.defineProperty(window, 'import', {
  value: {
    meta: mockImportMeta,
  },
  writable: true,
});

// Store original process.env
const originalEnv = import.meta.env;

describe('GoogleMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.google
    delete (window as any).google;
    // Reset import.meta.env
    mockImportMeta.env = {};
  });

  afterEach(() => {
    // Restore original env
    Object.assign(import.meta.env, originalEnv);
  });

  it('should use environment API key when available', async () => {
    // Set environment variable
    Object.assign(mockImportMeta.env, { VITE_GOOGLE_MAPS_API_KEY: 'test-api-key' });
    
    const { Loader } = await import('@googlemaps/js-api-loader');
    
    render(
      <GoogleMap
        center={{ lat: 46.2044, lng: 6.1432 }}
        zoom={13}
        markers={[]}
        className="test-map"
      />
    );

    // Wait for the component to process
    await waitFor(() => {
      expect(Loader).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        version: 'weekly',
        libraries: ['places', 'geometry'],
      });
    }, { timeout: 2000 });
  });

  it('should fallback to Supabase function when env key is not available', async () => {
    // No environment variable set
    mockImportMeta.env = {};
    
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { apiKey: 'supabase-api-key' },
      error: null,
    });

    const { Loader } = await import('@googlemaps/js-api-loader');
    
    render(
      <GoogleMap
        center={{ lat: 46.2044, lng: 6.1432 }}
        zoom={13}
        markers={[]}
        className="test-map"
      />
    );

    await waitFor(() => {
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('get-google-maps-key');
    });

    await waitFor(() => {
      expect(Loader).toHaveBeenCalledWith({
        apiKey: 'supabase-api-key',
        version: 'weekly',
        libraries: ['places', 'geometry'],
      });
    }, { timeout: 2000 });
  });

  it('should display error message when API key is not available', async () => {
    // No environment variable set
    mockImportMeta.env = {};
    
    mockSupabase.functions.invoke.mockRejectedValue(new Error('API key not configured'));

    render(
      <GoogleMap
        center={{ lat: 46.2044, lng: 6.1432 }}
        zoom={13}
        markers={[]}
        className="test-map"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Carte indisponible')).toBeInTheDocument();
    });
  });

  it('should handle invalid coordinates gracefully', async () => {
    // No environment variable set
    mockImportMeta.env = {};
    
    mockSupabase.functions.invoke.mockRejectedValue(new Error('API key not configured'));

    render(
      <GoogleMap
        center={{ lat: 200, lng: 200 }} // Invalid coordinates
        zoom={13}
        markers={[]}
        className="test-map"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Carte indisponible')).toBeInTheDocument();
    });
  });
});