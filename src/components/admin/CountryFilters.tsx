import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

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

interface CountryFiltersProps {
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
}

const CountryFilters: React.FC<CountryFiltersProps> = ({
  countries,
  cities,
  selectedCountry,
  selectedCity,
  searchTerm,
  onCountryChange,
  onCityChange,
  onSearchChange,
  onClearFilters,
  language = 'fr'
}) => {
  const getCountryName = (country: Country) => {
    switch (language) {
      case 'en': return country.name_en;
      case 'de': return country.name_de;
      default: return country.name_fr;
    }
  };

  const filteredCities = selectedCountry 
    ? cities.filter(city => city.country_id === selectedCountry)
    : cities;

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="min-w-[180px]">
        <Select value={selectedCountry} onValueChange={onCountryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tous les pays" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les pays</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {getCountryName(country)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[180px]">
        <Select value={selectedCity} onValueChange={onCityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes les villes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les villes</SelectItem>
            {filteredCities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(selectedCountry !== 'all' || selectedCity !== 'all' || searchTerm) && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Effacer
        </Button>
      )}
    </div>
  );
};

export default CountryFilters;