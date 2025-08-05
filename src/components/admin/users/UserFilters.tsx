import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';


interface City {
  id: string;
  name: string;
  slug: string;
  country_id: string;
}

interface Country {
  id: string;
  name_fr: string;
  name_en: string;
  name_de: string;
  code: string;
}

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCountry: string;
  onCountryChange: (value: string) => void;
  selectedCity: string;
  onCityChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  cities: City[];
  countries: Country[];
  isTenantAdmin: boolean;
}

export const UserFilters = ({
  searchTerm,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  selectedCity,
  onCityChange,
  roleFilter,
  onRoleFilterChange,
  cities,
  countries,
  isTenantAdmin
}: UserFiltersProps) => {
  const filteredCities = selectedCountry === 'all' 
    ? cities 
    : cities.filter(city => city.country_id === selectedCountry);

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtres:</span>
        </div>

        {/* Role Filter */}
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tous les rôles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="tenant_admin">Admin Ville</SelectItem>
            <SelectItem value="visitor">Explorateur</SelectItem>
          </SelectContent>
        </Select>

        {/* Country and City Filters - only for super admin */}
        {!isTenantAdmin && (
          <>
            <Select value={selectedCountry} onValueChange={onCountryChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tous les pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name_fr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes les villes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                <SelectItem value="none">Sans ville assignée</SelectItem>
                {filteredCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
};