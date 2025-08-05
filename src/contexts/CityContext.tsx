
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCitySlug } from '@/hooks/useCitySlug';

interface City {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  primary_color: string | null;
  secondary_color: string | null;
  supported_languages: string[] | null;
  default_language: string | null;
  subscription_plan: string | null;
  timezone: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CityContextType {
  city: City | null;
  loading: boolean;
  error: string | null;
  setCityColors: (primaryColor: string, secondaryColor: string) => void;
}

export const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const citySlug = useCitySlug();
  const location = useLocation();

  console.log('🏙️ CityProvider - citySlug from hook:', citySlug);

  useEffect(() => {
    if (!citySlug) {
      console.log('🏙️ CityProvider - No city slug, clearing city data');
      setCity(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Don't fetch if citySlug is 'undefined'
    if (citySlug === 'undefined') {
      console.error('🚨 CityProvider - Invalid slug "undefined"');
      setCity(null);
      setLoading(false);
      setError('Invalid city identifier');
      return;
    }

    fetchCity(citySlug);
  }, [citySlug]);

  // Reset to default colors when navigating back to homepage
  useEffect(() => {
    if (isOnHomepage()) {
      console.log('🏠 CityProvider - On homepage, resetting to default colors');
      resetToDefaultColors();
    }
  }, [location.pathname]);

  // Helper function to check if we're on homepage
  const isOnHomepage = () => {
    return location.pathname === '/';
  };

  // Helper function to reset to default colors
  const resetToDefaultColors = () => {
    const root = document.documentElement;
    // Remove the custom CSS properties to fall back to default values from index.css
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary');
  };

  // Helper function to apply colors to CSS variables
  const applyColorsToDOM = (primaryColor: string, secondaryColor: string) => {
    // Don't apply city colors on homepage - keep default colors
    if (isOnHomepage()) {
      console.log('🏠 CityProvider - On homepage, skipping color application');
      return;
    }

    const root = document.documentElement;
    
    // Convert hex to HSL for CSS variables
    const primaryHsl = hexToHsl(primaryColor);
    const secondaryHsl = hexToHsl(secondaryColor);
    
    if (primaryHsl) {
      root.style.setProperty('--primary', primaryHsl);
    }
    if (secondaryHsl) {
      root.style.setProperty('--secondary', secondaryHsl);
    }
  };

  const fetchCity = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 CityProvider - Fetching city with slug:', slug);

      const { data, error: fetchError } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ CityProvider - Error fetching city:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.warn('⚠️ CityProvider - No city found with slug:', slug);
        setCity(null);
        setError(`City with slug "${slug}" not found`);
        setLoading(false);
        return;
      }

      console.log('✅ CityProvider - City fetched successfully:', data.name);
      setCity(data);
      
      // Apply city colors immediately after setting city data
      if (data && data.primary_color && data.secondary_color) {
        applyColorsToDOM(data.primary_color, data.secondary_color);
      }
    } catch (err) {
      console.error('❌ CityProvider - Error in fetchCity:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCity(null);
    } finally {
      setLoading(false);
    }
  };

  const setCityColors = (primaryColor: string, secondaryColor: string) => {
    if (city) {
      // Apply colors to DOM
      applyColorsToDOM(primaryColor, secondaryColor);
      
      // Update city state with new colors
      setCity({ ...city, primary_color: primaryColor, secondary_color: secondaryColor });
    }
  };

  return (
    <CityContext.Provider value={{ city, loading, error, setCityColors }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}

// Hook optionnel qui ne lance pas d'erreur s'il n'y a pas de CityProvider
export function useCityOptional() {
  const context = useContext(CityContext);
  return context || { city: null, loading: false, error: null, setCityColors: () => {} };
}

// Utility function to convert hex to HSL
function hexToHsl(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
