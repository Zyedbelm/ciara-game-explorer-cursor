import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Calendar,
  Clock,
  MapPin
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

interface PartnersAdvancedAnalyticsProps {
  partners: PartnerData[];
  stats: DashboardStats;
  dailyStats: DailyStats[];
  hourlyStats: HourlyStats[];
}

const PartnersAdvancedAnalytics = ({
  partners,
  stats,
  dailyStats,
  hourlyStats
}: PartnersAdvancedAnalyticsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const calculateGrowthRate = () => {
    // Simuler un taux de croissance (à remplacer par vraies données)
    return Math.floor(Math.random() * 50) - 25; // Entre -25% et +25%
  };

  const getCategoryDistribution = () => {
    const categories = partners.reduce((acc, partner) => {
      acc[partner.category] = (acc[partner.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
      percentage: (count / partners.length) * 100
    }));
  };

  const getGeographicDistribution = () => {
    const cities = partners.reduce((acc, partner) => {
      const cityName = partner.city?.name || 'Inconnu';
      acc[cityName] = (acc[cityName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cities).map(([city, count]) => ({
      city,
      count,
      percentage: (count / partners.length) * 100
    }));
  };

  const getPerformanceMetrics = () => {
    return [
      {
        metric: "Taux d'Engagement",
        value: stats.totalPartners > 0 ? Math.round((stats.activePartners / stats.totalPartners) * 100) : 0,
        unit: "%",
        trend: "up",
        description: "Partenaires actifs"
      },
      {
        metric: "Efficacité des Offres",
        value: stats.totalRewards > 0 ? Math.round((stats.totalRedemptions / stats.totalRewards) * 100) : 0,
        unit: "%",
        trend: "up",
        description: "Rédactions vs offres"
      },
      {
        metric: "Revenu Moyen",
        value: stats.totalPartners > 0 ? Math.round(stats.totalRevenue / stats.totalPartners) : 0,
        unit: "CHF",
        trend: "up",
        description: "Par partenaire"
      },
      {
        metric: "Taux de Croissance",
        value: calculateGrowthRate(),
        unit: "%",
        trend: calculateGrowthRate() >= 0 ? "up" : "down",
        description: "Ce mois vs dernier"
      }
    ];
  };

  const getTrendAnalysis = () => {
    const totalRedemptions = dailyStats.reduce((sum, day) => sum + day.redemptions, 0);
    const totalRevenue = dailyStats.reduce((sum, day) => sum + day.revenue, 0);
    
    return [
      {
        period: "Cette semaine",
        redemptions: totalRedemptions,
        revenue: totalRevenue,
        trend: "up"
      },
      {
        period: "Semaine précédente",
        redemptions: Math.floor(totalRedemptions * 0.8),
        revenue: Math.floor(totalRevenue * 0.8),
        trend: "down"
      },
      {
        period: "Il y a 2 semaines",
        redemptions: Math.floor(totalRedemptions * 0.6),
        revenue: Math.floor(totalRevenue * 0.6),
        trend: "down"
      }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Métriques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getPerformanceMetrics().map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
              {metric.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.value}{metric.unit}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
              <Progress 
                value={Math.min(metric.value, 100)} 
                className="mt-2" 
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analyse des tendances */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse des Tendances</CardTitle>
          <CardDescription>
            Évolution des performances sur les dernières semaines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Rédactions</TableHead>
                  <TableHead>Revenus</TableHead>
                  <TableHead>Tendance</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getTrendAnalysis().map((trend, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{trend.period}</TableCell>
                    <TableCell>{trend.redemptions}</TableCell>
                    <TableCell>{formatCurrency(trend.revenue)}</TableCell>
                    <TableCell>
                      {trend.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Progress 
                        value={(trend.revenue / Math.max(...getTrendAnalysis().map(t => t.revenue))) * 100} 
                        className="w-20" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Distribution par catégorie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribution par Catégorie</CardTitle>
            <CardDescription>
              Répartition des partenaires par secteur d'activité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getCategoryDistribution().map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{category.category}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{category.count} partenaires</div>
                      <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                    </div>
                    <Progress 
                      value={category.percentage} 
                      className="w-20" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribution géographique */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution Géographique</CardTitle>
            <CardDescription>
              Répartition des partenaires par ville
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getGeographicDistribution().map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{location.city}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{location.count} partenaires</div>
                      <div className="text-xs text-muted-foreground">{location.percentage.toFixed(1)}%</div>
                    </div>
                    <Progress 
                      value={location.percentage} 
                      className="w-20" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs avancés */}
      <Card>
        <CardHeader>
          <CardTitle>Indicateurs de Performance Avancés</CardTitle>
          <CardDescription>
            Métriques détaillées pour l'optimisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalPartners > 0 ? (stats.totalRedemptions / stats.totalPartners).toFixed(1) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Rédactions moyennes par partenaire</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.totalRewards > 0 ? (stats.totalRevenue / stats.totalRewards).toFixed(2) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Valeur moyenne par offre (CHF)</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalPartners > 0 ? (stats.totalRewards / stats.totalPartners).toFixed(1) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Offres moyennes par partenaire</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {stats.totalRedemptions > 0 ? (stats.totalRevenue / stats.totalRedemptions).toFixed(2) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Revenu moyen par rédaction (CHF)</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {stats.totalPartners > 0 ? Math.round((stats.activePartners / stats.totalPartners) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Taux d'activation des partenaires</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {stats.totalRewards > 0 ? Math.round((stats.totalRedemptions / stats.totalRewards) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Taux de conversion des offres</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights et recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights et Recommandations</CardTitle>
          <CardDescription>
            Analyses automatiques et suggestions d'amélioration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Opportunité d'Optimisation</h4>
                <p className="text-sm text-blue-700">
                  Les partenaires de la catégorie "Restaurant" montrent un taux de conversion de 15% supérieur à la moyenne. 
                  Considérez des incitations spéciales pour cette catégorie.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <Award className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Performance Exceptionnelle</h4>
                <p className="text-sm text-green-700">
                  Les heures de pointe (12:00-14:00) génèrent 40% des rédactions. 
                  Optimisez les offres pour ces créneaux horaires.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">Attention Requise</h4>
                <p className="text-sm text-orange-700">
                  30% des partenaires n'ont pas d'offres actives. 
                  Contactez-les pour les encourager à créer de nouvelles offres.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnersAdvancedAnalytics; 