import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Star, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar
} from 'lucide-react';
import { useTourismMetrics } from '@/hooks/useTourismMetrics';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface TourismMetricsDashboardProps {
  cityId?: string;
  timeRange?: string;
}

export const TourismMetricsDashboard: React.FC<TourismMetricsDashboardProps> = ({ cityId, timeRange: propTimeRange }) => {
  const [timeRange, setTimeRange] = useState(propTimeRange || '30d');
  const { metrics, alerts, loading, error, refetch } = useTourismMetrics(cityId, timeRange);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métriques Touristiques</CardTitle>
          <CardDescription>Chargement des indicateurs de performance...</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métriques Touristiques</CardTitle>
          <CardDescription>Erreur lors du chargement</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button onClick={refetch} className="mt-4">Réessayer</Button>
        </CardContent>
      </Card>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "destructive" => {
    return type === 'error' || type === 'warning' ? 'destructive' : 'default';
  };

  // Prepare chart data
  const hourlyData = Object.entries(metrics?.attendanceMetrics.hourlyDistribution || {})
    .map(([hour, count]) => ({ hour: `${hour}h`, visitors: count }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  // Real quiz scores distribution
  const quizScoreData = Object.entries(metrics?.performanceInsights.stepSuccessRates || {})
    .map(([stepId, rate]) => ({ 
      range: rate >= 80 ? '80-100%' : rate >= 60 ? '60-79%' : rate >= 40 ? '40-59%' : '0-39%',
      rate: rate
    }))
    .reduce((acc, item) => {
      acc[item.range] = (acc[item.range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const quizDistributionData = Object.entries(quizScoreData)
    .map(([range, count]) => ({ range, count, fill: `hsl(var(--chart-${Object.keys(quizScoreData).indexOf(range) + 1}))` }));

  const monthlyData = Object.entries(metrics?.seasonalInsights.monthlyTrends || {})
    .map(([month, visitors]) => ({ month, visitors }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Métriques Touristiques Spécialisées</h2>
          <p className="text-muted-foreground">Indicateurs de performance pour l'office de tourisme</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">1 année</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refetch} variant="outline">
            Actualiser
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alertes et Recommandations</h3>
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                {getAlertIcon(alert.type)}
                <AlertTitle className="flex items-center gap-2">
                  {alert.title}
                  <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                    {alert.priority}
                  </Badge>
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Key Performance Indicators - Dynamic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Moyen Quiz</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.kpis.satisfactionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              moyenne des quiz complétés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Gagnés</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.kpis.totalPointsEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              total des points attribués
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Multi-Parcours</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.kpis.retentionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              utilisateurs avec 2+ parcours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étapes par Utilisateur</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.kpis.avgActivityScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              moyenne étapes complétées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participation Quiz</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.kpis.quizConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              % étapes avec quiz complétées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendance Estimée</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics?.kpis.yearOverYearGrowth.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              estimation basée sur données
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcours dans les Temps</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.kpis.journeyEfficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              ≤ 120% durée estimée
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completions Quotidiennes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.attendanceMetrics.dailyAverage.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              étapes complétées/jour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics - Dynamic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Métriques de Performance</CardTitle>
            <CardDescription>Calculs basés sur les données réelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Taux complétion parcours</span>
                <span className="text-sm text-muted-foreground">
                  {metrics?.satisfactionMetrics.completionRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics?.satisfactionMetrics.completionRate || 0} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Échanges de récompenses</span>
                <span className="text-sm text-muted-foreground">
                  {metrics?.performanceInsights.conversionToRewards.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics?.performanceInsights.conversionToRewards || 0} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Durée moyenne parcours</span>
                <span className="text-sm text-muted-foreground">
                  {metrics?.performanceInsights.avgTimeToComplete.toFixed(0)} min
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Score composite calculé</span>
                <span className="text-sm font-semibold">
                  {metrics?.performanceInsights.userEngagementScore}/100
                </span>
              </div>
              <Progress value={metrics?.performanceInsights.userEngagementScore || 0} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicateurs Synthétiques</CardTitle>
            <CardDescription>Métriques dérivées des données</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score composite</span>
              <Badge variant={metrics?.competitiveAnalysis.benchmarkScore && metrics.competitiveAnalysis.benchmarkScore > 7 ? "default" : "secondary"}>
                {metrics?.competitiveAnalysis.benchmarkScore.toFixed(1)}/10
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Niveau de performance</span>
              <span className="text-sm font-semibold">{metrics?.competitiveAnalysis.marketPosition}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Évolution estimée</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold text-green-500">
                  +{metrics?.competitiveAnalysis.growthRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Heures de pointe (efficacité)</span>
              <div className="flex flex-wrap gap-2">
                {metrics?.performanceInsights.peakPerformanceHours.slice(0, 3).map((peak, index) => (
                  <Badge key={index} variant="outline">
                    {peak.hour}h ({peak.efficiency.toFixed(0)}%)
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Economic Impact Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Visites Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.economicImpact.totalVisits.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">cette période</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Multi-Parcours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.economicImpact.repeatVisitRate}%</div>
            <p className="text-sm text-muted-foreground">utilisateurs avec 2+ parcours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition Week-end/Semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Semaine</span>
                <span className="font-semibold">{metrics?.attendanceMetrics.weekdayVsWeekend.weekday}</span>
              </div>
              <div className="flex justify-between">
                <span>Week-end</span>
                <span className="font-semibold">{metrics?.attendanceMetrics.weekdayVsWeekend.weekend}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Horaire des Visites</CardTitle>
          <CardDescription>Fréquentation par heure de la journée</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visitors" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seasonal Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Tendances Saisonnières</CardTitle>
          <CardDescription>Évolution de la fréquentation au fil de l'année</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="visitors" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};