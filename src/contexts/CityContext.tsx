
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

  useEffect(() => {
    if (!citySlug) {
      setCity(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Don't fetch if citySlug is 'undefined'
    if (citySlug === 'undefined') {
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
    // DÉSACTIVÉ : Les couleurs de ville ne sont plus appliquées dynamiquement
    // pour maintenir une interface cohérente
    return;
  };

  const fetchCity = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        setCity(null);
        setError(`City with slug "${slug}" not found`);
        setLoading(false);
        return;
      }

      setCity(data);
      
      // DÉSACTIVÉ : Les couleurs de ville ne sont plus appliquées automatiquement
      // pour maintenir une interface cohérente
      } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCity(null);
    } finally {
      setLoading(false);
    }
  };

  const setCityColors = (primaryColor: string, secondaryColor: string) => {
    // DÉSACTIVÉ : Les couleurs de ville ne sont plus modifiables
    // pour maintenir une interface cohérente
    return;
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
