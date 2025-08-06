import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Building,
  ShoppingBag,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Filter
} from 'lucide-react';

interface PartnerData {
  id: string;
  name: string;
  category: string;
  email: string;
  city_id: string;
  city?: {
    name: string;
    country_id: string;
    countries?: {
      name_fr: string;
      name_en: string;
      name_de: string;
    };
  };
  is_active: boolean;
  total_rewards: number;
  total_redemptions: number;
  total_revenue: number;
  average_rating: number;
}

interface DashboardStats {
  totalPartners: number;
  activePartners: number;
  totalRewards: number;
  totalRedemptions: number;
  totalRevenue: number;
  averageRating: number;
}

interface DailyStats {
  day: string;
  redemptions: number;
  revenue: number;
}

interface HourlyStats {
  hour: string;
  redemptions: number;
  revenue: number;
}

interface TopOffer {
  title: string;
  points: number;
  value: number;
  redemptions: number;
  status: string;
}

const PartnersDashboard = () => {
  const { profile, isSuperAdmin, isTenantAdmin } = useAuth();
  const { toast } = useToast();
  
  // États pour les données
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPartners: 0,
    activePartners: 0,
    totalRewards: 0,
    totalRedemptions: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([]);
  const [topOffers, setTopOffers] = useState<TopOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour les filtres
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [countries, setCountries] = useState<Array<{id: string, name_fr: string}>>([]);
  const [cities, setCities] = useState<Array<{id: string, name: string, country_id: string}>>([]);

  // Onglets
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [selectedCountry, selectedCity, selectedPartner]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPartners(),
        fetchCountries(),
        fetchCities(),
        fetchStats(),
        fetchDailyStats(),
        fetchHourlyStats(),
        fetchTopOffers()
      ]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des partenaires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    let query = supabase
      .from('partners')
      .select(`
        id,
        name,
        category,
        email,
        city_id,
        is_active,
        cities (
          name,
          country_id,
          countries (
            name_fr,
            name_en,
            name_de
          )
        )
      `)
      .eq('is_active', true);

    // Filtres selon le rôle
    if (isTenantAdmin() && profile?.city_id) {
      query = query.eq('city_id', profile.city_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Appliquer les filtres supplémentaires
    let filteredPartners = data || [];
    
    if (selectedCountry !== 'all') {
      filteredPartners = filteredPartners.filter(p => 
        p.cities?.countries?.name_fr === countries.find(c => c.id === selectedCountry)?.name_fr
      );
    }
    
    if (selectedCity !== 'all') {
      filteredPartners = filteredPartners.filter(p => p.city_id === selectedCity);
    }

    if (selectedPartner !== 'all') {
      filteredPartners = filteredPartners.filter(p => p.id === selectedPartner);
    }

    setPartners(filteredPartners);
  };

  const fetchCountries = async () => {
    if (isTenantAdmin()) {
      // Pour Admin Ville, récupérer seulement son pays
      if (profile?.city_id) {
        const { data: cityData } = await supabase
          .from('cities')
          .select('country_id, countries(name_fr)')
          .eq('id', profile.city_id)
          .single();
        
        if (cityData) {
          setCountries([{ id: cityData.country_id, name_fr: cityData.countries.name_fr }]);
        }
      }
    } else {
      // Pour Super Admin, récupérer tous les pays
      const { data, error } = await supabase
        .from('countries')
        .select('id, name_fr')
        .eq('is_active', true)
        .order('name_fr');
      
      if (error) throw error;
      setCountries(data || []);
    }
  };

  const fetchCities = async () => {
    if (isTenantAdmin()) {
      // Pour Admin Ville, récupérer seulement sa ville
      if (profile?.city_id) {
        const { data: cityData } = await supabase
          .from('cities')
          .select('id, name, country_id')
          .eq('id', profile.city_id)
          .single();
        
        if (cityData) {
          setCities([cityData]);
        }
      }
    } else {
      // Pour Super Admin, récupérer les villes selon le pays sélectionné
      let query = supabase
        .from('cities')
        .select('id, name, country_id')
        .eq('is_archived', false)
        .order('name');
      
      if (selectedCountry !== 'all') {
        query = query.eq('country_id', selectedCountry);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setCities(data || []);
    }
  };

  const fetchStats = async () => {
    // Construire la requête selon les filtres
    let partnerIds = partners.map(p => p.id);
    
    if (partnerIds.length === 0) {
      setStats({
        totalPartners: 0,
        activePartners: 0,
        totalRewards: 0,
        totalRedemptions: 0,
        totalRevenue: 0,
        averageRating: 0
      });
      return;
    }

    // Requête simplifiée pour récupérer les statistiques
    const { data: rewardsData, error: rewardsError } = await supabase
      .from('rewards')
      .select('id, value_chf, partner_id')
      .in('partner_id', partnerIds)
      .eq('is_active', true);

    if (rewardsError) throw rewardsError;

    const rewardIds = rewardsData?.map(r => r.id) || [];
    
    if (rewardIds.length === 0) {
      setStats({
        totalPartners: partners.length,
        activePartners: partners.filter(p => p.is_active).length,
        totalRewards: 0,
        totalRedemptions: 0,
        totalRevenue: 0,
        averageRating: 4.2
      });
      return;
    }

    const { data: redemptionsData, error: redemptionsError } = await supabase
      .from('reward_redemptions')
      .select('id, reward_id, status')
      .in('reward_id', rewardIds)
      .in('status', ['pending', 'used']);

    if (redemptionsError) throw redemptionsError;

    // Calculer les statistiques
    const totalRewards = rewardsData?.length || 0;
    const totalRedemptions = redemptionsData?.length || 0;
    const totalRevenue = rewardsData?.reduce((sum, reward) => {
      const redemptionsForReward = redemptionsData?.filter(r => r.reward_id === reward.id).length || 0;
      return sum + (reward.value_chf || 0) * redemptionsForReward;
    }, 0) || 0;

    setStats({
      totalPartners: partners.length,
      activePartners: partners.filter(p => p.is_active).length,
      totalRewards,
      totalRedemptions,
      totalRevenue,
      averageRating: 4.2 // Placeholder - à implémenter avec les vraies données
    });
  };

  const fetchDailyStats = async () => {
    // Récupérer les vraies données quotidiennes
    let partnerIds = partners.map(p => p.id);
    
    if (partnerIds.length === 0) {
      setDailyStats([]);
      return;
    }

    const { data: redemptionsData, error } = await supabase
      .from('reward_redemptions')
      .select(`
        created_at,
        rewards!inner (
          value_chf,
          partner_id
        )
      `)
      .in('rewards.partner_id', partnerIds)
      .in('status', ['pending', 'used'])
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // Grouper par jour de la semaine
    const daysOfWeek = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const dailyStatsMap = new Map();

    redemptionsData?.forEach(redemption => {
      const date = new Date(redemption.created_at);
      const dayName = daysOfWeek[date.getDay()];
      
      if (!dailyStatsMap.has(dayName)) {
        dailyStatsMap.set(dayName, { redemptions: 0, revenue: 0 });
      }
      
      const stats = dailyStatsMap.get(dayName);
      stats.redemptions++;
      stats.revenue += redemption.rewards?.value_chf || 0;
    });

    // Créer le tableau final
    const dailyStatsArray = daysOfWeek.map(day => ({
      day,
      redemptions: dailyStatsMap.get(day)?.redemptions || 0,
      revenue: dailyStatsMap.get(day)?.revenue || 0
    }));

    setDailyStats(dailyStatsArray);
  };

  const fetchHourlyStats = async () => {
    // Récupérer les vraies données horaires
    let partnerIds = partners.map(p => p.id);
    
    if (partnerIds.length === 0) {
      setHourlyStats([]);
      return;
    }

    const { data: redemptionsData, error } = await supabase
      .from('reward_redemptions')
      .select(`
        created_at,
        rewards!inner (
          value_chf,
          partner_id
        )
      `)
      .in('rewards.partner_id', partnerIds)
      .in('status', ['pending', 'used'])
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // Grouper par heure
    const hourlyStatsMap = new Map();

    redemptionsData?.forEach(redemption => {
      const date = new Date(redemption.created_at);
      const hour = `${date.getHours()}:00`;
      
      if (!hourlyStatsMap.has(hour)) {
        hourlyStatsMap.set(hour, { redemptions: 0, revenue: 0 });
      }
      
      const stats = hourlyStatsMap.get(hour);
      stats.redemptions++;
      stats.revenue += redemption.rewards?.value_chf || 0;
    });

    // Créer le tableau final avec les heures les plus actives
    const hourlyStatsArray = Array.from(hourlyStatsMap.entries())
      .map(([hour, stats]) => ({
        hour,
        redemptions: stats.redemptions,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.redemptions - a.redemptions)
      .slice(0, 5); // Top 5 heures

    setHourlyStats(hourlyStatsArray);
  };

  const fetchTopOffers = async () => {
    // Récupérer les vraies meilleures offres
    let partnerIds = partners.map(p => p.id);
    
    if (partnerIds.length === 0) {
      setTopOffers([]);
      return;
    }

    const { data: rewardsData, error } = await supabase
      .from('rewards')
      .select(`
        title,
        points_required,
        value_chf,
        is_active,
        partner_id,
        reward_redemptions (
          id,
          status
        )
      `)
      .in('partner_id', partnerIds)
      .eq('is_active', true);

    if (error) throw error;

    // Calculer les statistiques pour chaque offre
    const offersWithStats = rewardsData?.map(reward => {
      const redemptions = reward.reward_redemptions?.filter(r => 
        r.status === 'pending' || r.status === 'used'
      ) || [];
      
      return {
        title: reward.title,
        points: reward.points_required || 0,
        value: reward.value_chf || 0,
        redemptions: redemptions.length,
        status: reward.is_active ? 'Active' : 'Inactive'
      };
    }) || [];

    // Trier par nombre de rédactions et prendre le top 5
    const topOffers = offersWithStats
      .sort((a, b) => b.redemptions - a.redemptions)
      .slice(0, 5);

    setTopOffers(topOffers);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données des partenaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Tableau de Bord des Partenaires</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin() ? 'Vue d\'ensemble de tous les partenaires' : 
             isTenantAdmin() ? `Vue d'ensemble des partenaires de ${profile?.city_name || 'votre ville'}` : 
             'Vue d\'ensemble'}
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {isSuperAdmin() && (
            <>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name_fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          <Select value={selectedPartner} onValueChange={setSelectedPartner}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Partenaire" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les partenaires</SelectItem>
              {partners.map(partner => (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation par onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Tableau de Bord</TabsTrigger>
          <TabsTrigger value="management">Gestion des Offres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Sous-onglets */}
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="rewards">Récompenses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Offres Actives</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRewards}</div>
                    <p className="text-xs text-muted-foreground">
                      sur {stats.totalRewards} total
                    </p>
                    <Progress value={100} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Récompenses</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
                    <p className="text-xs text-muted-foreground">total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">total généré</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageRating}</div>
                    <p className="text-xs text-muted-foreground">sur 5 étoiles</p>
                  </CardContent>
                </Card>
              </div>

              {/* Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Jours les plus actifs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Jours les Plus Actifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dailyStats.map((day, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{day.day} {day.redemptions} rédactions</span>
                          <span className="text-sm font-medium">{formatCurrency(day.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Heures les plus actives */}
                <Card>
                  <CardHeader>
                    <CardTitle>Heures les Plus Actives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hourlyStats.map((hour, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{hour.hour} {hour.redemptions} rédactions</span>
                          <span className="text-sm font-medium">{formatCurrency(hour.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Meilleures offres */}
              <Card>
                <CardHeader>
                  <CardTitle>Meilleures Offres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Offre</th>
                          <th className="text-left py-2">Points</th>
                          <th className="text-left py-2">Valeur</th>
                          <th className="text-left py-2">Rédactions</th>
                          <th className="text-left py-2">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topOffers.map((offer, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{offer.title}</td>
                            <td className="py-2">{offer.points}</td>
                            <td className="py-2">{formatCurrency(offer.value)}</td>
                            <td className="py-2">{offer.redemptions}</td>
                            <td className="py-2">
                              <Badge variant="default">{offer.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Récompenses</CardTitle>
                  <CardDescription>
                    Vue d'ensemble des récompenses de tous les partenaires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Interface de gestion des récompenses pour les administrateurs.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Avancés</CardTitle>
                  <CardDescription>
                    Analyses détaillées des performances des partenaires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Graphiques et analyses avancées pour les administrateurs.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Offres</CardTitle>
              <CardDescription>
                Interface de gestion des offres pour les administrateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface complète de gestion des offres adaptée aux administrateurs.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnersDashboard; 