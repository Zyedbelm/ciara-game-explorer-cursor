import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Country {
  id: string;
  name_fr: string;
  name_en: string;
  name_de: string;
  is_active: boolean;
}

interface City {
  id: string;
  name: string;
  country_id?: string;
}

interface Step {
  id: string;
  name: string;
  description?: string;
  type: string;
  city_id: string;
  latitude?: number;
  longitude?: number;
  points_awarded?: number;
  validation_radius?: number;
  has_quiz?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useStepsFilters = (cities: City[], steps: Step[]) => {
  const { profile, isTenantAdmin } = useAuth();
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  // Charger les pays non-archivés
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data, error } = await supabase
          .from('countries')
          .select('id, name_fr, name_en, name_de, is_active')
          .eq('is_active', true)
          .order('name_fr');

        if (error) throw error;
        setCountries(data || []);
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };

    fetchCountries();
  }, []);

  // Filtrer les villes selon le pays sélectionné et les restrictions de rôle
  const filteredCities = useMemo(() => {
    let filtered = cities;

    // Filtrer par pays sélectionné
    if (countryFilter !== 'all') {
      filtered = filtered.filter(city => {
        const country = countries.find(c => c.id === countryFilter);
        return country && (city as any).country_id === country.id;
      });
    }

    // Restriction pour tenant_admin
    if (isTenantAdmin() && profile?.city_id) {
      filtered = filtered.filter(city => city.id === profile.city_id);
    }

    return filtered;
  }, [cities, countries, countryFilter, isTenantAdmin, profile?.city_id]);

  // Filtrer les étapes selon les sélections
  const filteredSteps = useMemo(() => {
    return steps.filter(step => {
      const cityMatch = cityFilter === 'all' || step.city_id === cityFilter;
      const typeMatch = typeFilter === 'all' || step.type === typeFilter;
      const searchMatch = !searchTerm || 
        step.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        step.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return cityMatch && typeMatch && searchMatch;
    });
  }, [steps, cityFilter, typeFilter, searchTerm]);

  // Gérer le changement de pays
  const handleCountryChange = useCallback((value: string) => {
    setCountryFilter(value);
    setCityFilter('all'); // Reset city filter when country changes
  }, []);

  // Réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setTypeFilter('all');
    setCityFilter('all');
    setCountryFilter('all');
  }, []);

  return {
    // État
    countries,
    searchTerm,
    typeFilter,
    cityFilter,
    countryFilter,
    filteredCities,
    filteredSteps,

    // Actions
    setSearchTerm,
    setTypeFilter,
    setCityFilter,
    setCountryFilter,
    handleCountryChange,
    resetFilters
  };
}; 