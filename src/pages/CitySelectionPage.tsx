
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, MapPin, Users, ArrowRight, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CountrySelector from '@/components/common/CountrySelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCountry } from '@/contexts/CountryContext';
import { getCityImage, getCityGradient } from '@/utils/cityImageHelpers';

interface City {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  country_id: string;
  is_visible_on_homepage: boolean;
  hero_image_url?: string | null;
  journeyCount?: number;
  country?: {
    name_fr: string;
    name_en: string;
    name_de: string;
    code: string;
  };
}

const CitySelectionPage = () => {
  const { t } = useLanguage();
  const { selectedCountry } = useCountry();
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Requête avec jointure pour récupérer les informations du pays
        let query = supabase
          .from('cities')
          .select(`
            id, 
            name, 
            slug, 
            description, 
            latitude, 
            longitude,
            country_id,
            is_visible_on_homepage,
            hero_image_url,
            countries!inner (
              name_fr,
              name_en, 
              name_de,
              code,
              is_active
            )
          `)
          .eq('is_archived', false) // Filtrer les villes archivées
          .eq('is_visible_on_homepage', true) // Filtrer les villes visibles sur la homepage
          .eq('countries.is_active', true); // Filtrer les pays actifs
        
        // Filtrer par pays sélectionné si un pays est choisi
        if (selectedCountry) {
          query = query.eq('country_id', selectedCountry.id);
        }
        
        const { data: citiesData, error: citiesError } = await query.order('name');

        if (citiesError) throw citiesError;

        // Pour chaque ville, compter le nombre d'itinéraires actifs
        const citiesWithJourneyCount = await Promise.all(
          (citiesData || []).map(async (city: any) => {
            const { count } = await supabase
              .from('journeys')
              .select('*', { count: 'exact', head: true })
              .eq('city_id', city.id)
              .eq('is_active', true);

            return {
              ...city,
              country: city.countries,
              journeyCount: count || 0
            };
          })
        );

        setCities(citiesWithJourneyCount);
        setFilteredCities(citiesWithJourneyCount);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [selectedCountry]);

  useEffect(() => {
    let filtered = cities;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country?.name_fr.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCities(filtered);
  }, [searchTerm, cities]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton={true} variant="transparent" />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-alpine pt-20 pb-32">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Mountain className="h-16 w-16 text-white/80 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('choose_destination')}
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('destination_subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Filtres et Recherche */}
      <section className="relative z-20 -mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0">
              <CardContent className="p-4 md:p-8">
                <div className="flex flex-col gap-4 md:gap-6">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                          placeholder={t('search_placeholder')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-11 md:h-12 text-base md:text-lg border-0 bg-muted/30 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:items-center">
                      <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                        <Filter className="mr-2 h-4 w-4" />
                        Pays sélectionné :
                      </div>
                      <CountrySelector variant="default" className="w-full sm:min-w-[200px] md:w-auto" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-muted-foreground text-sm md:text-base">
                    <span className="font-medium text-primary">{filteredCities.length}</span> {t('destinations_available')}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {t('explore_with_confidence')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cities Selection */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredCities.map((city, index) => {
              return (
                <Card key={city.id} className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 group cursor-pointer bg-white">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={getCityImage({ 
                        hero_image_url: city.hero_image_url,
                        name: city.name,
                        slug: city.slug
                      })} 
                      alt={city.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${getCityGradient(index)} opacity-50 group-hover:opacity-30 transition-opacity duration-300`} />
                    
                    {/* City Stats - Nombre réel d'itinéraires */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                        {city.journeyCount || 0} {t('journeys_count')}
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                      <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                      {city.country && (
                        <p className="text-white/90 text-sm font-medium">{city.country.name_fr}</p>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <CardDescription className="text-base mb-6 line-clamp-2">
                      {city.description || `Découvrez les merveilles de ${city.name} avec nos parcours exclusifs.`}
                    </CardDescription>
                    
                    <Link to={`/destinations/${city.slug}`} className="block">
                      <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold transition-all duration-300 group-hover:shadow-lg">
                        <MapPin className="mr-2 h-5 w-5" />
                        {t('explore_city')} {city.name}
                        <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCities.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Mountain className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-3 text-foreground">{t('no_destination_found')}</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  {t('modify_search_criteria')}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="px-6"
                >
                  {t('reset_filters')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">{t('how_it_works')}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('how_it_works_description')}
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">{t('step_select')}</h3>
                <p className="text-sm text-muted-foreground">{t('step_select_desc')}</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Explorez</h3>
                <p className="text-sm text-muted-foreground">{t('step_explore_desc')}</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">{t('step_earn')}</h3>
                <p className="text-sm text-muted-foreground">{t('step_earn_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CitySelectionPage;
