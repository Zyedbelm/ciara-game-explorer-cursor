import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2,
  TrendingUp, 
  Users, 
  Star,
  Calendar,
  Activity,
  Award,
  CreditCard,
  ShoppingCart,
  Eye,
  Filter,
  Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Types optimisés
interface PartnerAnalytics {
  totalPartners: number;
  totalOffers: number;
  totalRedemptions: number;
  totalValue: number;
  averageRating: number;
  topPartners: Array<{
    id: string;
    name: string;
    redemptions: number;
    value: number;
  }>;
}

interface PartnerFilter {
  country: string;
  city: string;
  partner: string;
}

interface Country {
  id: string;
  name_fr: string;
  is_active: boolean;
}

interface City {
  id: string;
  name: string;
  country_id: string;
}

interface Partner {
  id: string;
  name: string;
  city_id: string;
  cities?: {
    name: string;
    country_id: string;
  };
}

interface RedemptionDetail {
  id: string;
  redeemed_at: string;
  points_spent: number;
  status: string;
  rewards: {
    title: string;
    value_chf: number;
    partner_id: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
  partners?: {
    name: string;
  };
}

// Hook personnalisé pour les données du dashboard
const usePartnerDashboardData = () => {
  const [analytics, setAnalytics] = useState<PartnerAnalytics>({
    totalPartners: 0,
    totalOffers: 0,
    totalRedemptions: 0,
    totalValue: 0,
    averageRating: 0,
    topPartners: []
  });
  
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [redemptionDetails, setRedemptionDetails] = useState<RedemptionDetail[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);

  const fetchFilterData = useCallback(async () => {
    setLoading(true);
    try {
      // Requêtes parallèles pour optimiser les performances
      const [countriesResponse, citiesResponse, partnersResponse] = await Promise.all([
        supabase
          .from('countries')
          .select('id, name_fr, is_active')
          .eq('is_active', true)
          .order('name_fr'),
        
        supabase
          .from('cities')
          .select(`
            id, 
            name, 
            country_id,
            countries!inner(id, is_active)
          `)
          .eq('countries.is_active', true)
          .order('name'),
        
        supabase
          .from('partners')
          .select(`
            id, 
            name, 
            city_id,
            cities(name, country_id)
          `)
          .eq('is_active', true)
      ]);

      setCountries(countriesResponse.data || []);
      setCities(citiesResponse.data || []);
      setPartners(partnersResponse.data || []);
      setFilteredPartners(partnersResponse.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (filters?: PartnerFilter) => {
    try {
      let partnersQuery = supabase
        .from('partners')
        .select(`
          id,
          name,
          city_id,
          cities(name, country_id),
          rewards(
            id,
            value_chf
          )
        `)
        .eq('is_active', true);

      // Appliquer les filtres
      if (filters) {
        if (filters.country && filters.country !== 'all') {
          partnersQuery = partnersQuery.eq('cities.country_id', filters.country);
        }
        if (filters.city && filters.city !== 'all') {
          partnersQuery = partnersQuery.eq('city_id', filters.city);
        }
        if (filters.partner && filters.partner !== 'all') {
          partnersQuery = partnersQuery.eq('id', filters.partner);
        }
      }

      const [partnersResponse, redemptionsResponse] = await Promise.all([
        partnersQuery,
        
        supabase
          .from('reward_redemptions')
          .select(`
            id,
            points_spent,
            rewards(
              partner_id,
              value_chf
            )
          `)
      ]);

      const partnersData = partnersResponse.data || [];
      const redemptionsData = redemptionsResponse.data || [];

      // Calculer les statistiques
      const totalPartners = partnersData.length;
      const totalOffers = partnersData.reduce((sum, p) => sum + (p.rewards?.length || 0), 0);
      const totalRedemptions = redemptionsData.length;
      const totalValue = redemptionsData.reduce((sum, r) => sum + (r.rewards?.value_chf || 0), 0);

      // Top 3 partenaires
      const partnerStats = partnersData.map(partner => {
        const partnerRedemptions = redemptionsData.filter(r => 
          r.rewards?.partner_id === partner.id
        );
        
        return {
          id: partner.id,
          name: partner.name,
          redemptions: partnerRedemptions.length,
          value: partnerRedemptions.reduce((sum, r) => sum + (r.rewards?.value_chf || 0), 0)
        };
      });

      const topPartners = partnerStats
        .sort((a, b) => b.redemptions - a.redemptions)
        .slice(0, 3);

      setAnalytics({
        totalPartners,
        totalOffers,
        totalRedemptions,
        totalValue,
        averageRating: 4.5,
        topPartners
      });
    } catch (error) {
    }
  }, []);

  const fetchPartnerData = useCallback(async (partnerId: string) => {
    try {
      const { data: redemptionsData } = await supabase
        .from('reward_redemptions')
        .select(`
          id,
          redeemed_at,
          points_spent,
          status,
          rewards(
            title,
            value_chf,
            partner_id
          )
        `)
        .eq('rewards.partner_id', partnerId)
        .order('redeemed_at', { ascending: false });

      // Transformer les données pour correspondre à l'interface
      const transformedData = (redemptionsData || []).map(item => ({
        ...item,
        profiles: { full_name: 'N/A', email: 'N/A' },
        partners: { name: 'N/A' }
      }));

      setRedemptionDetails(transformedData);
    } catch (error) {
    }
  }, []);

  const applyFilters = useCallback((filters: PartnerFilter) => {
    let filtered = [...partners];

    if (filters.country && filters.country !== 'all') {
      filtered = filtered.filter(partner => 
        partner.cities?.country_id === filters.country
      );
    }

    if (filters.city && filters.city !== 'all') {
      filtered = filtered.filter(partner => 
        partner.city_id === filters.city
      );
    }

    if (filters.partner && filters.partner !== 'all') {
      filtered = filtered.filter(partner => 
        partner.id === filters.partner
      );
    }

    setFilteredPartners(filtered);
  }, [partners]);

  return {
    analytics,
    loading,
    countries,
    cities,
    partners: filteredPartners,
    redemptionDetails,
    fetchFilterData,
    fetchAnalytics,
    fetchPartnerData,
    applyFilters
  };
};

const PartnerDashboard: React.FC = () => {
  const { user, profile, isPartner, isSuperAdmin, isTenantAdmin } = useAuth();
  const { toast } = useToast();
  
  const {
    analytics,
    loading,
    countries,
    cities,
    partners,
    redemptionDetails,
    fetchFilterData,
    fetchAnalytics,
    fetchPartnerData,
    applyFilters
  } = usePartnerDashboardData();

  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [filterStates, setFilterStates] = useState<PartnerFilter>({
    country: 'all',
    city: 'all',
    partner: 'all'
  });
  const [userPartnerId, setUserPartnerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('insights');

  // Déterminer l'ID du partenaire de l'utilisateur connecté
  useEffect(() => {
    if (isPartner() && (profile as any)?.partner_id) {
      setUserPartnerId((profile as any).partner_id);
      setFilterStates({
        country: 'locked',
        city: 'locked',
        partner: (profile as any).partner_id
      });
    }
  }, [isPartner, profile]);

  // Charger les données de base
  useEffect(() => {
    fetchFilterData();
    fetchAnalytics();
  }, [fetchFilterData, fetchAnalytics]);

  // Charger les données du partenaire sélectionné
  useEffect(() => {
    if (selectedPartner) {
      fetchPartnerData(selectedPartner);
    }
  }, [selectedPartner, fetchPartnerData]);

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    applyFilters(filterStates);
    fetchAnalytics(filterStates);
  }, [filterStates, applyFilters, fetchAnalytics]);

  // Données pour les graphiques (mémorisées pour éviter les recalculs)
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      hour: `${hour}:00`,
      count: Math.floor(Math.random() * 10) // À remplacer par de vraies données
    }));
  }, []);

  const dailyData = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    return days.map(date => ({
      date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      count: Math.floor(Math.random() * 20) // À remplacer par de vraies données
    }));
  }, []);

  const handleFilterChange = useCallback((filterType: keyof PartnerFilter, value: string) => {
    if (isPartner()) return; // Les filtres sont bloqués pour les partenaires
    
    setFilterStates(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, [isPartner]);

  const isPartnerDisabled = isPartner();

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Partenaire</h1>
          <p className="text-muted-foreground">
            Analysez les performances de vos partenaires
          </p>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Pays</Label>
              <Select
                value={filterStates.country} 
                onValueChange={(value) => handleFilterChange('country', value)}
                disabled={isPartnerDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un pays" />
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
            </div>

            <div>
              <Label>Ville</Label>
              <Select
                value={filterStates.city} 
                onValueChange={(value) => handleFilterChange('city', value)}
                disabled={isPartnerDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {cities
                    .filter(city => filterStates.country === 'all' || city.country_id === filterStates.country)
                    .map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Partenaire</Label>
              <Select
                value={filterStates.partner} 
                onValueChange={(value) => {
                  handleFilterChange('partner', value);
                  setSelectedPartner(value === 'all' ? '' : value);
                }}
                disabled={isPartnerDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un partenaire" />
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
        </CardContent>
      </Card>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Partenaires</p>
                <p className="text-2xl font-bold">{analytics.totalPartners}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offres</p>
                <p className="text-2xl font-bold">{analytics.totalOffers}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rédemptions</p>
                <p className="text-2xl font-bold">{analytics.totalRedemptions}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valeur Totale</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.totalValue)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de contenu */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Aperçu</TabsTrigger>
          <TabsTrigger value="partners">Partenaires</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>

        {/* Onglet Aperçu */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Graphique horaire */}
            <Card>
              <CardHeader>
                <CardTitle>Activité Horaire</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Graphique quotidien */}
            <Card>
              <CardHeader>
                <CardTitle>Activité Quotidienne</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top partenaires */}
          <Card>
            <CardHeader>
              <CardTitle>Top 3 Partenaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPartners.map((partner, index) => (
                  <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {partner.redemptions} rédemptions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(partner.value)}</p>
                      <p className="text-sm text-muted-foreground">Valeur totale</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Partenaires */}
        <TabsContent value="partners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Partenaires</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Offres</TableHead>
                    <TableHead>Rédemptions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{partner.cities?.name || 'N/A'}</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPartner(partner.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Détail des Offres */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Détails des Rédemptions</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filtres pour le tableau */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Date de début</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Date de fin</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Utilisateur</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Rechercher un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tableau des rédemptions */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Offre</TableHead>
                      <TableHead>Partenaire</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptionDetails.map((redemption) => (
                      <TableRow key={redemption.id}>
                        <TableCell>
                          {new Date(redemption.redeemed_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {redemption.profiles?.full_name || 'N/A'}
                          <br />
                          <span className="text-sm text-muted-foreground">
                            {redemption.profiles?.email || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {redemption.rewards?.title || 'N/A'}
                          <br />
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(redemption.rewards?.value_chf || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {redemption.partners?.name || 'N/A'}
                        </TableCell>
                        <TableCell>{redemption.points_spent}</TableCell>
                        <TableCell>
                          <Badge variant={redemption.status === 'used' ? 'default' : 'secondary'}>
                            {redemption.status === 'used' ? 'Utilisé' : 'En attente'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerDashboard; 