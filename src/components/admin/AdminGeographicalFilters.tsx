import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, MapPin, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Country {
  id: string;
  name_fr: string;
  name_en: string;
  name_de: string;
  code: string;
}

interface City {
  id: string;
  name: string;
  country_id: string;
}

interface AdminGeographicalFiltersProps {
  onFiltersChange: (filters: {
    selectedCountry: string | null;
    selectedCity: string | null;
    searchTerm: string;
  }) => void;
  language?: string;
  className?: string;
}

export const AdminGeographicalFilters: React.FC<AdminGeographicalFiltersProps> = ({
  onFiltersChange,
  language = 'fr',
  className = ''
}) => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Permission checks
  const isSuperAdmin = profile?.role === 'super_admin';
  const isTenantAdmin = profile?.role === 'tenant_admin';
  const userCityId = profile?.city_id;

  // Helper function to get localized country name
  const getCountryName = useCallback((country: Country) => {
    switch (language) {
      case 'en': return country.name_en || country.name_fr;
      case 'de': return country.name_de || country.name_fr;
      default: return country.name_fr;
    }
  }, [language]);

  // Fetch countries and cities based on user permissions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch countries (only for super admins)
        if (isSuperAdmin) {
          const { data: countriesData, error: countriesError } = await supabase
            .from('countries')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

          if (countriesError) throw countriesError;
          setCountries(countriesData || []);
        }

        // Fetch cities based on user role
        let citiesQuery = supabase
          .from('cities')
          .select(`
            *,
            countries!inner (
              name_fr,
              name_en, 
              name_de,
              code,
              is_active
            )
          `)
          .eq('is_archived', false)
          .eq('is_visible_on_homepage', true)
          .eq('countries.is_active', true);
        
        if (isTenantAdmin && userCityId) {
          // Tenant admin can only see their assigned city
          citiesQuery = citiesQuery.eq('id', userCityId);
        } else if (!isSuperAdmin) {
          // Other roles get no cities (shouldn't happen but safety check)
          setCities([]);
          return;
        }

        const { data: citiesData, error: citiesError } = await citiesQuery.order('name');

        if (citiesError) throw citiesError;
        setCities(citiesData || []);

        // Auto-set city for tenant admin
        if (isTenantAdmin && userCityId && citiesData?.length === 1) {
          setSelectedCity(userCityId);
        }

      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données géographiques",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchData();
    }
  }, [profile, isSuperAdmin, isTenantAdmin, userCityId, toast]);

  // Filter cities based on selected country
  const filteredCities = React.useMemo(() => {
    if (!isSuperAdmin) return cities;
    
    return selectedCountry === 'all' 
      ? cities 
      : cities.filter(city => city.country_id === selectedCountry);
  }, [cities, selectedCountry, isSuperAdmin]);

  // Handle filter changes and notify parent
  useEffect(() => {
    const filters = {
      selectedCountry: isSuperAdmin && selectedCountry !== 'all' ? selectedCountry : null,
      selectedCity: selectedCity !== 'all' ? selectedCity : null,
      searchTerm: searchTerm.trim()
    };
    
    onFiltersChange(filters);
  }, [selectedCountry, selectedCity, searchTerm, isSuperAdmin, onFiltersChange]);

  // Handle country change
  const handleCountryChange = (countryId: string) => {
    setSelectedCountry(countryId);
    // Reset city selection when country changes
    if (countryId !== selectedCountry) {
      setSelectedCity('all');
    }
  };

  // Handle city change  
  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
  };

  // Handle search change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // Clear all filters
  const handleClearFilters = () => {
    if (isSuperAdmin) {
      setSelectedCountry('all');
    }
    if (!isTenantAdmin) {
      setSelectedCity('all');
    }
    setSearchTerm('');
  };

  // Check if any filters are active
  const hasActiveFilters = (
    (isSuperAdmin && selectedCountry !== 'all') ||
    (!isTenantAdmin && selectedCity !== 'all') ||
    searchTerm.trim() !== ''
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Chargement des filtres...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Country Filter - Only for Super Admin */}
          {isSuperAdmin && (
            <div className="min-w-[180px]">
              <Select value={selectedCountry} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Tous les pays
                    </div>
                  </SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{country.code}</span>
                        {getCountryName(country)}
                      </div>
                    </SelectItem>
                  ))}</SelectContent>
              </Select>
            </div>
          )}

          {/* City Filter - Disabled for Tenant Admin */}
          <div className="min-w-[180px]">
            <Select 
              value={selectedCity} 
              onValueChange={handleCityChange}
              disabled={isTenantAdmin}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les villes" />
              </SelectTrigger>
              <SelectContent>
                {!isTenantAdmin && (
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Toutes les villes
                    </div>
                  </SelectItem>
                )}
                {filteredCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}</SelectContent>
            </Select>
            {isTenantAdmin && (
              <p className="text-xs text-muted-foreground mt-1">
                Filtré sur votre ville assignée
              </p>
            )}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Effacer
            </Button>
          )}
        </div>

        {/* Filter Status Indicator */}
        {(isSuperAdmin || !isTenantAdmin) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Filtres actifs:</span>
            {isSuperAdmin && selectedCountry !== 'all' && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                Pays: {countries.find(c => c.id === selectedCountry)?.code}
              </span>
            )}
            {!isTenantAdmin && selectedCity !== 'all' && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                Ville: {cities.find(c => c.id === selectedCity)?.name}
              </span>
            )}
            {searchTerm && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                Recherche: "{searchTerm}"
              </span>
            )}
            {!hasActiveFilters && (
              <span className="text-muted-foreground">Aucun</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
