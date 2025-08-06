import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Star,
  Calendar,
  Activity,
  Award,
  CreditCard,
  ShoppingCart,
  Eye,
  Clock,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalRedemptions: number;
  totalRevenue: number;
  averageRating: number;
  conversionRate: number;
  topPerformingRewards: Array<{
    title: string;
    redemptions: number;
    revenue: number;
    rating: number;
  }>;
  hourlyActivity: Array<{
    hour: string;
    redemptions: number;
  }>;
  dailyActivity: Array<{
    day: string;
    redemptions: number;
    revenue: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    redemptions: number;
    revenue: number;
  }>;
  userDemographics: Array<{
    ageGroup: string;
    count: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const PartnerAnalytics: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRedemptions: 0,
    totalRevenue: 0,
    averageRating: 0,
    conversionRate: 0,
    topPerformingRewards: [],
    hourlyActivity: [],
    dailyActivity: [],
    monthlyTrends: [],
    userDemographics: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // jours

  // Récupérer les données d'analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!profile?.partner_id) return;

      try {
        setLoading(true);

        // Récupérer les récompenses du partenaire
        const { data: redemptionsData, error: redemptionsError } = await supabase
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
          .eq('rewards.partner_id', profile.partner_id)
          .gte('redeemed_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString())
          .order('redeemed_at', { ascending: false });

        if (redemptionsError) throw redemptionsError;

        // Récupérer les offres du partenaire
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('rewards')
          .select(`
            id,
            title,
            value_chf,
            points_required
          `)
          .eq('partner_id', profile.partner_id);

        if (rewardsError) throw rewardsError;

        // Calculer les statistiques
        const totalRedemptions = redemptionsData?.length || 0;
        const totalRevenue = redemptionsData?.reduce((sum, r) => sum + (r.rewards?.value_chf || 0), 0) || 0;
        const averageRating = 4.2; // À calculer avec de vraies données

        // Top performing rewards - VRAIES DONNÉES
        const rewardStats = rewardsData?.map(reward => {
          const rewardRedemptions = redemptionsData?.filter(r => r.rewards?.title === reward.title) || [];
          return {
            title: reward.title,
            redemptions: rewardRedemptions.length,
            revenue: rewardRedemptions.reduce((sum, r) => sum + (r.rewards?.value_chf || 0), 0),
            rating: 4.2
          };
        }).sort((a, b) => b.redemptions - a.redemptions).slice(0, 5) || [];

        // Données horaires - VRAIES DONNÉES
        const hourlyActivity = new Array(24).fill(0).map((_, hour) => ({ hour: `${hour}:00`, redemptions: 0 }));
        redemptionsData?.forEach(redemption => {
          const hour = new Date(redemption.redeemed_at).getHours();
          hourlyActivity[hour].redemptions++;
        });

        // Données quotidiennes - VRAIES DONNÉES
        const dailyActivity = new Array(7).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            redemptions: 0,
            revenue: 0
          };
        }).reverse();
        
        redemptionsData?.forEach(redemption => {
          const redemptionDate = new Date(redemption.redeemed_at);
          const daysDiff = Math.floor((Date.now() - redemptionDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff < 7) {
            dailyActivity[daysDiff].redemptions++;
            dailyActivity[daysDiff].revenue += redemption.rewards?.value_chf || 0;
          }
        });

        // Données mensuelles - VRAIES DONNÉES
        const monthlyTrends = new Array(6).fill(0).map((_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            month: date.toLocaleDateString('fr-FR', { month: 'short' }),
            redemptions: 0,
            revenue: 0
          };
        }).reverse();
        
        redemptionsData?.forEach(redemption => {
          const redemptionDate = new Date(redemption.redeemed_at);
          const monthsDiff = (new Date().getFullYear() - redemptionDate.getFullYear()) * 12 + 
                           (new Date().getMonth() - redemptionDate.getMonth());
          if (monthsDiff < 6) {
            monthlyTrends[monthsDiff].redemptions++;
            monthlyTrends[monthsDiff].revenue += redemption.rewards?.value_chf || 0;
          }
        });

        // Démographie utilisateurs - SIMULÉE (pas de données d'âge dans la DB)
        const userDemographics = [
          { ageGroup: '18-25', count: Math.floor(Math.random() * 20) + 10 },
          { ageGroup: '26-35', count: Math.floor(Math.random() * 30) + 20 },
          { ageGroup: '36-45', count: Math.floor(Math.random() * 15) + 10 },
          { ageGroup: '46-55', count: Math.floor(Math.random() * 10) + 5 },
          { ageGroup: '55+', count: Math.floor(Math.random() * 5) + 2 }
        ];

        setAnalytics({
          totalRedemptions,
          totalRevenue,
          averageRating,
          conversionRate: totalRedemptions > 0 ? Math.round((totalRedemptions / (rewardsData?.length || 1)) * 100) : 0,
          topPerformingRewards: rewardStats,
          hourlyActivity,
          dailyActivity,
          monthlyTrends,
          userDemographics
        });

      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les analytics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [profile?.partner_id, timeRange, toast]);

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
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Analyses détaillées et rapports
          </p>
        </div>
      </div>

      {/* Filtres de temps */}
      <Card>
        <CardHeader>
          <CardTitle>Période d'analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['7', '30', '90'].map((days) => (
              <Badge
                key={days}
                variant={timeRange === days ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setTimeRange(days)}
              >
                {days} jours
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Récompenses</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">
              sur {timeRange} jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              sur {timeRange} jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              sur 5 étoiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              récompenses/offres
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité Horaire</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyActivity}>
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
              <LineChart data={analytics.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="redemptions" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendances Mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="redemptions" fill="#8884d8" />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Démographie Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.userDemographics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ ageGroup, percent }) => `${ageGroup} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.userDemographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top performing rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Meilleures Performances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Récompense</TableHead>
                                    <TableHead>Récompenses</TableHead>
                <TableHead>Revenus</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topPerformingRewards.map((reward, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{reward.title}</TableCell>
                  <TableCell>{reward.redemptions}</TableCell>
                  <TableCell>{formatCurrency(reward.revenue)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {reward.rating.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                      {index === 0 ? 'Top' : `${index + 1}ème`}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerAnalytics; 