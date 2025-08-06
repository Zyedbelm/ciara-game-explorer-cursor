import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PartnerDashboardLayout from './PartnerDashboardLayout';
import { 
  TrendingUp, 
  Gift,
  Users, 
  Star,
  Calendar,
  Activity,
  Award,
  CreditCard,
  ShoppingCart,
  Eye,
  Clock,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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
  reward: {
    title: string;
    value_chf: number;
  };
  user: {
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
  average_rating: number;
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
  const [activeTab, setActiveTab] = useState('overview');

  // Récupérer les données du partenaire
  useEffect(() => {
    const fetchPartnerData = async () => {
      if (!profile?.partner_id) return;

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
          .eq('id', profile.partner_id)
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
          .eq('partner_id', profile.partner_id);

        if (offersError) throw offersError;

        // Récupérer les rédactions
        const { data: redemptionsData, error: redemptionsError } = await supabase
          .from('reward_redemptions')
          .select(`
            id,
            redeemed_at,
            points_spent,
            status,
            rewards(
              title,
              value_chf
            ),
            profiles(
              full_name,
              email
            )
          `)
          .eq('rewards.partner_id', profile.partner_id)
          .order('redeemed_at', { ascending: false });

        if (redemptionsError) throw redemptionsError;

        // Calculer les statistiques
        const totalOffers = offersData?.length || 0;
        const activeOffers = offersData?.filter(o => o.is_active).length || 0;
        const totalRedemptions = redemptionsData?.length || 0;
        const totalRevenue = redemptionsData?.reduce((sum, r) => sum + (r.rewards?.value_chf || 0), 0) || 0;

        setStats({
          totalOffers,
          activeOffers,
          totalRedemptions,
          totalRevenue,
          averageRating: 4.2, // À calculer avec de vraies données
          partnerName: partnerData?.name || '',
          partnerCity: partnerData?.cities?.name || ''
        });

        setOffers(offersData || []);
        setRedemptions(redemptionsData || []);

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
  }, [profile?.partner_id, toast]);

  // Données pour les graphiques
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      hour: `${hour}:00`,
      redemptions: Math.floor(Math.random() * 5) + 1
    }));
  }, []);

  const dailyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    }).reverse();
    
    return days.map(day => ({
      day,
      redemptions: Math.floor(Math.random() * 10) + 1
    }));
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  if (loading) {
    return (
      <PartnerDashboardLayout title="Tableau de Bord Partenaire">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PartnerDashboardLayout>
    );
  }

  return (
    <PartnerDashboardLayout 
      title="Tableau de Bord Partenaire"
      subtitle={`${stats.partnerName} - ${stats.partnerCity}`}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="redemptions">Rédactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offres Actives</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeOffers}</div>
                <p className="text-xs text-muted-foreground">
                  sur {stats.totalOffers} total
                </p>
                <Progress value={(stats.activeOffers / stats.totalOffers) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rédactions</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
                <p className="text-xs text-muted-foreground">
                  ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
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
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  sur 5 étoiles
                </p>
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
                    <TableHead>Note</TableHead>
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
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          {offer.average_rating?.toFixed(1) || 'N/A'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rédactions Récentes</CardTitle>
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
                      <TableCell>{redemption.user?.full_name || 'Anonyme'}</TableCell>
                      <TableCell>{redemption.reward?.title}</TableCell>
                      <TableCell>{redemption.points_spent}</TableCell>
                      <TableCell>{formatCurrency(redemption.reward?.value_chf || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={redemption.status === 'pending' ? 'secondary' : 'default'}>
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

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PartnerDashboardLayout>
  );
};

export default PartnerDashboardNew; 