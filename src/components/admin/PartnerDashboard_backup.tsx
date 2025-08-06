import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Gift, 
  Clock, 
  MapPin, 
  Calendar,
  BarChart3,
  Activity,
  Target,
  Award,
  Store,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PartnerAnalytics {
  totalVouchers: number;
  totalRedemptions: number;
  totalRevenue: number;
  averageRating: number;
  topOffers: Array<{
    name: string;
    redemptions: number;
    revenue: number;
  }>;
  recentRedemptions: Array<{
    id: string;
    voucherName: string;
    customerName: string;
    redeemedAt: string;
    amount: number;
    status: 'pending' | 'validated' | 'expired';
  }>;
  dailyStats: Array<{
    date: string;
    redemptions: number;
    revenue: number;
  }>;
  customerInsights: {
    totalCustomers: number;
    repeatCustomers: number;
    averageSpend: number;
    topCustomerSegments: string[];
  };
  journeyInsights: {
    totalJourneys: number;
    completedJourneys: number;
    averageCompletionRate: number;
    popularJourneys: Array<{
      name: string;
      completions: number;
      averageRating: number;
    }>;
  };
}

interface PartnerFilter {
  countryId?: string;
  cityId?: string;
  partnerId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

const PartnerDashboard: React.FC = () => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<PartnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PartnerFilter>({});
  const [countries, setCountries] = useState<Array<{ id: string; name: string }>>([]);
  const [cities, setCities] = useState<Array<{ id: string; name: string; country_id: string }>>([]);
  const [partners, setPartners] = useState<Array<{ id: string; name: string; city_id: string }>>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('');

  const isSuperAdmin = user?.user_metadata?.role === 'super_admin';
  const isCityAdmin = user?.user_metadata?.role === 'tenant_admin';
  const isPartner = user?.user_metadata?.role === 'partner';

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    if (partners.length > 0) {
      // Si c'est un partenaire, utiliser le premier partenaire disponible
      if (isPartner && !selectedPartner) {
        setSelectedPartner(partners[0]?.id || '');
      }
      // Si c'est un admin ville et qu'aucun partenaire n'est sélectionné, en sélectionner un automatiquement
      else if (isCityAdmin && !selectedPartner) {
        const userCityPartner = partners.find(p => p.city_id === user?.user_metadata?.city_id);
        if (userCityPartner) {
          setSelectedPartner(userCityPartner.id);
        } else {
          setSelectedPartner(partners[0]?.id || '');
        }
      }
      // Si c'est un super admin et qu'aucun partenaire n'est sélectionné, en sélectionner un
      else if (isSuperAdmin && !selectedPartner) {
        setSelectedPartner(partners[0]?.id || '');
      }
    }
  }, [partners, isPartner, isCityAdmin, isSuperAdmin, selectedPartner, user?.user_metadata?.city_id]);

  useEffect(() => {
    if (selectedPartner) {
      fetchPartnerAnalytics();
    }
  }, [selectedPartner, filter]);

  const fetchFilterData = async () => {
    try {
      // Mock data pour l'instant
      const mockCountries = [
        { id: '1', name: 'Suisse' },
        { id: '2', name: 'France' }
      ];
      
      const mockCities = [
        { id: '1', name: 'Sion', country_id: '1' },
        { id: '2', name: 'Martigny', country_id: '1' },
        { id: '3', name: 'Carcassonne', country_id: '2' }
      ];
      
      const mockPartners = [
        { id: '1', name: 'Restaurant Le Verre à Pied', city_id: '1' },
        { id: '2', name: 'Café Central', city_id: '1' },
        { id: '3', name: 'Boulangerie Artisanale', city_id: '2' }
      ];

      setCountries(mockCountries);
      setCities(mockCities);
      setPartners(mockPartners);
    } catch (error) {
    }
  };

  const fetchPartnerAnalytics = async () => {
    if (!selectedPartner) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Simuler des données dynamiques basées sur le partenaire
      const mockAnalytics: PartnerAnalytics = {
        totalVouchers: Math.floor(Math.random() * 100) + 50,
        totalRedemptions: Math.floor(Math.random() * 80) + 30,
        totalRevenue: Math.floor(Math.random() * 5000) + 2000,
        averageRating: Number((Math.random() * 2 + 3).toFixed(1)),
        topOffers: [
          { name: 'Menu Dégustation', redemptions: 25, revenue: 1250 },
          { name: 'Cours de Cuisine', redemptions: 18, revenue: 900 },
          { name: 'Dégustation Vins', redemptions: 15, revenue: 750 },
        ],
        recentRedemptions: [
          {
            id: '1',
            voucherName: 'Menu Dégustation',
            customerName: 'Marie Dupont',
            redeemedAt: '2025-01-15 14:30',
            amount: 50,
            status: 'validated'
          },
          {
            id: '2',
            voucherName: 'Cours de Cuisine',
            customerName: 'Jean Martin',
            redeemedAt: '2025-01-14 16:45',
            amount: 45,
            status: 'pending'
          },
          {
            id: '3',
            voucherName: 'Dégustation Vins',
            customerName: 'Sophie Bernard',
            redeemedAt: '2025-01-13 19:20',
            amount: 35,
            status: 'validated'
          }
        ],
        dailyStats: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          redemptions: Math.floor(Math.random() * 10) + 1,
          revenue: Math.floor(Math.random() * 500) + 100
        })).reverse(),
        customerInsights: {
          totalCustomers: Math.floor(Math.random() * 200) + 100,
          repeatCustomers: Math.floor(Math.random() * 50) + 20,
          averageSpend: Math.floor(Math.random() * 50) + 30,
          topCustomerSegments: ['Touristes', 'Locaux', 'Groupes']
        },
        journeyInsights: {
          totalJourneys: Math.floor(Math.random() * 20) + 10,
          completedJourneys: Math.floor(Math.random() * 15) + 8,
          averageCompletionRate: Math.floor(Math.random() * 30) + 70,
          popularJourneys: [
            { name: 'Découverte Gastronomique', completions: 45, averageRating: 4.2 },
            { name: 'Circuit Historique', completions: 38, averageRating: 4.5 },
            { name: 'Balade Culturelle', completions: 32, averageRating: 4.1 }
          ]
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du partenaire.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      validated: 'default',
      expired: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status === 'pending' ? 'En attente' : 
         status === 'validated' ? 'Validé' : 'Expiré'}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord Partenaire</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? 'Analytics et insights des partenaires' : 'Vos performances et analytics'}
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {isSuperAdmin && (
            <>
              <Select
                value={filter.countryId || ''}
                onValueChange={(value) => setFilter(prev => ({ ...prev, countryId: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sélectionner un pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les pays</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filter.cityId || ''}
                onValueChange={(value) => setFilter(prev => ({ ...prev, cityId: value }))}
                disabled={!filter.countryId}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les villes</SelectItem>
                  {cities
                    .filter(city => !filter.countryId || city.country_id === filter.countryId)
                    .map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </>
          )}

          <Select
            value={selectedPartner}
            onValueChange={setSelectedPartner}
            disabled={isCityAdmin || isPartner}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={isCityAdmin || isPartner ? "Partenaire automatique" : "Sélectionner un partenaire"} />
            </SelectTrigger>
            <SelectContent>
              {partners
                .filter(partner => !filter.cityId || partner.city_id === filter.cityId)
                .map(partner => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!analytics ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              {isSuperAdmin ? 'Sélectionnez un partenaire pour voir ses analytics' : 'Aucune donnée disponible'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalVouchers}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(Math.random() * 20) + 5}% ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rédemptions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalRedemptions}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(Math.random() * 15) + 3}% ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(Math.random() * 25) + 8}% ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.averageRating}/5</div>
                <p className="text-xs text-muted-foreground">
                  Basé sur {Math.floor(Math.random() * 50) + 20} avis
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs pour les détails */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="redemptions">Rédemptions récentes</TabsTrigger>
              <TabsTrigger value="offers">Meilleures offres</TabsTrigger>
              <TabsTrigger value="customers">Insights clients</TabsTrigger>
              <TabsTrigger value="journeys">Parcours liés</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Activité quotidienne */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activité quotidienne</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.dailyStats.map((stat, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{stat.date}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm">{stat.redemptions} rédemptions</span>
                            <span className="text-sm font-medium">{formatCurrency(stat.revenue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance des offres */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance des offres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topOffers.map((offer, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{offer.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {offer.redemptions} rédemptions
                            </span>
                          </div>
                          <Progress value={(offer.redemptions / analytics.totalRedemptions) * 100} />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatCurrency(offer.revenue)}</span>
                            <span>{((offer.redemptions / analytics.totalRedemptions) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="redemptions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rédemptions récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Voucher</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.recentRedemptions.map((redemption) => (
                        <TableRow key={redemption.id}>
                          <TableCell className="font-medium">{redemption.voucherName}</TableCell>
                          <TableCell>{redemption.customerName}</TableCell>
                          <TableCell>{redemption.redeemedAt}</TableCell>
                          <TableCell>{formatCurrency(redemption.amount)}</TableCell>
                          <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Meilleures offres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topOffers.map((offer, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{offer.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {offer.redemptions} rédemptions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(offer.revenue)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(offer.revenue / offer.redemptions)} en moyenne
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Insights clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Total clients</span>
                        <span className="font-medium">{analytics.customerInsights.totalCustomers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Clients fidèles</span>
                        <span className="font-medium">{analytics.customerInsights.repeatCustomers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Dépense moyenne</span>
                        <span className="font-medium">{formatCurrency(analytics.customerInsights.averageSpend)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Segments clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.customerInsights.topCustomerSegments.map((segment, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{segment}</span>
                          <Badge variant="secondary">
                            {Math.floor(Math.random() * 40) + 20}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="journeys" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parcours populaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.journeyInsights.popularJourneys.map((journey, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{journey.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {journey.completions} complétions
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{journey.averageRating}/5</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < Math.floor(journey.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default PartnerDashboard; 