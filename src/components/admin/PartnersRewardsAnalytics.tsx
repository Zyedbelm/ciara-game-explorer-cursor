import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Building,
  ShoppingBag,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Clock
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
    };
  };
  is_active: boolean;
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

interface PartnersRewardsAnalyticsProps {
  partners: PartnerData[];
  stats: DashboardStats;
  dailyStats: DailyStats[];
  hourlyStats: HourlyStats[];
  topOffers: TopOffer[];
}

const PartnersRewardsAnalytics = ({
  partners,
  stats,
  dailyStats,
  hourlyStats,
  topOffers
}: PartnersRewardsAnalyticsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const calculateAverageRedemptionsPerPartner = () => {
    if (stats.totalPartners === 0) return 0;
    return (stats.totalRedemptions / stats.totalPartners).toFixed(1);
  };

  const calculateAverageRevenuePerPartner = () => {
    if (stats.totalPartners === 0) return 0;
    return (stats.totalRevenue / stats.totalPartners).toFixed(2);
  };

  const getTopPerformingPartners = () => {
    // Simuler les meilleurs partenaires (à remplacer par vraies données)
    return partners.slice(0, 5).map((partner, index) => ({
      name: partner.name,
      redemptions: Math.floor(Math.random() * 20) + 1,
      revenue: Math.floor(Math.random() * 100) + 10,
      category: partner.category
    }));
  };

  return (
    <div className="space-y-6">
      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Activation</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPartners > 0 ? Math.round((stats.activePartners / stats.totalPartners) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activePartners} sur {stats.totalPartners} partenaires
            </p>
            <Progress 
              value={stats.totalPartners > 0 ? (stats.activePartners / stats.totalPartners) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Récompenses/Partenaires</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateAverageRedemptionsPerPartner()}</div>
            <p className="text-xs text-muted-foreground">
              moyenne par partenaire
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus/Partenaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(parseFloat(calculateAverageRevenuePerPartner()))}</div>
            <p className="text-xs text-muted-foreground">
              moyenne par partenaire
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRewards > 0 ? Math.round((stats.totalRedemptions / stats.totalRewards) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              récompenses vs offres créées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Meilleurs partenaires */}
      <Card>
        <CardHeader>
          <CardTitle>Meilleurs Partenaires</CardTitle>
          <CardDescription>
            Top 5 des partenaires par performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partenaire</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Récompenses</TableHead>
                  <TableHead>Revenus</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getTopPerformingPartners().map((partner, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{partner.category}</Badge>
                    </TableCell>
                    <TableCell>{partner.redemptions}</TableCell>
                    <TableCell>{formatCurrency(partner.revenue)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Progress 
                          value={(partner.revenue / 100) * 100} 
                          className="w-20 mr-2" 
                        />
                        <span className="text-sm text-muted-foreground">
                          {Math.round((partner.revenue / 100) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Graphiques détaillés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jours les plus actifs - Version détaillée */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Quotidienne</CardTitle>
            <CardDescription>
              Récompenses et revenus par jour de la semaine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyStats.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{day.day}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{day.redemptions} récompenses</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(day.revenue)}</div>
                    </div>
                    <Progress 
                      value={day.redemptions > 0 ? (day.redemptions / Math.max(...dailyStats.map(d => d.redemptions))) * 100 : 0} 
                      className="w-20" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Heures les plus actives - Version détaillée */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Horaire</CardTitle>
            <CardDescription>
              Top 5 des heures les plus actives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hourlyStats.map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{hour.hour}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{hour.redemptions} récompenses</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(hour.revenue)}</div>
                    </div>
                    <Progress 
                      value={hour.redemptions > 0 ? (hour.redemptions / Math.max(...hourlyStats.map(h => h.redemptions))) * 100 : 0} 
                      className="w-20" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meilleures offres - Version détaillée */}
      <Card>
        <CardHeader>
          <CardTitle>Meilleures Offres</CardTitle>
          <CardDescription>
            Top 5 des offres les plus populaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offre</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Récompenses</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topOffers.map((offer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{offer.title}</TableCell>
                    <TableCell>{offer.points}</TableCell>
                    <TableCell>{formatCurrency(offer.value)}</TableCell>
                    <TableCell>{offer.redemptions}</TableCell>
                    <TableCell>
                      <Badge variant={offer.status === 'Active' ? 'default' : 'secondary'}>
                        {offer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Progress 
                          value={offer.redemptions > 0 ? (offer.redemptions / Math.max(...topOffers.map(o => o.redemptions))) * 100 : 0} 
                          className="w-20 mr-2" 
                        />
                        <span className="text-sm text-muted-foreground">
                          {Math.round(offer.redemptions > 0 ? (offer.redemptions / Math.max(...topOffers.map(o => o.redemptions))) * 100 : 0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnersRewardsAnalytics; 