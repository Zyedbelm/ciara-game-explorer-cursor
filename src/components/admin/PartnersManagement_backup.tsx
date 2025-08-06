import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useCityOptional } from '@/contexts/CityContext';
import { useCountry } from '@/contexts/CountryContext';
import CountryFilters from '@/components/admin/CountryFilters';
import { useOptimizedTranslations } from '@/hooks/useOptimizedTranslations';
import PartnerDashboardCharts from './PartnerDashboardCharts';
import PartnerDetailModal from './PartnerDetailModal';
import { 
  Building2, 
  Plus, 
  Edit, 
  Archive,
  Mail,
  Phone,
  MapPin,
  Globe,
  Store,
  RefreshCw,
  AlertCircle,
  Trash2,
  BarChart3,
  TrendingUp,
  Users,
  Star,
  Calendar,
  Activity,
  Award,
  CreditCard,
  ShoppingCart,
  Eye
} from 'lucide-react';

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
  slug: string;
  country_id: string;
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

interface RewardRedemption {
  id: string;
  reward_id: string;
  user_id: string;
  redeemed_at: string;
  points_spent: number;
  status: string;
  used_at?: string;
  rewards: {
    title: string;
    value_chf: number;
    partner_id: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface PartnerDetail {
  partner: Partner;
  stats: PartnerStats;
  redemptions: RewardRedemption[];
  offers: Array<{
    id: string;
    title: string;
    value_chf: number;
    points_required: number;
    is_active: boolean;
  }>;
}

const PARTNER_CATEGORIES = [
  'Restaurant',
  'Hôtel',
  'Commerce',
  'Activité',
  'Transport',
  'Culture',
  'Service'
];

interface PartnersManagementProps {
  cityId?: string;
}

const PartnersManagement: React.FC<PartnersManagementProps> = ({ cityId }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  
  // Filter states
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    category: 'Restaurant',
    description: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    latitude: '',
    longitude: '',
    is_active: true,
    city_id: ''
  });

  // États pour le tableau de bord des partenaires
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [partnerStats, setPartnerStats] = useState<PartnerStats[]>([]);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [topPartners, setTopPartners] = useState<PartnerStats[]>([]);
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<string>('all');
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState<PartnerDetail | null>(null);
  const [showPartnerDetail, setShowPartnerDetail] = useState(false);
  const [allRedemptions, setAllRedemptions] = useState<any[]>([]);

  const { toast } = useToast();
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, isTenantAdmin, isSuperAdmin, signOut } = useAuth();
  const { city } = useCityOptional();
  const { sendPartnerWelcomeEmail } = useEmailNotifications();
  const { currentLanguage } = useOptimizedTranslations();

  // Fonctions pour récupérer les données dynamiques
  const fetchPartnerStats = async () => {
    try {
      // Récupérer les partenaires avec leurs offres
      const { data: partnersData, error: partnersError } = await supabase
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
        .eq('is_active', true);

      if (partnersError) throw partnersError;

      // Récupérer toutes les redemptions pour calculer les statistiques
      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          rewards(partner_id, title, value_chf)
        `);

      if (redemptionsError) throw redemptionsError;

      // Sauvegarder toutes les redemptions pour l'analyse
      setAllRedemptions(redemptionsData || []);

      // Calculer les statistiques pour chaque partenaire
      const stats = partnersData?.map(partner => {
        const partnerRedemptions = redemptionsData?.filter(r => 
          r.rewards?.partner_id === partner.id
        ) || [];

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
      }) || [];

      setPartnerStats(stats);
      
      // Top 3 partenaires par redemptions
      const sortedPartners = [...stats].sort((a, b) => b.totalRedemptions - a.totalRedemptions);
      setTopPartners(sortedPartners.slice(0, 3));

    } catch (err) {
      console.error('Error fetching partner stats:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques des partenaires',
        variant: 'destructive',
      });
    }
  };

  const fetchCityStats = async () => {
    try {
      // Récupérer les statistiques par ville
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

      // Récupérer les redemptions pour calculer l'utilisation par jour
      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from('reward_redemptions')
        .select(`
          redeemed_at,
          points_spent,
          rewards(partner_id)
        `);

      if (redemptionsError) throw redemptionsError;

      // Calculer les statistiques par ville
      const stats = cityData?.map(city => {
        const cityPartners = city.partners || [];
        const totalPartners = cityPartners.length;
        const totalOffers = cityPartners.reduce((sum, p) => sum + (p.rewards?.length || 0), 0);
        const totalValue = cityPartners.reduce((sum, p) => 
          sum + (p.rewards?.reduce((s, r) => s + (r.value_chf || 0), 0) || 0), 0
        );

        // Calculer l'utilisation par jour pour cette ville
        const cityRedemptions = redemptionsData?.filter(r => 
          cityPartners.some(p => p.id === r.rewards?.partner_id)
        ) || [];

        const usageByDay: Record<string, number> = {};
        cityRedemptions.forEach(redemption => {
          const date = new Date(redemption.redeemed_at).toISOString().split('T')[0];
          usageByDay[date] = (usageByDay[date] || 0) + 1;
        });

        const totalRedemptions = cityRedemptions.length;
        const totalPointsSpent = cityRedemptions.reduce((sum, r) => sum + (r.points_spent || 0), 0);

        return {
          id: city.id,
          name: city.name,
          country: 'Suisse',
          totalPartners,
          totalOffers,
          totalValue,
          averageRating: 4.5,
          usageByDay,
          totalRedemptions,
          totalPointsSpent
        };
      }) || [];

      setCityStats(stats);

    } catch (err) {
      console.error('Error fetching city stats:', err);
    }
  };

  const fetchPartnerDetail = async (partnerId: string) => {
    try {
      // Récupérer les détails du partenaire
      const { data: partnerData, error: partnerError } = await supabase
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
        .eq('id', partnerId)
        .single();

      if (partnerError) throw partnerError;

      // Récupérer les redemptions détaillées
      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          rewards(title, value_chf, partner_id)
        `)
        .eq('rewards.partner_id', partnerId)
        .order('redeemed_at', { ascending: false });

      if (redemptionsError) throw redemptionsError;

      // Calculer les statistiques du partenaire
      const totalOffers = partnerData.rewards?.length || 0;
      const totalValue = partnerData.rewards?.reduce((sum, r) => sum + (r.value_chf || 0), 0) || 0;
      const totalRedemptions = redemptionsData?.length || 0;
      const totalPointsSpent = redemptionsData?.reduce((sum, r) => sum + (r.points_spent || 0), 0) || 0;

      const stats: PartnerStats = {
        id: partnerData.id,
        name: partnerData.name,
        city: partnerData.cities?.name || 'Ville inconnue',
        country: 'Suisse',
        totalOffers,
        totalValue,
        usageCount: totalRedemptions,
        rating: 4.5,
        lastActivity: redemptionsData?.[0]?.redeemed_at || partnerData.created_at || new Date().toISOString(),
        category: partnerData.category || 'Autre',
        totalRedemptions,
        totalPointsSpent,
        averageRating: 4.5
      };

      const partnerDetail: PartnerDetail = {
        partner: partnerData,
        stats,
        redemptions: redemptionsData || [],
        offers: partnerData.rewards || []
      };

      setSelectedPartnerDetail(partnerDetail);
      setShowPartnerDetail(true);

    } catch (err) {
      console.error('Error fetching partner detail:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails du partenaire',
        variant: 'destructive',
      });
    }
  };

  // Fonction pour analyser un partenaire spécifique
  const analyzePartner = (partnerId: string) => {
    const partner = partnerStats.find(p => p.id === partnerId);
    if (!partner) return null;

    // Récupérer toutes les redemptions pour ce partenaire
    const partnerRedemptions = allRedemptions.filter(r => 
      r.rewards?.partner_id === partnerId
    ) || [];

    // Analyse par jour
    const usageByDay: Record<string, number> = {};
    partnerRedemptions.forEach(redemption => {
      const date = new Date(redemption.redeemed_at).toISOString().split('T')[0];
      usageByDay[date] = (usageByDay[date] || 0) + 1;
    });

    // Analyse par heure
    const usageByHour: Record<number, number> = {};
    partnerRedemptions.forEach(redemption => {
      const hour = new Date(redemption.redeemed_at).getHours();
      usageByHour[hour] = (usageByHour[hour] || 0) + 1;
    });

    // Analyse par type d'offre
    const usageByOffer: Record<string, number> = {};
    partnerRedemptions.forEach(redemption => {
      const offerTitle = redemption.rewards?.title || 'Offre inconnue';
      usageByOffer[offerTitle] = (usageByOffer[offerTitle] || 0) + 1;
    });

    // Classement des meilleures offres
    const topOffers = Object.entries(usageByOffer)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Classement des utilisations par jour
    const topDays = Object.entries(usageByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    return {
      partner,
      usageByDay,
      usageByHour,
      usageByOffer,
      topOffers,
      topDays,
      totalRedemptions: partnerRedemptions.length
    };
  };

  // Fonctions pour le tableau de bord des partenaires
  const initializeDashboardData = async () => {
    setDashboardLoading(true);
    
    try {
      await fetchPartnerStats();
      await fetchCityStats();
    } catch (err) {
      console.error('Error initializing dashboard:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Filtrer les données selon les sélections
  const filteredPartnerStats = useMemo(() => {
    return partnerStats.filter(partner => {
      const countryMatch = selectedCountry === 'all' || partner.country === selectedCountry;
      const cityMatch = selectedCity === 'all' || partner.city === selectedCity;
      const partnerMatch = selectedPartnerFilter === 'all' || partner.id === selectedPartnerFilter;
      return countryMatch && cityMatch && partnerMatch;
    });
  }, [partnerStats, selectedCountry, selectedCity, selectedPartnerFilter]);

  const filteredCityStats = useMemo(() => {
    return cityStats.filter(city => {
      const countryMatch = selectedCountry === 'all' || city.country === selectedCountry;
      return countryMatch;
    });
  }, [cityStats, selectedCountry]);

  // Filtrer les villes disponibles selon le pays sélectionné
  const availableCities = useMemo(() => {
    if (selectedCountry === 'all') {
      return cities;
    }
    // Filtrer les villes qui ont des partenaires actifs dans le pays sélectionné
    const citiesWithActivePartners = partnerStats
      .filter(partner => partner.country === selectedCountry)
      .map(partner => partner.city);
    
    return cities.filter(city => citiesWithActivePartners.includes(city.name));
  }, [cities, selectedCountry, partnerStats]);

  // Calculer les statistiques globales
  const globalStats = useMemo(() => {
    const totalPartners = filteredPartnerStats.length;
    const totalOffers = filteredPartnerStats.reduce((sum, p) => sum + p.totalOffers, 0);
    const totalValue = filteredPartnerStats.reduce((sum, p) => sum + p.totalValue, 0);
    const totalUsage = filteredPartnerStats.reduce((sum, p) => sum + p.totalRedemptions, 0);
    const totalPointsSpent = filteredPartnerStats.reduce((sum, p) => sum + p.totalPointsSpent, 0);
    const avgRating = totalPartners > 0 
      ? filteredPartnerStats.reduce((sum, p) => sum + p.rating, 0) / totalPartners 
      : 0;

    return { totalPartners, totalOffers, totalValue, totalUsage, totalPointsSpent, avgRating };
  }, [filteredPartnerStats]);

  // Générer les données du heatmap
  const generateHeatmapData = () => {
    const data: Array<{ date: string; count: number }> = [];
    const today = new Date();
    
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const totalCount = filteredCityStats.reduce((sum, city) => {
        return sum + (city.usageByDay[dateStr] || 0);
      }, 0);
      
      data.push({ date: dateStr, count: totalCount });
    }
    
    return data;
  };

  // Générer les données pour les graphiques
  const generateChartData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyData = last30Days.map(date => {
      const count = filteredCityStats.reduce((sum, city) => {
        return sum + (city.usageByDay[date] || 0);
      }, 0);
      return { date, count };
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthStr = month.toISOString().slice(0, 7); // YYYY-MM
      
      const count = filteredCityStats.reduce((sum, city) => {
        return sum + Object.entries(city.usageByDay)
          .filter(([date]) => date.startsWith(monthStr))
          .reduce((s, [, dayCount]) => s + dayCount, 0);
      }, 0);
      
      return { month: monthStr, count };
    }).reverse();

    return { dailyData, monthlyData };
  };

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCountries(data || []);
    } catch (err) {
      console.warn('Error fetching countries:', err);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug, country_id')
        .order('name', { ascending: true });

      if (error) throw error;
      setCities(data || []);
    } catch (err) {
      console.warn('Error fetching cities:', err);
    }
  };

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('partners')
        .select(`
          *,
          cities:city_id(id, name, country_id)
        `)
        .order('name', { ascending: true });

      // For tenant admins, filter by their city
      if (isTenantAdmin() && profile?.city_id) {
        query = query.eq('city_id', profile.city_id);
      }
      // For super admins with cityId prop, filter by that city
      else if (cityId) {
        query = query.eq('city_id', cityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPartners(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(errorMessage);
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    fetchCountries();
    fetchCities();
    initializeDashboardData();
  }, [cityId, profile?.city_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const partnerData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        website: formData.website,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        is_active: formData.is_active,
        city_id: formData.city_id
      };

      if (editingPartner) {
        const { error } = await supabase
          .from('partners')
          .update(partnerData)
          .eq('id', editingPartner.id);

        if (error) throw error;

        toast({
          title: 'Succès',
          description: 'Partenaire mis à jour avec succès',
        });
      } else {
        const { error } = await supabase
          .from('partners')
          .insert([partnerData]);

        if (error) throw error;

        toast({
          title: 'Succès',
          description: 'Partenaire créé avec succès',
        });

        // Send welcome email if email is provided
        if (formData.email) {
          try {
            await sendPartnerWelcomeEmail({
              partnerName: formData.name,
              partnerEmail: formData.email,
              cityName: getCityName(formData.city_id)
            });
          } catch (emailError) {
            console.warn('Failed to send welcome email:', emailError);
          }
        }
      }

      setDialogOpen(false);
      resetForm();
      fetchPartners();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'opération';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Restaurant',
      description: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      latitude: '',
      longitude: '',
      is_active: true,
      city_id: ''
    });
    setEditingPartner(null);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      category: partner.category,
      description: partner.description || '',
      email: partner.email || '',
      phone: partner.phone || '',
      address: partner.address || '',
      website: partner.website || '',
      latitude: partner.latitude?.toString() || '',
      longitude: partner.longitude?.toString() || '',
      is_active: partner.is_active,
      city_id: partner.city_id
    });
    setDialogOpen(true);
  };

  const togglePartnerStatus = async (partnerId: string, isActive: boolean) => {
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

      fetchPartners();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!editingPartner) return;

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', editingPartner.id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Partenaire supprimé avec succès',
      });

      setDialogOpen(false);
      resetForm();
      fetchPartners();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleNewPartner = () => {
    resetForm();
    if (isTenantAdmin() && profile?.city_id) {
      setFormData(prev => ({ ...prev, city_id: profile.city_id }));
    }
    setDialogOpen(true);
  };

  const getCityName = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : 'Ville inconnue';
  };

  // Filter partners based on search and filters
  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const matchesSearch = searchTerm === '' || 
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (partner.email && partner.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCountry = selectedCountry === 'all' || 
        (partner.cities && partner.cities.country_id === selectedCountry);

      const matchesCity = selectedCity === 'all' || 
        partner.city_id === selectedCity;

      return matchesSearch && matchesCountry && matchesCity;
    });
  }, [partners, searchTerm, selectedCountry, selectedCity]);

  const handleClearFilters = () => {
    setSelectedCountry('all');
    setSelectedCity('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Gestion des Partenaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Gestion des Partenaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activePartners = filteredPartners.filter(p => p.is_active);
  const archivedPartners = filteredPartners.filter(p => !p.is_active);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Gestion des Partenaires
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tableau de bord des Partenaires
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Gestion des partenaires
              </TabsTrigger>
            </TabsList>

            {/* Onglet 1: Tableau de bord des Partenaires */}
            <TabsContent value="dashboard" className="space-y-6">
              {dashboardLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Chargement du tableau de bord...</span>
                </div>
              ) : (
                <>
                  {/* Filtres pour le tableau de bord */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Filtres géographiques
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Pays</label>
                          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un pays" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les pays</SelectItem>
                              {countries.map(country => (
                                <SelectItem key={country.id} value={country.name_fr}>
                                  {country.name_fr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Ville</label>
                          <Select value={selectedCity} onValueChange={setSelectedCity}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une ville" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Toutes les villes</SelectItem>
                              {cities.map(city => (
                                <SelectItem key={city.id} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Partenaire</label>
                          <Select value={selectedPartnerFilter} onValueChange={setSelectedPartnerFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un partenaire" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les partenaires</SelectItem>
                              {filteredPartnerStats.map(partner => (
                                <SelectItem key={partner.id} value={partner.id}>
                                  {partner.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Statistiques globales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Partenaires</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{globalStats.totalPartners}</div>
                        <p className="text-xs text-muted-foreground">
                          Partenaires actifs
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Offres</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{globalStats.totalOffers}</div>
                        <p className="text-xs text-muted-foreground">
                          Offres disponibles
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{globalStats.totalValue.toLocaleString()} CHF</div>
                        <p className="text-xs text-muted-foreground">
                          Valeur des offres
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisations</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{globalStats.totalUsage}</div>
                        <p className="text-xs text-muted-foreground">
                          Utilisations totales
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Vue d'ensemble avec heatmap et statistiques par ville */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Heatmap Calendrier */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Utilisation par jour (15 derniers jours)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {generateHeatmapData().map(({ date, count }) => (
                            <div key={date} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {new Date(date).toLocaleDateString('fr-FR', { 
                                  day: 'numeric', 
                                  month: 'short' 
                                })}
                              </span>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="h-4 rounded"
                                  style={{
                                    width: `${Math.max(20, count * 3)}px`,
                                    backgroundColor: count > 20 ? '#22c55e' : count > 10 ? '#eab308' : '#ef4444'
                                  }}
                                />
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Statistiques par ville */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Statistiques par ville
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {filteredCityStats.map(city => (
                            <div key={city.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{city.name}</h4>
                                <p className="text-sm text-muted-foreground">{city.country}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{city.totalPartners} partenaires</div>
                                <div className="text-sm text-muted-foreground">
                                  {city.totalOffers} offres • {city.totalValue.toLocaleString()} CHF
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Graphiques avancés */}
                  <PartnerDashboardCharts
                    dailyData={generateChartData().dailyData}
                    monthlyData={generateChartData().monthlyData}
                    partnerStats={filteredPartnerStats}
                    cityStats={filteredCityStats}
                  />

                  {/* Top 3 Partenaires avec bouton de détails */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Top 3 Partenaires
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {topPartners.map((partner, index) => (
                          <Card key={partner.id} className="relative">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </div>
                                  {partner.name}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                  {partner.city}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                  <div className="text-2xl font-bold text-primary">{partner.totalOffers}</div>
                                  <div className="text-xs text-muted-foreground">Offres</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-primary">{partner.totalRedemptions}</div>
                                  <div className="text-xs text-muted-foreground">Utilisations</div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Valeur totale:</span>
                                  <span className="font-medium">{partner.totalValue.toLocaleString()} CHF</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Points dépensés:</span>
                                  <span className="font-medium">{partner.totalPointsSpent}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Dernière activité:</span>
                                  <span className="font-medium">
                                    {new Date(partner.lastActivity).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </div>

                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => fetchPartnerDetail(partner.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir les détails
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Onglet 2: Gestion des partenaires */}
            <TabsContent value="management" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestion des partenaires</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchPartners}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                  <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={handleNewPartner}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau Partenaire
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* City Selection Field */}
                        <div>
                          <Label htmlFor="city_id">Ville *</Label>
                          {isSuperAdmin() ? (
                            <Select
                              value={formData.city_id}
                              onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une ville" />
                              </SelectTrigger>
                              <SelectContent>
                                {cities.map((city) => (
                                  <SelectItem key={city.id} value={city.id}>
                                    {city.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={getCityName(formData.city_id)}
                              disabled
                              className="bg-gray-100"
                            />
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {isSuperAdmin() 
                              ? 'Sélectionnez la ville pour ce partenaire'
                              : 'La ville est définie par votre profil administrateur'
                            }
                          </p>
                        </div>

                        {/* Name Field */}
                        <div>
                          <Label htmlFor="name">Nom du partenaire *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nom du partenaire"
                            required
                          />
                        </div>

                        {/* Category Field */}
                        <div>
                          <Label htmlFor="category">Catégorie *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              {PARTNER_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Description Field */}
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Description du partenaire"
                            rows={3}
                          />
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="email@exemple.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+41 22 123 45 67"
                            />
                          </div>
                        </div>

                        {/* Address and Website */}
                        <div>
                          <Label htmlFor="address">Adresse</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Adresse complète"
                          />
                        </div>

                        <div>
                          <Label htmlFor="website">Site web</Label>
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://www.exemple.com"
                          />
                        </div>

                        {/* Coordinates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                              id="latitude"
                              value={formData.latitude}
                              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                              placeholder="46.2044"
                              type="number"
                              step="any"
                            />
                          </div>
                          <div>
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                              id="longitude"
                              value={formData.longitude}
                              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                              placeholder="6.6323"
                              type="number"
                              step="any"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                          />
                          <Label htmlFor="is_active">Actif</Label>
                        </div>

                        <div className="flex justify-between">
                          {editingPartner && (
                            <Button 
                              type="button" 
                              variant="destructive" 
                              onClick={handleDelete}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </Button>
                          )}
                          
                          <div className="flex gap-2 ml-auto">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                              Annuler
                            </Button>
                            <Button type="submit">
                              {editingPartner ? 'Mettre à jour' : 'Créer'}
                            </Button>
                          </div>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>



              {/* Country and City Filters */}
              <CountryFilters
                countries={countries}
                cities={cities}
                selectedCountry={selectedCountry}
                selectedCity={selectedCity}
                searchTerm={searchTerm}
                onCountryChange={isTenantAdmin() ? () => {} : setSelectedCountry}
                onCityChange={isTenantAdmin() ? () => {} : setSelectedCity}
                onSearchChange={setSearchTerm}
                onClearFilters={handleClearFilters}
                language={currentLanguage}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{activePartners.length}</div>
                  <div className="text-sm text-green-600">Partenaires actifs</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{archivedPartners.length}</div>
                  <div className="text-sm text-gray-600">Partenaires archivés</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{partners.length}</div>
                  <div className="text-sm text-blue-600">Total partenaires</div>
                </div>
              </div>

              {/* Active Partners */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5 text-green-500" />
                  Partenaires Actifs ({activePartners.length})
                </h3>
                
                {activePartners.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun partenaire actif
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activePartners.map((partner) => (
                      <Card key={partner.id} className="border-green-200">
                        <CardContent className="p-4">
                          {/* Titre et boutons sur la première ligne */}
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm truncate">{partner.name}</h4>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(partner)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Switch
                                checked={partner.is_active}
                                onCheckedChange={(checked) => togglePartnerStatus(partner.id, checked)}
                                className="scale-75"
                              />
                            </div>
                          </div>
                          
                          {/* Badge sur la deuxième ligne */}
                          <div className="mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {partner.category}
                            </Badge>
                          </div>
                          
                          {partner.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {partner.description}
                            </p>
                          )}
                          
                          <div className="space-y-1">
                            {partner.email && (
                              <div className="flex items-center gap-1 text-xs">
                                <Mail className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="truncate">{partner.email}</span>
                              </div>
                            )}
                            {partner.phone && (
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="truncate">{partner.phone}</span>
                              </div>
                            )}
                            {partner.address && (
                              <div className="flex items-center gap-1 text-xs">
                                <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="truncate">{partner.address}</span>
                              </div>
                            )}
                            {partner.website && (
                              <div className="flex items-center gap-1 text-xs">
                                <Globe className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="truncate">{partner.website}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Archived Partners */}
              {archivedPartners.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Archive className="h-5 w-5 text-gray-500" />
                    Partenaires Archivés ({archivedPartners.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {archivedPartners.map((partner) => (
                      <Card key={partner.id} className="border-gray-200 opacity-60">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm truncate">{partner.name}</h4>
                            <Switch
                              checked={partner.is_active}
                              onCheckedChange={(checked) => togglePartnerStatus(partner.id, checked)}
                            />
                          </div>
                          
                          <Badge variant="outline" className="text-xs">
                            {partner.category}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de détails du partenaire */}
      <PartnerDetailModal
        partnerDetail={selectedPartnerDetail}
        isOpen={showPartnerDetail}
        onClose={() => {
          setShowPartnerDetail(false);
          setSelectedPartnerDetail(null);
        }}
      />
    </div>
  );
};

export default PartnersManagement; 