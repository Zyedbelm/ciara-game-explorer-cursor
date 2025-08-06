import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedText } from '@/utils/translations';

interface City {
  id: string;
  name: string;
  name_en?: string;
  name_de?: string;
  country_id: string;
  is_visible_on_homepage: boolean;
  [key: string]: any; // Pour accepter les autres propriétés de la table cities
}

interface Country {
  id: string;
  name_fr: string;
  name_en: string;
  name_de: string;
  code: string;
}

const HomepageVisibilityManager = () => {
  const { t, currentLanguage } = useLanguage();
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchCities();
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('name_fr');

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des pays');
    }
  };

  const fetchCities = async () => {
    if (!selectedCountry) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('country_id', selectedCountry)
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des villes');
    } finally {
      setLoading(false);
    }
  };

  const toggleHomepageVisibility = async (cityId: string, isVisible: boolean) => {
    setUpdating(cityId);
    try {
      const { error } = await supabase
        .from('cities')
        .update({ is_visible_on_homepage: isVisible })
        .eq('id', cityId);

      if (error) throw error;

      setCities(prev => 
        prev.map(city => 
          city.id === cityId 
            ? { ...city, is_visible_on_homepage: isVisible }
            : city
        )
      );

      toast.success(
        isVisible 
          ? 'Ville affichée sur la homepage' 
          : 'Ville masquée de la homepage'
      );
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(null);
    }
  };

  const getCountryName = (country: Country) => {
    switch (currentLanguage) {
      case 'en':
        return country.name_en || country.name_fr;
      case 'de':
        return country.name_de || country.name_fr;
      default:
        return country.name_fr;
    }
  };

  const getCityName = (city: City) => {
    return getLocalizedText(city.name, {
      en: city.name_en || city.name,
      de: city.name_de || city.name
    }, currentLanguage);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏠</span>
            Gestion de la visibilité Homepage
          </CardTitle>
          <CardDescription>
            Gérez quelles villes apparaissent sur la page d'accueil pour chaque pays.
            Les villes non cochées restent visibles sur la page /cities mais pas sur la homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm">
            <label className="text-sm font-medium mb-2 block">
              Sélectionner un pays
            </label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un pays..." />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {getCountryName(country)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCountry && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">
                Villes pour {getCountryName(countries.find(c => c.id === selectedCountry)!)}
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : cities.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune ville trouvée pour ce pays.
                </p>
              ) : (
                <div className="grid gap-4">
                  {cities.map((city) => (
                    <div
                      key={city.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{getCityName(city)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {city.is_visible_on_homepage 
                            ? '✅ Visible sur la homepage' 
                            : '❌ Masquée de la homepage'
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={city.is_visible_on_homepage}
                          onCheckedChange={(checked) => 
                            toggleHomepageVisibility(city.id, checked)
                          }
                          disabled={updating === city.id}
                        />
                        {updating === city.id && (
                          <LoadingSpinner size="sm" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HomepageVisibilityManager;