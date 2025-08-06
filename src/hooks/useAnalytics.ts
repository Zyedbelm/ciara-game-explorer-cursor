
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { userJourneysService } from '@/services/userJourneysService';

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  completedJourneys: number;
  totalPoints: number;
  engagementRate: number;
  userGrowth: number;
  journeyCompletionRate: number;
  avgSessionTime: number;
}

export interface PopularJourney {
  id: string;
  name: string;
  participants: number;
  avgRating: number;
  completionRate: number;
}

export interface CityStats {
  name: string;
  users: number;
  journeys: number;
  avgRating: number;
}

export const useAnalytics = () => {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [popularJourneys, setPopularJourneys] = useState<PopularJourney[]>([]);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser le service userJourneysService pour les données agrégées
      const isSuperAdmin = profile?.role === 'super_admin';
      const cityId = isSuperAdmin ? undefined : profile?.city_id;
      
      // Récupérer les données agrégées via le service avec une période d'activité de 30 jours
      const aggregatedData = await userJourneysService.getAggregatedUserStats(cityId, 30);

      // Calculer les métriques dérivées
      const engagementRate = aggregatedData.totalUsers > 0 ? 
        (aggregatedData.activeUsers / aggregatedData.totalUsers) * 100 : 0;
      
      const userGrowth = aggregatedData.activeUsers > 0 ? 12.5 : 0; // Simulé
      
      const analyticsData: AnalyticsData = {
        totalUsers: aggregatedData.totalUsers,
        activeUsers: aggregatedData.activeUsers,
        completedJourneys: aggregatedData.completedJourneys,
        totalPoints: aggregatedData.totalPoints,
        engagementRate,
        userGrowth,
        journeyCompletionRate: aggregatedData.averageCompletionRate,
        avgSessionTime: 135 // Minutes, simulé pour demo
      };

      setAnalytics(analyticsData);

      // Transformer les parcours populaires
      const popularJourneysData = aggregatedData.popularJourneys.map(journey => ({
        id: journey.id,
        name: journey.name,
        participants: journey.completions,
        avgRating: journey.averageRating,
        completionRate: 85 // Simulé
      }));

      setPopularJourneys(popularJourneysData);

      // Récupérer les statistiques par ville si super admin
      if (isSuperAdmin) {
        const { data: cities, error: citiesError } = await supabase
          .from('cities')
          .select('id, name');

        if (citiesError) throw citiesError;

        const cityStatsPromises = cities?.map(async (city) => {
          const cityData = await userJourneysService.getAggregatedUserStats(city.id, 30);
          return {
            name: city.name,
            users: cityData.totalUsers,
            journeys: cityData.completedJourneys,
            avgRating: 4.5 // Simulé
          };
        }) || [];

        const cityStatsData = await Promise.all(cityStatsPromises);
        setCityStats(cityStatsData);
      } else {
        // Pour les tenant admins, afficher seulement leur ville
        const cityName = profile?.city_id ? 'Ville assignée' : 'Aucune ville';
        setCityStats([{
          name: cityName,
          users: aggregatedData.totalUsers,
          journeys: aggregatedData.completedJourneys,
          avgRating: 4.5
        }]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des analytics';
      setError(errorMessage);
      
      // Définir des valeurs par défaut en cas d'erreur
      setAnalytics({
        totalUsers: 0,
        activeUsers: 0,
        completedJourneys: 0,
        totalPoints: 0,
        engagementRate: 0,
        userGrowth: 0,
        journeyCompletionRate: 0,
        avgSessionTime: 0
      });
      setPopularJourneys([]);
      setCityStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchAnalytics();
    }
  }, [profile]);

  return {
    analytics,
    popularJourneys,
    cityStats,
    loading,
    error,
    refetch: fetchAnalytics
  };
};
