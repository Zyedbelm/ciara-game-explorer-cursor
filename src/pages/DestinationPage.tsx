
import React, { useState, useMemo } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCity } from '@/contexts/CityContext';
import { useQuery } from '@tanstack/react-query';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Trophy, MapPin, Zap, Sparkles, Wand2, AlertTriangle, Navigation } from 'lucide-react';
import JourneyCard from '@/components/destination/JourneyCard';
import CategoryFilter from '@/components/destination/CategoryFilter';
import AIJourneyGenerator from '@/components/destination/AIJourneyGenerator';
import UserStatsCard from '@/components/destination/UserStatsCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJourneyCards } from '@/contexts/JourneyCardsContext';

interface RankingUser {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  city_points: number;
  steps_completed: number;
  journeys_completed: number;
  rank_position: number;
}

interface CityData {
  id: string;
  name: string;
  description: string | null;
}

interface JourneyCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  type: string | null;
}

interface Journey {
  id: string;
  name: string;
  description: string | null;
  difficulty: string | null;
  estimated_duration: number | null;
  distance_km: number | null;
  total_points: number | null;
  image_url: string | null;
}

const DestinationPage = () => {
  const { slug: citySlug } = useParams();
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { t } = useLanguage();
  const { city: cityData, loading: cityLoading, error: cityError } = useCity();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { expandAllCards, collapseAllCards, expandedCards } = useJourneyCards();
  
  // Query for all cities for selector
  const { data: allCities = [] } = useQuery({
    queryKey: ['all-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug')
        .eq('is_visible_on_homepage', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  console.log('🏙️ DestinationPage - City slug from params:', citySlug);
  console.log('🏙️ DestinationPage - City from context:', cityData);
  console.log('🏙️ DestinationPage - City error:', cityError);
  
  // Handle invalid slug early
  if (citySlug === 'undefined') {
    console.error('🚨 DestinationPage - Invalid slug "undefined", redirecting to cities');
    return <Navigate to="/cities" replace />;
  }
  
  // Query for journey categories with error boundary
  const { data: categories = [], isError: categoriesError } = useQuery({
    queryKey: ['journey-categories', cityData?.id],
    queryFn: async () => {
      if (!cityData?.id) return [];
      
      console.log('🔍 Fetching categories for city:', cityData.id);
      
      const { data, error } = await supabase
        .from('journey_categories')
        .select('*')
        .eq('city_id', cityData.id);
        
      if (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
      }
      
      console.log('✅ Categories fetched:', data);
      return data as JourneyCategory[];
    },
    enabled: !!cityData?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Query for journeys by category with error boundary
  const { data: journeys = [], isError: journeysError } = useQuery({
    queryKey: ['journeys', cityData?.id, selectedCategory],
    queryFn: async () => {
      if (!cityData?.id) return [];
      
      console.log('🔍 Fetching journeys for city:', cityData.id, 'category:', selectedCategory);
      
      let query = supabase
        .from('journeys')
        .select('*')
        .eq('city_id', cityData.id)
        .eq('is_active', true);
        
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('❌ Error fetching journeys:', error);
        throw error;
      }
      
      console.log('✅ Journeys fetched:', data);
      return data as Journey[];
    },
    enabled: !!cityData?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Query for city-specific top explorers using the new function
  const { data: ranking = [], isError: rankingError } = useQuery({
    queryKey: ['city-top-explorers', cityData?.id],
    queryFn: async () => {
      if (!cityData?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_city_top_explorers', {
          p_city_id: cityData.id,
          p_limit: 10
        });

      if (error) {
        console.error('❌ Error fetching city top explorers:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!cityData?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  // Memoize user rank calculation to prevent unnecessary re-renders
  const userRank = useMemo(() => {
    if (!user || !profile) return null;
    return ranking.findIndex(u => u.user_id === user.id) + 1;
  }, [user, profile, ranking]);

  // Memoize total points calculation
  const totalCityPoints = useMemo(() => {
    return ranking.reduce((total, user) => total + (user.city_points || 0), 0);
  }, [ranking]);

  if (cityLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">{t('loading_destination') || 'Chargement de la destination...'}</p>
        </div>
      </div>
    );
  }

  // Handle city not found or invalid slug
  if (!cityData || cityError) {
    return (
      <StandardPageLayout>
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('destination_not_found') || 'Destination introuvable'}
            </h1>
            <p className="text-muted-foreground mb-4">
              {cityError || (t('destination_not_available') || 'Cette destination n\'est pas disponible pour le moment.')}
            </p>
            {citySlug && (
              <p className="text-sm text-muted-foreground mb-6">
                Slug recherché: <code className="bg-muted px-2 py-1 rounded">{citySlug}</code>
              </p>
            )}
            <Button onClick={() => window.location.href = '/cities'}>
              {t('browse_destinations') || 'Parcourir les destinations'}
            </Button>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  // Handle any API errors gracefully
  if (categoriesError || journeysError || rankingError) {
    console.error('API Error detected:', { categoriesError, journeysError, rankingError });
  }

  return (
    <StandardPageLayout 
      showBackButton 
      title={cityData.name}
      className="bg-gradient-to-br from-background via-muted/10 to-background"
      containerClassName="space-y-6"
    >
      {/* Hero Section - Compact */}
      <div className="text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-alpine bg-clip-text text-transparent mb-3">
            {t('explore_city') || 'Explorez'} {cityData.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-4 max-w-xl mx-auto">
            {cityData.description || `Découvrez ${cityData.name} à travers nos parcours personnalisés.`}
          </p>
          
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{journeys.length} {t('journeys_available') || 'parcours disponibles'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              <span>{ranking.length} {t('explorers') || 'explorateurs'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-secondary" />
              <span>{totalCityPoints} {t('points') || 'points'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Section - Stats, Top Explorateurs et IA alignés - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
        {/* User Stats - Responsive: pleine largeur mobile, 1/3 tablet, 2/5 desktop */}
        <div className="md:col-span-1 lg:col-span-2 flex">
          <div className="w-full">
            <UserStatsCard
              user={user}
              profile={profile}
              userRank={userRank}
              cityName={cityData.name}
              ranking={ranking}
            />
          </div>
        </div>

        {/* Top Explorers - Responsive: pleine largeur mobile, 1/3 tablet, 1/5 desktop */}
        <div className="md:col-span-1 lg:col-span-1 flex">
          <Card className="border-border/50 w-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-primary" />
                {t('top_explorers') || 'Top Explorateurs'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
              <div className="space-y-2">
                {ranking.slice(0, 4).map((rankUser, index) => (
                  <div
                    key={rankUser.user_id}
                    className={`flex items-center gap-2 p-1.5 rounded-md transition-colors ${
                      rankUser.user_id === user?.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-6 h-6">
                      {index === 0 && <span className="text-sm">👑</span>}
                      {index === 1 && <span className="text-sm">🥈</span>}
                      {index === 2 && <span className="text-sm">🥉</span>}
                      {index > 2 && (
                        <span className="text-xs font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {rankUser.full_name || `Explorateur #${rankUser.rank_position}`}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{rankUser.city_points} pts</span>
                        <span>•</span>
                        <span>{rankUser.steps_completed} étapes</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {ranking.length === 0 && (
                  <div className="text-center py-3 space-y-2">
                    <div className="bg-primary/5 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs font-medium text-foreground">
                      {user ? 
                        (t('top_explorers_empty_logged_in') || 'Commencez votre exploration pour apparaître dans le classement !') :
                        (t('top_explorers_empty_logged_out') || 'Découvrez la ville et soyez parmi les premiers explorateurs !')
                      }
                    </p>
                    {user ? (
                      <button 
                        onClick={() => {
                          const journeysList = document.getElementById('journeys-section');
                          journeysList?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {t('start_exploring') || 'Commencer à explorer'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => window.location.href = '/auth'}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {t('login_to_compete') || 'Se connecter pour participer'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Generator - Responsive: pleine largeur mobile, 1/3 tablet, 2/5 desktop */}
        <div className="md:col-span-1 lg:col-span-2 flex">
          <Card className="w-full bg-gradient-alpine border-border/50 text-white overflow-hidden relative flex flex-col">
            <div className="absolute inset-0 bg-black/20" />
            <CardContent className="relative z-10 p-4 md:p-6 flex-1 flex flex-col justify-center">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2 text-base md:text-lg">
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                    {t('ai_personalized_journey') || 'Parcours IA Personnalisé'}
                  </h3>
                  <p className="text-white/90 text-sm md:text-base leading-relaxed">
                    {t('ai_journey_description') || 'Laissez notre IA créer un parcours unique selon vos préférences !'}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-3 text-xs md:text-sm text-white/80">
                    <span className="flex items-center gap-1">
                      <Wand2 className="h-3 w-3" />
                      {t('quick_generation') || 'Génération rapide'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {t('100_personalized') || '100% personnalisé'}
                    </span>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <AIJourneyGenerator cityName={cityData.name} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Section - Liste des parcours */}
      <div id="journeys-section" className="grid grid-cols-1 gap-4">
        {/* Category Filter - Encadré compact */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="mb-3">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">
                {t('filter_by_category') || 'Filtrer par catégorie'}
              </h3>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                totalJourneys={journeys.length}
              />
            </div>
          </CardContent>
        </Card>

        {/* Journeys Grid - Encadré principal avec grille responsive */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                {selectedCategory 
                  ? categories.find(c => c.id === selectedCategory)?.name 
                  : (t('all_journeys') || 'Tous les parcours')
                }
                <Badge variant="secondary">
                  {journeys.length}
                </Badge>
              </CardTitle>
              
              {/* Contrôles d'expansion des cartes */}
              {journeys.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => expandAllCards(journeys.map(j => j.id))}
                    className="text-xs"
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Tout déployer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAllCards}
                    className="text-xs"
                  >
                    <Navigation className="h-3 w-3 mr-1 rotate-90" />
                    Tout replier
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {journeys.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {journeys.map((journey) => (
                  <JourneyCard 
                    key={journey.id} 
                    journey={journey} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-2">
                  {t('no_journeys_available') || 'Aucun parcours disponible'}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {selectedCategory 
                    ? (t('no_journeys_category') || 'Aucun parcours dans cette catégorie pour le moment.')
                    : (t('no_journeys_general') || 'Aucun parcours disponible pour cette destination.')
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('use_ai_generator') || 'Utilisez le générateur IA pour créer un parcours personnalisé !'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default DestinationPage;
