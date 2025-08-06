import React, { useEffect, useState, useMemo, Suspense } from 'react';
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
import { useStableTranslations } from '@/hooks/useStableTranslations';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PerformanceDiagnostic from '@/components/common/PerformanceDiagnostic';
import CityImagePlaceholder from '@/components/common/CityImagePlaceholder';

// Composant de chargement progressif pour les images
const ProgressiveImage = ({ src, alt, className, cityName }: { 
  src: string; 
  alt: string; 
  className: string;
  cityName?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return cityName ? (
      <CityImagePlaceholder cityName={cityName} className={className} />
    ) : (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center`}>
        <Globe className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};

// Composant de skeleton pour les destinations
const DestinationSkeleton = () => (
  <Card className="overflow-hidden border-0 shadow-lg animate-pulse">
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-full" />
    </CardHeader>
  </Card>
);

const OptimizedLandingPage = () => {
  const { currentLanguage } = useLanguage();
  const { selectedCountry } = useCountry();
  const { t, isLoading: translationsLoading, cacheStats } = useStableTranslations();
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { 
    startMonitoring, 
    recordTranslationCacheHit, 
    recordTranslationCacheMiss,
    metrics: performanceMetrics,
    issues: performanceIssues
  } = usePerformanceMonitor();
  const [destinations, setDestinations] = useState([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Mémoriser les features pour éviter les re-renders
  const features = useMemo(() => [
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
  ], [t]);

  // Démarrer le monitoring de performance
  useEffect(() => {
    startMonitoring();
  }, [startMonitoring]);

  // Fetch cities avec gestion d'erreur et retry
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountry) {
        setIsLoadingDestinations(false);
        return;
      }
      
      try {
        setIsLoadingDestinations(true);
        setHasError(false);
        
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .eq('country_id', selectedCountry.id)
          .eq('is_visible_on_homepage', true)
          .order('name');

        if (error) throw error;

        const cityDestinations = data?.map((city, index) => ({
          name: city.name,
          name_en: city.name_en,
          name_de: city.name_de,
          description: city.description,
          description_en: city.description_en,
          description_de: city.description_de,
          slug: city.slug,
          hero_image_url: city.hero_image_url,
          image: getCityImage({ 
            hero_image_url: city.hero_image_url,
            name: city.name,
            slug: city.slug
          }),
          color: ['from-primary to-primary-light', 'from-accent to-accent-light', 'from-nature to-nature-light'][index % 3]
        })) || [];

        setDestinations(cityDestinations);
      } catch (error) {
        setHasError(true);
        setDestinations([]);
      } finally {
        setIsLoadingDestinations(false);
      }
    };

    fetchCities();
  }, [selectedCountry]); // Retirer currentLanguage de la dépendance

  // Pas besoin de mettre à jour les destinations - les traductions se feront dynamiquement

  // Afficher un loader seulement si les traductions ne sont vraiment pas prêtes
  if (translationsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

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

      {/* Hero Section avec animations */}
      <section className="relative overflow-hidden bg-gradient-alpine">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-32 pt-40 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            >
              {t('discover_intelligent_tourism')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed"
            >
              {t('explore_destinations_gamified')}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex justify-center relative z-20"
            >
              <Link to="/cities">
                <Button size="lg" className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90 relative z-30 shadow-lg bounce-hover">
                  <Play className="mr-2 h-5 w-5" />
                  {t('start_adventure')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Floating Mountains Animation */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 200" className="w-full h-32 text-white/10">
            <path d="M0,200 L0,100 L200,20 L400,80 L600,10 L800,70 L1000,30 L1200,90 L1200,200 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Features Section avec animations */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('unique_experience')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('transform_exploration')}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl bg-white/80 backdrop-blur-sm card-hover">
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section avec chargement progressif */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('available_destinations')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('each_destination_unique')}
            </p>
          </motion.div>
          
          {/* Country Selector */}
          <div className="flex justify-center mb-12">
            <CountrySelector variant="default" className="max-w-xs" />
          </div>
          
          {/* Destinations Grid avec gestion d'erreur */}
          <div className="grid md:grid-cols-3 gap-8">
            {isLoadingDestinations ? (
              // Skeletons pendant le chargement
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <DestinationSkeleton />
                </motion.div>
              ))
            ) : hasError ? (
              // Message d'erreur
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <div className="text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-4">Impossible de charger les destinations</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                  >
                    Réessayer
                  </Button>
                </div>
              </motion.div>
            ) : destinations.length === 0 ? (
              // Aucune destination
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <div className="text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Aucune destination disponible pour ce pays</p>
                </div>
              </motion.div>
            ) : (
              // Destinations chargées
              destinations.map((destination, index) => (
                <motion.div
                  key={destination.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Link to={`/destinations/${destination.slug}`}>
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform group cursor-pointer">
                      <div className="relative h-48 overflow-hidden">
                        <ProgressiveImage 
                          src={destination.image} 
                          alt={destination.name}
                          cityName={destination.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${destination.color} opacity-50 group-hover:opacity-30 transition-opacity duration-300`} />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                          {getLocalizedText(destination.name, { 
                            en: destination.name_en || destination.name, 
                            de: destination.name_de || destination.name 
                          }, currentLanguage)}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {getLocalizedText(destination.description, { 
                            en: destination.description_en || destination.description, 
                            de: destination.description_de || destination.description 
                          }, currentLanguage)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                        >
                          {t('explore_now')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('ready_for_adventure')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('join_thousands_explorers')}
            </p>
            <Link to="/cities">
              <Button size="lg" className="text-lg px-8 py-4">
                {t('start_adventure')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Footer */}
      <Footer />

      {/* Chat Widget */}
      <ChatWidget />

      {/* Diagnostic de performance en développement - visible uniquement pour super_admin */}
      <PerformanceDiagnostic
        metrics={performanceMetrics}
        issues={performanceIssues}
        cacheStats={cacheStats}
        isVisible={process.env.NODE_ENV === 'development' && profile?.role === 'super_admin'}
      />
    </div>
  );
};

export default OptimizedLandingPage;