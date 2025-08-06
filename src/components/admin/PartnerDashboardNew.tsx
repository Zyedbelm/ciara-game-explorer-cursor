import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface PartnerStats {
  totalOffers: number;
  activeOffers: number;
  totalRedemptions: number;
  totalRevenue: number;
  averageRating: number;
  partnerName: string;
  partnerCity: string;
}

interface RedemptionData {
  id: string;
  redeemed_at: string;
  points_spent: number;
  status: string;
  reward_id: string;
  user_id: string;
  rewards: {
    title: string;
    value_chf: number;
    partner_id: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

interface OfferData {
  id: string;
  title: string;
  points_required: number;
  value_chf: number;
  is_active: boolean;
  total_redemptions: number;
  average_rating?: number;
}

const PartnerDashboardNew: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<PartnerStats>({
    totalOffers: 0,
    activeOffers: 0,
    totalRedemptions: 0,
    totalRevenue: 0,
    averageRating: 0,
    partnerName: '',
    partnerCity: ''
  });
  const [redemptions, setRedemptions] = useState<RedemptionData[]>([]);
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Récupérer les données du partenaire
  useEffect(() => {
    const fetchPartnerData = async () => {
      if (!profile || !(profile as any).partner_id) return;

      try {
        setLoading(true);

        // Récupérer les informations du partenaire
        const { data: partnerData, error: partnerError } = await supabase
          .from('partners')
          .select(`
            id,
            name,
            cities(name)
          `)
          .eq('id', (profile as any).partner_id)
          .single();

        if (partnerError) throw partnerError;

        // Récupérer les offres du partenaire
        const { data: offersData, error: offersError } = await supabase
          .from('rewards')
          .select(`
            id,
            title,
            points_required,
            value_chf,
            is_active
          `)
          .eq('partner_id', (profile as any).partner_id);

        if (offersError) throw offersError;

        // Récupérer les rédactions
        const { data: redemptionsData, error: redemptionsError } = await supabase
          .from('reward_redemptions')
          .select(`
            id,
            redeemed_at,
            points_spent,
            status,
            reward_id,
            user_id
          `)
          .order('redeemed_at', { ascending: false });

        if (redemptionsError) throw redemptionsError;

        // Récupérer les détails des récompenses pour les rédactions
        const rewardIds = [...new Set(redemptionsData?.map(r => r.reward_id) || [])];
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('rewards')
          .select('id, title, value_chf, partner_id')
          .in('id', rewardIds)
          .eq('partner_id', (profile as any).partner_id);

        if (rewardsError) throw rewardsError;

        // Combiner les données
        const enrichedRedemptions = redemptionsData?.map(redemption => {
          const reward = rewardsData?.find(r => r.id === redemption.reward_id);
          return {
            ...redemption,
            rewards: reward || { title: 'Offre supprimée', value_chf: 0, partner_id: '' },
            profiles: { full_name: 'Utilisateur', email: 'user@example.com' }
          };
        }) || [];

        // Calculer les statistiques
        const totalOffers = offersData?.length || 0;
        const activeOffers = offersData?.filter(o => o.is_active).length || 0;
        const totalRedemptions = enrichedRedemptions?.length || 0;
        const totalRevenue = enrichedRedemptions?.reduce((sum, r) => sum + (r.rewards?.value_chf || 0), 0) || 0;

        // Calculer les rédactions par offre
        const offersWithStats = offersData?.map(offer => {
          const offerRedemptions = enrichedRedemptions?.filter(r => r.reward_id === offer.id) || [];
          return {
            ...offer,
            total_redemptions: offerRedemptions.length
          };
        }) || [];

        setStats({
          totalOffers,
          activeOffers,
          totalRedemptions,
          totalRevenue,
          averageRating: 4.2, // À calculer avec de vraies données
          partnerName: partnerData?.name || '',
          partnerCity: partnerData?.cities?.name || ''
        });

        setOffers(offersWithStats || []);
        setRedemptions(enrichedRedemptions || []);

        // Debug pour voir les données
        console.log('Partner Data:', {
          partnerId: (profile as any).partner_id,
          partnerData,
          offersData: offersData?.length,
          redemptionsData: enrichedRedemptions?.length,
          stats: {
            totalOffers,
            activeOffers,
            totalRedemptions,
            totalRevenue
          }
        });

      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du partenaire",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerData();
  }, [(profile as any)?.partner_id, toast]);

  // Données pour les graphiques - VRAIES DONNÉES
  const hourlyData = useMemo(() => {
    if (!redemptions.length) return [];
    
    const hourlyStats = new Array(24).fill(0).map((_, hour) => ({ hour: `${hour}:00`, redemptions: 0 }));
    
    redemptions.forEach(redemption => {
      const hour = new Date(redemption.redeemed_at).getHours();
      hourlyStats[hour].redemptions++;
    });
    
    return hourlyStats;
  }, [redemptions]);

  // Jours les plus actifs - VRAIES DONNÉES
  const mostActiveDays = useMemo(() => {
    if (!redemptions.length) return [];
    
    const dayStats = new Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        day: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        date: date.toISOString().split('T')[0],
        redemptions: 0,
        revenue: 0
      };
    });
    
    redemptions.forEach(redemption => {
      const redemptionDate = new Date(redemption.redeemed_at);
      const daysDiff = Math.floor((Date.now() - redemptionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        dayStats[daysDiff].redemptions++;
        dayStats[daysDiff].revenue += redemption.rewards?.value_chf || 0;
      }
    });
    
    return dayStats.sort((a, b) => b.redemptions - a.redemptions).slice(0, 3);
  }, [redemptions]);

  // Heures les plus actives - VRAIES DONNÉES
  const mostActiveHours = useMemo(() => {
    if (!redemptions.length) return [];
    
    const hourlyStats = new Array(24).fill(0).map((_, hour) => ({ 
      hour: `${hour}:00`, 
      redemptions: 0,
      revenue: 0
    }));
    
    redemptions.forEach(redemption => {
      const hour = new Date(redemption.redeemed_at).getHours();
      hourlyStats[hour].redemptions++;
      hourlyStats[hour].revenue += redemption.rewards?.value_chf || 0;
    });
    
    return hourlyStats.sort((a, b) => b.redemptions - a.redemptions).slice(0, 5);
  }, [redemptions]);

  const dailyData = useMemo(() => {
    if (!redemptions.length) return [];
    
    const dailyStats = new Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        redemptions: 0,
        revenue: 0
      };
    }).reverse();
    
    redemptions.forEach(redemption => {
      const redemptionDate = new Date(redemption.redeemed_at);
      const daysDiff = Math.floor((Date.now() - redemptionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        dailyStats[daysDiff].redemptions++;
        dailyStats[daysDiff].revenue += redemption.rewards?.value_chf || 0;
      }
    });
    
    return dailyStats;
  }, [redemptions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec nom du partenaire */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Tableau de Bord Partenaire</h1>
        <p className="text-muted-foreground">
          {stats.partnerName} - {stats.partnerCity}
        </p>
      </div>

      {/* Navigation par onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
          <TabsTrigger value="offers">Gestion des Offres</TabsTrigger>
        </TabsList>

        {/* Onglet Tableau de Bord */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Sous-onglets pour le tableau de bord */}
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="rewards">Récompenses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPIs */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Offres Actives</CardTitle>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeOffers}</div>
                    <p className="text-xs text-muted-foreground">
                      sur {stats.totalOffers} total
                    </p>
                    <Progress value={(stats.activeOffers / Math.max(stats.totalOffers, 1)) * 100} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Récompenses</CardTitle>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
                    <p className="text-xs text-muted-foreground">
                      total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      total généré
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">
                      sur 5 étoiles
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Métriques d'activité */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Jours les plus actifs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Jours les Plus Actifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mostActiveDays.length > 0 ? (
                      <div className="space-y-3">
                        {mostActiveDays.map((day, index) => (
                          <div key={day.date} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{day.day}</span>
                              <Badge variant="outline">{day.redemptions} rédactions</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(day.revenue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                    )}
                  </CardContent>
                </Card>

                {/* Heures les plus actives */}
                <Card>
                  <CardHeader>
                    <CardTitle>Heures les Plus Actives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mostActiveHours.length > 0 ? (
                      <div className="space-y-3">
                        {mostActiveHours.map((hour, index) => (
                          <div key={hour.hour} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{hour.hour}</span>
                              <Badge variant="outline">{hour.redemptions} rédactions</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(hour.revenue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Meilleures offres */}
              <Card>
                <CardHeader>
                  <CardTitle>Meilleures Offres</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Offre</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Valeur</TableHead>
                        <TableHead>Rédactions</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.slice(0, 5).map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell className="font-medium">{offer.title}</TableCell>
                          <TableCell>{offer.points_required}</TableCell>
                          <TableCell>{formatCurrency(offer.value_chf)}</TableCell>
                          <TableCell>{offer.total_redemptions || 0}</TableCell>
                          <TableCell>
                            <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                              {offer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Récompenses */}
            <TabsContent value="rewards" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des Récompenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Offre</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Valeur</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {redemptions.slice(0, 10).map((redemption) => (
                        <TableRow key={redemption.id}>
                          <TableCell>
                            {new Date(redemption.redeemed_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>{redemption.profiles?.full_name || 'Anonyme'}</TableCell>
                          <TableCell>{redemption.rewards?.title || 'Offre supprimée'}</TableCell>
                          <TableCell>{redemption.points_spent}</TableCell>
                          <TableCell>{formatCurrency(redemption.rewards?.value_chf || 0)}</TableCell>
                          <TableCell>
                            <Badge variant={redemption.status === 'completed' ? 'default' : 'secondary'}>
                              {redemption.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité Horaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="redemptions" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activité Quotidienne</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="redemptions" stroke="#8884d8" />
                        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Onglet Gestion des Offres */}
        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Offres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Vos Offres</h3>
                <Button>Nouvelle Offre</Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Points Requis</TableHead>
                    <TableHead>Valeur CHF</TableHead>
                    <TableHead>Rédactions</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell>{offer.points_required}</TableCell>
                      <TableCell>{formatCurrency(offer.value_chf)}</TableCell>
                      <TableCell>{offer.total_redemptions || 0}</TableCell>
                      <TableCell>
                        <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                          {offer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Modifier</Button>
                          <Button variant="outline" size="sm">Supprimer</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerDashboardNew; 