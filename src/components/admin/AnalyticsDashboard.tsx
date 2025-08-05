import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  MapPin, 
  Trophy, 
  Clock,
  Target,
  Heart,
  Star,
  Activity,
  BarChart3
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center text-xs mt-2">
        {change.isPositive ? (
          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
        )}
        <span className={change.isPositive ? 'text-green-500' : 'text-red-500'}>
          {change.isPositive ? '+' : ''}{change.value}%
        </span>
        <span className="text-muted-foreground ml-1">{change.label}</span>
      </div>
    </CardContent>
  </Card>
);

interface AnalyticsDashboardProps {
  cityId?: string;
}

const AnalyticsDashboard = ({ cityId }: AnalyticsDashboardProps) => {
  const { analytics, popularJourneys, cityStats, loading, error } = useAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" text="Chargement des analytics..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Erreur lors du chargement des analytics: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const metrics = [
    {
      title: "Utilisateurs Actifs (30j)",
      value: analytics.activeUsers.toLocaleString(),
      change: { value: analytics.userGrowth, label: "vs mois dernier", isPositive: analytics.userGrowth > 0 },
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Parcours Complétés",
      value: analytics.completedJourneys.toLocaleString(),
      change: { value: 8.2, label: "vs mois dernier", isPositive: true },
      icon: <MapPin className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Taux de Completion",
      value: `${analytics.journeyCompletionRate.toFixed(1)}%`,
      change: { value: analytics.journeyCompletionRate - 70, label: "vs objectif", isPositive: analytics.journeyCompletionRate > 60 },
      icon: <Target className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Temps Moyen/Parcours",
      value: `${Math.floor(analytics.avgSessionTime / 60)}h ${analytics.avgSessionTime % 60}min`,
      change: { value: 5.3, label: "vs mois dernier", isPositive: true },
      icon: <Clock className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Points Distribués",
      value: analytics.totalPoints.toLocaleString(),
      change: { value: 15.3, label: "vs mois dernier", isPositive: true },
      icon: <Trophy className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Taux d'Engagement",
      value: `${analytics.engagementRate.toFixed(1)}%`,
      change: { value: analytics.engagementRate - 65, label: "vs objectif", isPositive: analytics.engagementRate > 60 },
      icon: <Star className="h-4 w-4 text-muted-foreground" />
    }
  ];

  const topJourneys = popularJourneys.length > 0 ? popularJourneys : [
    { name: "Aucun parcours complété", participants: 0, avgRating: 0, completionRate: 0 }
  ];

  const userEngagement = [
    { timeRange: "Matin (6h-12h)", users: 435, percentage: 32 },
    { timeRange: "Après-midi (12h-18h)", users: 678, percentage: 48 },
    { timeRange: "Soirée (18h-22h)", users: 234, percentage: 17 },
    { timeRange: "Nuit (22h-6h)", users: 43, percentage: 3 }
  ];

  const cities = cityStats.length > 0 ? cityStats : [
    { name: "Aucune donnée disponible", users: 0, journeys: 0, avgRating: 0 }
  ];

  // Mock data for charts - replace with real data
  const weeklyData = [
    { day: 'Lun', users: 120, journeys: 45, points: 1200 },
    { day: 'Mar', users: 150, journeys: 62, points: 1850 },
    { day: 'Mer', users: 180, journeys: 58, points: 2100 },
    { day: 'Jeu', users: 220, journeys: 75, points: 2800 },
    { day: 'Ven', users: 280, journeys: 98, points: 3200 },
    { day: 'Sam', users: 320, journeys: 125, points: 4100 },
    { day: 'Dim', users: 250, journeys: 89, points: 3500 }
  ];

  const monthlyData = [
    { month: 'Jan', users: 2400, journeys: 800, retention: 65 },
    { month: 'Fév', users: 2800, journeys: 950, retention: 68 },
    { month: 'Mar', users: 3200, journeys: 1200, retention: 72 },
    { month: 'Avr', users: 3800, journeys: 1400, retention: 75 },
    { month: 'Mai', users: 4200, journeys: 1650, retention: 78 },
    { month: 'Juin', users: 4800, journeys: 1900, retention: 80 }
  ];

  const categoryData = [
    { name: 'Culture', value: 35, color: '#8884d8' },
    { name: 'Nature', value: 28, color: '#82ca9d' },
    { name: 'Gastronomie', value: 22, color: '#ffc658' },
    { name: 'Art', value: 15, color: '#ff7300' }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="space-y-6">
      {cityId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            Affichage des analytics pour votre ville uniquement
          </p>
        </div>
      )}
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Analytics Avancées</h2>
        <p className="text-muted-foreground">
          Analysez les performances et l'engagement de votre plateforme
        </p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Graphiques Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution hebdomadaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Évolution Hebdomadaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Utilisateurs"
                />
                <Line 
                  type="monotone" 
                  dataKey="journeys" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Parcours"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Répartition par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Évolution mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Croissance Mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8"
                  name="Utilisateurs"
                />
                <Area 
                  type="monotone" 
                  dataKey="journeys" 
                  stackId="2"
                  stroke="#82ca9d" 
                  fill="#82ca9d"
                  name="Parcours"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Taux de rétention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Taux de Rétention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="retention" 
                  fill="#8884d8"
                  name="Rétention (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parcours les plus populaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Parcours les Plus Populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topJourneys.map((journey, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{journey.name}</span>
                      <Badge variant="outline" className="h-5">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {journey.participants} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {journey.avgRating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {journey.completionRate?.toFixed(0) || '0'}% complétion
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement par tranche horaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Engagement par Tranche Horaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userEngagement.map((period, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{period.timeRange}</span>
                    <span className="text-muted-foreground">
                      {period.users} utilisateurs ({period.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${period.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Insights Clés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="text-sm font-medium text-green-800">📈 Croissance</div>
              <div className="text-xs text-green-600 mt-1">
                L'engagement augmente de 12% ce mois-ci, principalement sur les parcours culturels.
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="text-sm font-medium text-blue-800">🎯 Opportunité</div>
              <div className="text-xs text-blue-600 mt-1">
                Les parcours en soirée (18h-22h) ont le taux de satisfaction le plus élevé.
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <div className="text-sm font-medium text-yellow-800">⚠️ Attention</div>
              <div className="text-xs text-yellow-600 mt-1">
                Le taux de complétion diminue légèrement (-2.1%). Analyse approfondie recommandée.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;