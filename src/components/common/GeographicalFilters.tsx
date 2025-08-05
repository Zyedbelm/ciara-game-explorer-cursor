import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

interface GeographicalFiltersProps {
  countries: Country[];
  cities: City[];
  selectedCountry: string;
  selectedCity: string;
  searchTerm: string;
  onCountryChange: (countryId: string) => void;
  onCityChange: (cityId: string) => void;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
  language?: string;
  className?: string;
  showSearchBar?: boolean;
}

const GeographicalFilters: React.FC<GeographicalFiltersProps> = ({
  countries,
  cities,
  selectedCountry,
  selectedCity,
  searchTerm,
  onCountryChange,
  onCityChange,
  onSearchChange,
  onClearFilters,
  language = 'fr',
  className = '',
  showSearchBar = true
}) => {
  const getCountryName = (country: Country) => {
    switch (language) {
      case 'en': return country.name_en;
      case 'de': return country.name_de;
      default: return country.name_fr;
    }
  };

  const filteredCities = selectedCountry && selectedCountry !== 'all'
    ? cities.filter(city => city.country_id === selectedCountry)
    : cities;

  const getTranslation = (key: string) => {
    const translations = {
      search_placeholder: {
        fr: 'Rechercher...',
        en: 'Search...',
        de: 'Suchen...'
      },
      all_countries: {
        fr: 'Tous les pays',
        en: 'All countries',
        de: 'Alle Länder'
      },
      all_cities: {
        fr: 'Toutes les villes',
        en: 'All cities',
        de: 'Alle Städte'
      },
      clear: {
        fr: 'Effacer',
        en: 'Clear',
        de: 'Löschen'
      }
    };
    
    return translations[key as keyof typeof translations]?.[language as keyof typeof translations.search_placeholder] || 
           translations[key as keyof typeof translations]?.fr || key;
  };

  return (
    <Card className={`bg-muted/30 ${className}`}>
      <CardContent className="p-2 md:p-4">
        {/* Header - masqué sur mobile pour économiser l'espace */}
        <div className="hidden md:flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filtres géographiques</span>
        </div>
        
        {/* Layout compact pour mobile */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          {/* Recherche - masquée sur mobile si pas essentielle */}
          {showSearchBar && (
            <div className="flex-1 min-w-0 hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={getTranslation('search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Sélecteurs compacts */}
          <div className="flex gap-2 flex-1 sm:flex-none">
            <div className="flex-1 sm:min-w-[140px]">
              <Select value={selectedCountry} onValueChange={onCountryChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={getTranslation('all_countries')} />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">{getTranslation('all_countries')}</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {getCountryName(country)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 sm:min-w-[140px]">
              <Select value={selectedCity} onValueChange={onCityChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={getTranslation('all_cities')} />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">{getTranslation('all_cities')}</SelectItem>
                  {filteredCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bouton clear compact */}
            {(selectedCountry !== 'all' || selectedCity !== 'all' || searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="h-9 px-2 sm:px-3"
              >
                <X className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{getTranslation('clear')}</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Barre de recherche mobile en dessous si nécessaire */}
        {showSearchBar && (
          <div className="mt-2 sm:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={getTranslation('search_placeholder')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeographicalFilters;