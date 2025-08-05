import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCountry } from '@/contexts/CountryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface CountrySelectorProps {
  variant?: 'default' | 'hero';
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ 
  variant = 'default',
  className = '' 
}) => {
  const { countries, selectedCountry, setSelectedCountry, loading } = useCountry();
  const { currentLanguage } = useLanguage();

  // Don't render if still loading
  if (loading || countries.length === 0) {
    return null;
  }

  const getCountryName = (country: any) => {
    switch (currentLanguage) {
      case 'en':
        return country.name_en || country.name_fr;
      case 'de':
        return country.name_de || country.name_fr;
      default:
        return country.name_fr;
    }
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    setSelectedCountry(country || null);
  };

  if (variant === 'hero') {
    return (
      <div className={`flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 ${className}`}>
        <Globe className="h-5 w-5 text-white/80" />
        <Select 
          value={selectedCountry?.code || ''} 
          onValueChange={handleCountryChange}
        >
          <SelectTrigger className="bg-transparent border-none text-white h-8 min-w-[140px] text-base font-medium">
            <SelectValue>
              {selectedCountry ? getCountryName(selectedCountry) : "Choisir un pays"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {getCountryName(country)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 bg-primary/10 backdrop-blur-sm rounded-lg px-4 py-3 min-w-[200px] shadow-sm ${className}`}>
      <Globe className="h-5 w-5 text-primary" />
      <Select 
        value={selectedCountry?.code || ''} 
        onValueChange={handleCountryChange}
      >
        <SelectTrigger className="border-0 bg-white text-foreground hover:bg-white/90 transition-colors h-10 text-base font-medium shadow-sm">
          <SelectValue>
            {selectedCountry ? getCountryName(selectedCountry) : "Choisir un pays"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {getCountryName(country)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CountrySelector;