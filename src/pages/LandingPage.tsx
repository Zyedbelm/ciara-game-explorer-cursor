
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Map, Trophy, TrendingUp, Sparkles, ArrowRight, Play, Globe } from 'lucide-react';
import UserMenu from '@/components/navigation/UserMenu';
import ChatWidget from '@/components/chat/ChatWidget';
import Footer from '@/components/common/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCountry } from '@/contexts/CountryContext';
import { getLocalizedText } from '@/utils/translations';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import CountrySelector from '@/components/common/CountrySelector';
import { SocialProofSection } from '@/components/social/SocialProofSection';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { supabase } from '@/integrations/supabase/client';
import { getCityImage } from '@/utils/cityImageHelpers';

const LandingPage = () => {
  const { t, currentLanguage } = useLanguage();
  const { selectedCountry } = useCountry();
  const [destinations, setDestinations] = useState([]);

  const features = [
    {
      icon: Map,
      title: t('interactive_routes'),
      description: t('discover_destination_gamified'),
      color: "text-primary"
    },
    {
      icon: Trophy,
      title: t('reward_system'),
      description: t('earn_points_unlock_benefits'),
      color: "text-secondary"
    },
    {
      icon: Sparkles,
      title: t('personalized_ai'),
      description: t('intelligent_recommendations'),
      color: "text-accent"
    },
    {
      icon: TrendingUp,
      title: t('smart_analytics'),
      description: t('track_progress_insights'),
      color: "text-nature"
    }
  ];

  // Fetch cities based on selected country
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountry) return;
      
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .eq('country_id', selectedCountry.id)
          .eq('is_visible_on_homepage', true)
          .order('name');

        if (error) throw error;

        const cityDestinations = data?.map((city, index) => ({
          name: getLocalizedText(city.name, { 
            en: city.name_en || city.name, 
            de: city.name_de || city.name 
          }, currentLanguage),
          description: getLocalizedText(city.description, { 
            en: city.description_en || city.description, 
            de: city.description_de || city.description 
          }, currentLanguage),
          slug: city.slug,
          hero_image_url: (city as any).hero_image_url,
          image: getCityImage({ 
            hero_image_url: (city as any).hero_image_url,
            name: city.name,
            slug: city.slug
          }),
          color: ['from-primary to-primary-light', 'from-accent to-accent-light', 'from-nature to-nature-light'][index % 3]
        })) || [];

        setDestinations(cityDestinations);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setDestinations([]);
      }
    };

    fetchCities();
  }, [selectedCountry, currentLanguage, t]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <Mountain className="h-6 w-6" />
            CIARA
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector variant="transparent" />
            <UserMenu variant="transparent" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-alpine">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-32 pt-40 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              {t('discover_intelligent_tourism')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              {t('explore_destinations_gamified')}
            </p>
            <div className="flex justify-center relative z-20">
              <Link to="/cities">
                <Button size="lg" className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90 transition-all duration-300 transform hover:scale-105 relative z-30 shadow-lg">
                  <Play className="mr-2 h-5 w-5" />
                  {t('start_adventure')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Mountains Animation */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 200" className="w-full h-32 text-white/10">
            <path d="M0,200 L0,100 L200,20 L400,80 L600,10 L800,70 L1000,30 L1200,90 L1200,200 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('unique_experience')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('transform_exploration')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${feature.color === 'text-primary' ? 'from-primary/10 to-primary/20' : feature.color === 'text-secondary' ? 'from-secondary/10 to-secondary/20' : feature.color === 'text-accent' ? 'from-accent/10 to-accent/20' : 'from-nature/10 to-nature/20'} flex items-center justify-center`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('available_destinations')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('each_destination_unique')}
            </p>
          </div>
          
          {/* Country Selector */}
          <div className="flex justify-center mb-12">
            <CountrySelector variant="default" className="max-w-xs" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {destinations.map((destination, index) => (
              <Link key={index} to={`/destinations/${destination.slug}`}>
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 group cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${destination.color} opacity-60 group-hover:opacity-40 transition-opacity duration-300`} />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-1">{destination.name}</h3>
                      <p className="text-white/90 text-sm">{destination.description}</p>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-gradient-to-br from-white via-primary/5 to-accent/10 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-accent/15 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary tracking-wide">{t('explore_now')}</span>
                      <ArrowRight className="h-5 w-5 text-primary transform group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          {/* Bouton Voir toutes les villes */}
          <div className="flex justify-center mt-16">
            <Link to="/cities">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:from-primary-glow hover:to-primary transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-0 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                <Globe className="mr-3 h-5 w-5" />
                {t('see_all_cities')}
                <ArrowRight className="ml-3 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Section - with error boundary */}
      <ErrorBoundary>
        <SocialProofSection />
      </ErrorBoundary>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Mountain className="h-16 w-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('ready_for_adventure')}
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {t('join_thousands_explorers')}
            </p>
            <Link to="/cities">
              <Button size="lg" className="text-lg px-12 py-4 bg-white text-primary hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <Play className="mr-2 h-5 w-5" />
                {t('start_adventure')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default LandingPage;
