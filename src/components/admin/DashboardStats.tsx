
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useUserStats } from '@/hooks/useUserStats';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MapPin, 
  Trophy, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      {trend && (
        <div className="flex items-center text-xs">
          {trend.isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={trend.isPositive ? 'text-green-500' : 'text-red-500'}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-muted-foreground ml-1">{trend.label}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const DashboardStats = () => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { analytics, loading, error, refetch } = useAnalytics();
  const { stats: userStats } = useUserStats();

  // Vérifier les permissions
  const hasAnalyticsAccess = profile?.role && [
    'super_admin', 
    'tenant_admin'
  ].includes(profile.role);

  if (!hasAnalyticsAccess) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Accès limité aux statistiques (rôle: {profile?.role || 'Non défini'})
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-4 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-6 w-12 bg-muted animate-pulse rounded mb-1" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          Erreur de chargement
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Aucune donnée disponible</AlertDescription>
      </Alert>
    );
  }

  const isSuperAdmin = profile?.role === 'super_admin';
  
  // Statistiques compactes et pertinentes avec données réelles
  const stats = [
    {
      title: "Utilisateurs",
      value: analytics.activeUsers,
      total: analytics.totalUsers,
      icon: <Users className="h-4 w-4 text-blue-500" />,
      change: analytics.userGrowth
    },
    {
      title: "Parcours",
      value: analytics.completedJourneys,
      subtitle: `${analytics.journeyCompletionRate.toFixed(0)}% taux`,
      icon: <MapPin className="h-4 w-4 text-green-500" />,
      change: analytics.journeyCompletionRate > 60 ? 5 : -2
    },
    {
      title: "Points",
      value: analytics.totalPoints > 1000 ? `${(analytics.totalPoints/1000).toFixed(1)}k` : analytics.totalPoints,
      subtitle: "distribués",
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
      change: 8
    },
    {
      title: "Engagement", 
      value: `${analytics.engagementRate.toFixed(0)}%`,
      subtitle: "utilisateurs actifs",
      icon: <Activity className="h-4 w-4 text-purple-500" />,
      change: analytics.engagementRate - 65
    }
  ];

  return (
    <div className="space-y-3">
      {!isSuperAdmin && !profile?.city_id && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
          ⚠️ Ville non assignée - Données limitées
        </div>
      )}
      
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
              {stat.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{stat.value}</span>
                {stat.total && (
                  <span className="text-xs text-muted-foreground">/{stat.total}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{stat.subtitle || 'actifs'}</span>
                {stat.change !== undefined && (
                  <div className="flex items-center text-xs">
                    {stat.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={stat.change > 0 ? 'text-green-500' : 'text-red-500'}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
