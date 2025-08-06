import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Partner {
  id: string;
  name: string;
  category: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  city_id: string;
  created_at: string;
  updated_at: string;
  cities?: {
    name: string;
    country_id: string;
  };
}

interface PartnerStats {
  id: string;
  name: string;
  city: string;
  country: string;
  totalOffers: number;
  totalValue: number;
  usageCount: number;
  rating: number;
  lastActivity: string;
  category: string;
  totalRedemptions: number;
  totalPointsSpent: number;
  averageRating: number;
}

interface CityStats {
  id: string;
  name: string;
  country: string;
  totalPartners: number;
  totalOffers: number;
  totalValue: number;
  averageRating: number;
  usageByDay: Record<string, number>;
  totalRedemptions: number;
  totalPointsSpent: number;
}

interface PartnerFormData {
  name: string;
  category: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
  city_id: string;
}

export const usePartnersManagement = (cityId?: string) => {
  const { toast } = useToast();
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerStats, setPartnerStats] = useState<PartnerStats[]>([]);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les partenaires avec optimisations
  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('partners')
        .select(`
          *,
          cities(name, country_id)
        `)
        .eq('is_active', true);

      if (cityId) {
        query = query.eq('city_id', cityId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPartners(data || []);
    } catch (err) {
      setError('Erreur lors du chargement des partenaires');
    } finally {
      setLoading(false);
    }
  }, [cityId]);

  // Charger les statistiques des partenaires avec optimisations
  const fetchPartnerStats = useCallback(async () => {
    try {
      // Requêtes parallèles pour optimiser les performances
      const [partnersResponse, redemptionsResponse] = await Promise.all([
        supabase
          .from('partners')
          .select(`
            *,
            cities(name, country_id),
            rewards(
              id,
              title,
              value_chf,
              points_required,
              is_active
            )
          `)
          .eq('is_active', true),
        
        supabase
          .from('reward_redemptions')
          .select(`
            *,
            rewards(partner_id, title, value_chf)
          `)
      ]);

      if (partnersResponse.error) throw partnersResponse.error;
      if (redemptionsResponse.error) throw redemptionsResponse.error;

      const partnersData = partnersResponse.data || [];
      const redemptionsData = redemptionsResponse.data || [];

      // Calculer les statistiques pour chaque partenaire
      const stats = partnersData.map(partner => {
        const partnerRedemptions = redemptionsData.filter(r => 
          r.rewards?.partner_id === partner.id
        );

        const totalOffers = partner.rewards?.length || 0;
        const totalValue = partner.rewards?.reduce((sum, r) => sum + (r.value_chf || 0), 0) || 0;
        const totalRedemptions = partnerRedemptions.length;
        const totalPointsSpent = partnerRedemptions.reduce((sum, r) => sum + (r.points_spent || 0), 0);
        const lastActivity = partnerRedemptions.length > 0 
          ? Math.max(...partnerRedemptions.map(r => new Date(r.redeemed_at).getTime()))
          : new Date(partner.created_at || Date.now()).getTime();

        return {
          id: partner.id,
          name: partner.name,
          city: partner.cities?.name || 'Ville inconnue',
          country: 'Suisse', // À adapter selon la structure
          totalOffers,
          totalValue,
          usageCount: totalRedemptions,
          rating: 4.5, // À calculer si on a des ratings
          lastActivity: new Date(lastActivity).toISOString(),
          category: partner.category || 'Autre',
          totalRedemptions,
          totalPointsSpent,
          averageRating: 4.5
        };
      });

      setPartnerStats(stats);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques des partenaires',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Charger les statistiques des villes
  const fetchCityStats = useCallback(async () => {
    try {
      const { data: cityData, error: cityError } = await supabase
        .from('cities')
        .select(`
          id,
          name,
          partners(
            id,
            rewards(
              id,
              value_chf
            )
          )
        `);

      if (cityError) throw cityError;

      // Calculer les statistiques par ville
      const stats = cityData?.map(city => {
        const totalPartners = city.partners?.length || 0;
        const totalOffers = city.partners?.reduce((sum, p) => 
          sum + (p.rewards?.length || 0), 0) || 0;
        const totalValue = city.partners?.reduce((sum, p) => 
          sum + (p.rewards?.reduce((rSum, r) => rSum + (r.value_chf || 0), 0) || 0), 0) || 0;

        return {
          id: city.id,
          name: city.name,
          country: 'Suisse', // À adapter
          totalPartners,
          totalOffers,
          totalValue,
          averageRating: 4.5,
          usageByDay: {}, // À calculer
          totalRedemptions: 0, // À calculer
          totalPointsSpent: 0 // À calculer
        };
      }) || [];

      setCityStats(stats);
    } catch (err) {
    }
  }, []);

  // Initialiser les données du dashboard
  const initializeDashboardData = useCallback(async () => {
    setDashboardLoading(true);
    try {
      await Promise.all([
        fetchPartnerStats(),
        fetchCityStats()
      ]);
    } catch (err) {
    } finally {
      setDashboardLoading(false);
    }
  }, [fetchPartnerStats, fetchCityStats]);

  // Créer un partenaire
  const createPartner = useCallback(async (data: PartnerFormData) => {
    try {
      const partnerData = {
        name: data.name,
        category: data.category,
        description: data.description,
        email: data.email,
        phone: data.phone,
        address: data.address,
        website: data.website,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        is_active: data.is_active,
        city_id: data.city_id
      };

      const { error } = await supabase
        .from('partners')
        .insert([partnerData]);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Partenaire créé avec succès',
      });

      // Recharger les données
      await fetchPartners();
      await fetchPartnerStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [fetchPartners, fetchPartnerStats, toast]);

  // Mettre à jour un partenaire
  const updatePartner = useCallback(async (id: string, data: PartnerFormData) => {
    try {
      const partnerData = {
        name: data.name,
        category: data.category,
        description: data.description,
        email: data.email,
        phone: data.phone,
        address: data.address,
        website: data.website,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        is_active: data.is_active,
        city_id: data.city_id
      };

      const { error } = await supabase
        .from('partners')
        .update(partnerData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Partenaire mis à jour avec succès',
      });

      // Recharger les données
      await fetchPartners();
      await fetchPartnerStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [fetchPartners, fetchPartnerStats, toast]);

  // Supprimer un partenaire
  const deletePartner = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Partenaire supprimé avec succès',
      });

      // Recharger les données
      await fetchPartners();
      await fetchPartnerStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [fetchPartners, fetchPartnerStats, toast]);

  // Basculer le statut d'un partenaire
  const togglePartnerStatus = useCallback(async (partnerId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ is_active: isActive })
        .eq('id', partnerId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `Partenaire ${isActive ? 'activé' : 'désactivé'} avec succès`,
      });

      // Recharger les données
      await fetchPartners();
      await fetchPartnerStats();
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors du changement de statut',
        variant: 'destructive',
      });
    }
  }, [fetchPartners, fetchPartnerStats, toast]);

  // Statistiques globales mémorisées
  const globalStats = useMemo(() => {
    const totalPartners = partnerStats.length;
    const totalOffers = partnerStats.reduce((sum, p) => sum + p.totalOffers, 0);
    const totalValue = partnerStats.reduce((sum, p) => sum + p.totalValue, 0);
    const totalUsage = partnerStats.reduce((sum, p) => sum + p.totalRedemptions, 0);
    const totalPointsSpent = partnerStats.reduce((sum, p) => sum + p.totalPointsSpent, 0);
    const avgRating = totalPartners > 0 
      ? partnerStats.reduce((sum, p) => sum + p.rating, 0) / totalPartners 
      : 0;

    return { totalPartners, totalOffers, totalValue, totalUsage, totalPointsSpent, avgRating };
  }, [partnerStats]);

  return {
    // État
    partners,
    partnerStats,
    cityStats,
    loading,
    dashboardLoading,
    error,
    globalStats,

    // Actions
    fetchPartners,
    fetchPartnerStats,
    fetchCityStats,
    initializeDashboardData,
    createPartner,
    updatePartner,
    deletePartner,
    togglePartnerStatus
  };
}; 