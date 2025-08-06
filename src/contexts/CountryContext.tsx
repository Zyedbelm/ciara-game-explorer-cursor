import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Country {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_de: string;
  is_active: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

interface CountryContextType {
  countries: Country[];
  selectedCountry: Country | null;
  setSelectedCountry: (country: Country | null) => void;
  loading: boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};

interface CountryProviderProps {
  children: ReactNode;
}

export const CountryProvider: React.FC<CountryProviderProps> = ({ children }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data, error } = await supabase
          .from('countries')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;

        const countriesData = data as Country[];
        setCountries(countriesData || []);
        
        // Sélectionner la Suisse par défaut
        const defaultCountry = countriesData?.find(country => country.code === 'CH');
        if (defaultCountry) {
          setSelectedCountry(defaultCountry);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return (
    <CountryContext.Provider 
      value={{ 
        countries, 
        selectedCountry, 
        setSelectedCountry, 
        loading 
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};