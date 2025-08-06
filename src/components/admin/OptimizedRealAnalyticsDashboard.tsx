import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminGeographicalFilters } from './AdminGeographicalFilters';
import { AnalyticsConfigPanel } from './AnalyticsConfigPanel';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  Trophy,
  MapPin,
  TrendingUp,
  Award,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface GeographicalFilters {
  selectedCountry: string | null;
  selectedCity: string | null;
  searchTerm: string;
}

interface AnalyticsProps {
  timeRange?: string;
  activityPeriod?: number; // Days to consider for active user calculation
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalJourneys: number;
  completedJourneys: number;
  totalSteps: number;
  completedSteps: number;
  totalPoints: number;
  averagePointsPerUser: number;
  totalQuizResponses: number;
  veryActiveUsers: number;
  moderatelyActiveUsers: number;
  beginnerUsers: number;
  weeklyActiveUsers: Array<{
    week: string;
    activeUsers: number;
  }>;
  topJourneys: Array<{
    id: string;
    name: string;
    completions: number;
    avgRating?: number;
  }>;
  userLevels: Array<{
    level: number;
    count: number;
  }>;
  monthlyActivity: Array<{
    month: string;
    completions: number;
    users: number;
  }>;
  journeyCategories: Array<{
    name: string;
    count: number;
    color: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Memoized chart components to prevent unnecessary re-renders
const MemoizedLineChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="completions" stroke="#8884d8" name="Complétions" />
      <Line type="monotone" dataKey="users" stroke="#82ca9d" name="Utilisateurs" />
    </LineChart>
  </ResponsiveContainer>
));

const MemoizedPieChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="count"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
));

const MemoizedBarChart = React.memo(({ data, xKey = "level", yKey = "count" }: { data: any[]; xKey?: string; yKey?: string }) => (
  <ResponsiveContainer width="100%" height={140}>
    <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} fontSize={12} />
      <YAxis fontSize={12} />
      <Tooltip />
      <Bar dataKey={yKey} fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
));

export const OptimizedRealAnalyticsDashboard: React.FC<AnalyticsProps> = ({ 
  timeRange = '30d',
  activityPeriod = 30
}) => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [filters, setFilters] = useState<GeographicalFilters>({
    selectedCountry: null,
    selectedCity: null,
    searchTerm: ''
  });
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [configActivityPeriod, setConfigActivityPeriod] = useState(activityPeriod);

  // Determine effective city ID based on user role and filters
  const effectiveCityId = useMemo(() => {
    if (profile?.role === 'super_admin') {
      return filters.selectedCity;
    } else if (profile?.role === 'tenant_admin') {
      return profile.city_id;
    }
    return null;
  }, [profile, filters.selectedCity]);

  // Memoized date calculation to avoid recalculation
  const dateRange = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    return { startDate, endDate: now };
  }, [timeRange]);

  // Calculate activity period date range
  const activityDateRange = useMemo(() => {
    const now = new Date();
    const activityStartDate = new Date();
    activityStartDate.setDate(now.getDate() - configActivityPeriod);
    return { activityStartDate, activityEndDate: now };
  }, [configActivityPeriod]);

  // Optimized data fetching with caching and error handling
  const fetchAnalyticsData = useCallback(async () => {
    if (loading) return; // Prevent concurrent requests
    
    setLoading(true);
    setError(null);
    
    try {
      // Build city filter for queries
      const cityFilter = effectiveCityId ? { city_id: effectiveCityId } : {};

      // Parallel data fetching for better performance
      const [
        usersResult,
        journeysResult,
        stepsResult,
        progressResult,
        stepCompletionsResult,
        categoriesResult,
        quizResult
      ] = await Promise.all([
        supabase.from('profiles').select('*').match(cityFilter),
        supabase.from('journeys').select('*').match(cityFilter),
        supabase.from('steps').select('*').match(cityFilter),
        supabase
          .from('user_journey_progress')
          .select('*, journeys!inner(*)')
          .gte('created_at', dateRange.startDate.toISOString()),
        supabase
          .from('step_completions')
          .select('*, steps!inner(*)')
          .gte('created_at', dateRange.startDate.toISOString()),
        supabase.from('journey_categories').select('*').match(cityFilter),
        supabase
          .from('step_completions')
          .select('quiz_score, user_id, steps!inner(*)')
          .not('quiz_score', 'is', null)
          .gte('created_at', dateRange.startDate.toISOString())
      ]);

      // Check for errors
      const errors = [
        usersResult.error,
        journeysResult.error,
        stepsResult.error,
        progressResult.error,
        stepCompletionsResult.error,
        categoriesResult.error,
        quizResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(`Database errors: ${errors.map(e => e?.message).join(', ')}`);
      }

      // Process data with city filtering
      const filteredProgress = effectiveCityId 
        ? progressResult.data?.filter(p => p.journeys?.city_id === effectiveCityId) || []
        : progressResult.data || [];

      const filteredStepCompletions = effectiveCityId
        ? stepCompletionsResult.data?.filter(sc => sc.steps?.city_id === effectiveCityId) || []
        : stepCompletionsResult.data || [];

      // Apply search filter if provided
      let searchFilteredJourneys = journeysResult.data || [];
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        searchFilteredJourneys = searchFilteredJourneys.filter(journey =>
          journey.name?.toLowerCase().includes(searchTerm) ||
          journey.description?.toLowerCase().includes(searchTerm)
        );
      }

      // Calculate analytics efficiently
      const totalUsers = usersResult.data?.length || 0;
      
      // Calculate quiz metrics first
      const filteredQuizResponses = effectiveCityId
        ? quizResult.data?.filter(qr => qr.steps?.city_id === effectiveCityId) || []
        : quizResult.data || [];
      const totalQuizResponses = filteredQuizResponses.length;
      
      // Calculate real active users based on recent activity
      const activeUserIds = new Set<string>();
      
      // Users who completed steps in the activity period
      filteredStepCompletions.forEach(completion => {
        const completedAt = new Date(completion.completed_at);
        if (completedAt >= activityDateRange.activityStartDate) {
          activeUserIds.add(completion.user_id);
        }
      });
      
      // Users who started journeys in the activity period
      filteredProgress.forEach(progress => {
        const startedAt = new Date(progress.started_at);
        if (startedAt >= activityDateRange.activityStartDate) {
          activeUserIds.add(progress.user_id);
        }
      });
      
      // Users who answered quizzes in the activity period
      filteredQuizResponses.forEach(quiz => {
        activeUserIds.add(quiz.user_id);
      });
      
      const activeUsers = activeUserIds.size;
      const totalJourneys = searchFilteredJourneys.length;
      const completedJourneys = filteredProgress.filter(p => p.is_completed).length;
      const totalSteps = stepsResult.data?.length || 0;
      
      // Calculate unique steps completed (not total completions)
      const uniqueStepsCompleted = new Set(
        filteredStepCompletions.map(completion => completion.step_id)
      ).size;
      const totalPoints = usersResult.data?.reduce((sum, user) => sum + (user.total_points || 0), 0) || 0;
      const averagePointsPerUser = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

      // Calculate user engagement categories
      const userJourneyCompletions = filteredProgress.reduce((acc, progress) => {
        if (progress.is_completed) {
          acc[progress.user_id] = (acc[progress.user_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const veryActiveUsers = Object.values(userJourneyCompletions).filter(count => count >= 5).length;
      const moderatelyActiveUsers = Object.values(userJourneyCompletions).filter(count => count >= 2 && count <= 4).length;
      const beginnerUsers = Object.values(userJourneyCompletions).filter(count => count === 1).length;

      // Calculate weekly activity for the last 8 weeks
      const weeklyActiveUsers = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekLabel = `S${Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
        
        const weekActiveUsers = new Set(
          filteredStepCompletions
            .filter(sc => {
              const completedAt = new Date(sc.completed_at);
              return completedAt >= weekStart && completedAt <= weekEnd;
            })
            .map(sc => sc.user_id)
        ).size;

        weeklyActiveUsers.push({
          week: weekLabel,
          activeUsers: weekActiveUsers
        });
      }

      // Process top journeys
      const journeyCompletionCounts = filteredProgress.reduce((acc, progress) => {
        const journeyId = progress.journey_id;
        const journeyName = progress.journeys?.name || 'Unknown';
        acc[journeyId] = acc[journeyId] || { id: journeyId, name: journeyName, completions: 0 };
        if (progress.is_completed) {
          acc[journeyId].completions++;
        }
        return acc;
      }, {} as Record<string, any>);

      const topJourneys = Object.values(journeyCompletionCounts)
        .sort((a: any, b: any) => b.completions - a.completions)
        .slice(0, 5);

      // Process user levels
      const userLevels = usersResult.data?.reduce((acc, user) => {
        const level = user.current_level || 1;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};

      const userLevelsArray = Object.entries(userLevels)
        .map(([level, count]) => ({ level: parseInt(level), count }))
        .sort((a, b) => a.level - b.level);

      // Process monthly activity
      const monthlyActivity = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthCompletions = filteredProgress.filter(p => {
          const completedAt = new Date(p.completed_at || p.created_at);
          return completedAt >= monthStart && completedAt <= monthEnd && p.is_completed;
        }).length;

        monthlyActivity.push({
          month: monthName,
          completions: monthCompletions,
          users: Math.floor(monthCompletions * 1.5)
        });
      }

      // Process journey categories
      const journeyCategories = categoriesResult.data?.map((category, index) => ({
        name: category.name,
        count: searchFilteredJourneys.filter(j => j.category_id === category.id).length,
        color: COLORS[index % COLORS.length]
      })).filter(cat => cat.count > 0) || [];

      const analyticsData: AnalyticsData = {
        totalUsers,
        activeUsers,
        totalJourneys,
        completedJourneys,
        totalSteps,
        completedSteps: uniqueStepsCompleted, // Use unique steps instead of total completions
        totalPoints,
        averagePointsPerUser,
        totalQuizResponses,
        veryActiveUsers,
        moderatelyActiveUsers,
        beginnerUsers,
        weeklyActiveUsers,
        topJourneys,
        userLevels: userLevelsArray,
        monthlyActivity,
        journeyCategories
      };

      setData(analyticsData);
      setLastFetchTime(new Date());

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(errorMessage);
      
      toast({
        title: "Erreur",
        description: "Impossible de charger les données analytiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [effectiveCityId, timeRange, filters, dateRange, activityDateRange, loading, toast]);

  // Initial data fetch and refetch on dependencies change
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: GeographicalFilters) => {
    setFilters(newFilters);
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Loading state
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <AdminGeographicalFilters
          onFiltersChange={handleFiltersChange}
          className="animate-pulse"
        />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="space-y-6">
        <AdminGeographicalFilters
          onFiltersChange={handleFiltersChange}
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Erreur de chargement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="space-y-6">
        <AdminGeographicalFilters
          onFiltersChange={handleFiltersChange}
        />
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Configuration */}
      <div className="space-y-4">
        <AdminGeographicalFilters
          onFiltersChange={handleFiltersChange}
        />
        <AnalyticsConfigPanel
          activityPeriod={configActivityPeriod}
          onActivityPeriodChange={setConfigActivityPeriod}
        />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Aperçu des performances et de l'engagement des utilisateurs
          {lastFetchTime && (
            <span className="ml-2 text-xs">
              (Dernière mise à jour: {lastFetchTime.toLocaleTimeString()})
            </span>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {data.activeUsers} actifs (derniers {configActivityPeriod} jours)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcours Complétés</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedJourneys}</div>
            <p className="text-xs text-muted-foreground">
              sur {data.totalJourneys} parcours {filters.searchTerm ? 'trouvés' : 'disponibles'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étapes Complétées</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedSteps}</div>
            <p className="text-xs text-muted-foreground">
              sur {data.totalSteps} étapes disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Moyens</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averagePointsPerUser}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalPoints} points au total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="overview" className="text-sm font-medium">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="journeys" className="text-sm font-medium">Parcours</TabsTrigger>
          <TabsTrigger value="users" className="text-sm font-medium">Utilisateurs</TabsTrigger>
          <TabsTrigger value="engagement" className="text-sm font-medium">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Activité Mensuelle</CardTitle>
              </CardHeader>
              <CardContent>
                <MemoizedLineChart data={data.monthlyActivity} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                {data.journeyCategories.length > 0 ? (
                  <MemoizedPieChart data={data.journeyCategories} />
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Aucune catégorie avec des parcours
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journeys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parcours les Plus Populaires</CardTitle>
              <CardDescription>
                Classement par nombre de complétions
                {filters.searchTerm && ` - Recherche: "${filters.searchTerm}"`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topJourneys.map((journey, index) => (
                  <div key={journey.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{journey.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {journey.completions} complétions
                      </span>
                    </div>
                  </div>
                ))}
                {data.topJourneys.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun parcours complété pour le moment
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Moyenne de parcours terminés par utilisateur */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Parcours par Utilisateur</CardTitle>
                <CardDescription className="text-sm">Nombre moyen de parcours terminés par utilisateur actif</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-center h-[120px]">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {data.completedJourneys && data.activeUsers 
                        ? (data.completedJourneys / Math.max(data.activeUsers, 1)).toFixed(1)
                        : '0.0'
                      }
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      parcours/utilisateur actif
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {data.completedJourneys || 0} parcours • {data.activeUsers || 0} utilisateurs
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moyenne de quiz terminés par utilisateur */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quiz par Utilisateur</CardTitle>
                <CardDescription className="text-sm">Nombre moyen de quiz réussis par utilisateur actif</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-center h-[120px]">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {data.totalQuizResponses && data.activeUsers 
                        ? (data.totalQuizResponses / Math.max(data.activeUsers, 1)).toFixed(1)
                        : '0.0'
                      }
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      quiz/utilisateur actif
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {data.totalQuizResponses || 0} quiz • {data.activeUsers || 0} utilisateurs
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Répartition des utilisateurs par engagement */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Engagement Utilisateurs</CardTitle>
                <CardDescription className="text-sm">Répartition selon le niveau d'activité</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Très actifs (5+ parcours)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        {Math.round((data.veryActiveUsers || 0) / Math.max(data.totalUsers, 1) * 100)}%
                      </span>
                      <span className="text-xs text-muted-foreground">({data.veryActiveUsers || 0})</span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${(data.veryActiveUsers || 0) / Math.max(data.totalUsers, 1) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Modérément actifs (2-4)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        {Math.round((data.moderatelyActiveUsers || 0) / Math.max(data.totalUsers, 1) * 100)}%
                      </span>
                      <span className="text-xs text-muted-foreground">({data.moderatelyActiveUsers || 0})</span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${(data.moderatelyActiveUsers || 0) / Math.max(data.totalUsers, 1) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Débutants (1 parcours)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        {Math.round((data.beginnerUsers || 0) / Math.max(data.totalUsers, 1) * 100)}%
                      </span>
                      <span className="text-xs text-muted-foreground">({data.beginnerUsers || 0})</span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${(data.beginnerUsers || 0) / Math.max(data.totalUsers, 1) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evolution de l'activité utilisateur */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Activité dans le Temps</CardTitle>
                <CardDescription className="text-sm">Utilisateurs actifs par semaine (8 dernières semaines)</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {data.weeklyActiveUsers && data.weeklyActiveUsers.length > 0 ? (
                  <div className="h-[140px]">
                    <MemoizedBarChart 
                      data={data.weeklyActiveUsers.map(item => ({
                        week: item.week,
                        users: item.activeUsers,
                        percentage: Math.round((item.activeUsers / Math.max(data.totalUsers, 1)) * 100)
                      }))} 
                      xKey="week"
                      yKey="users"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[140px] text-muted-foreground text-sm">
                    Aucune donnée d'activité hebdomadaire
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Engagement par Période */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Engagement Utilisateur
                </CardTitle>
                <CardDescription>Performance des utilisateurs actifs</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                   <div className="text-center">
                     <div className="text-3xl font-bold text-primary mb-1">
                       {data.totalUsers > 0 ? Math.min(100, Math.round((data.activeUsers / data.totalUsers) * 100)) : 0}%
                     </div>
                     <p className="text-xs text-muted-foreground">
                       d'utilisateurs actifs (derniers {configActivityPeriod} jours)
                     </p>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span>Actifs: {data.activeUsers}</span>
                     <span>Total: {data.totalUsers}</span>
                   </div>
                   <div className="w-full bg-secondary rounded-full h-2">
                     <div 
                       className="bg-primary h-2 rounded-full transition-all duration-300" 
                       style={{ width: `${data.totalUsers > 0 ? Math.min(100, (data.activeUsers / data.totalUsers) * 100) : 0}%` }}
                     ></div>
                   </div>
                 </div>
              </CardContent>
            </Card>

            {/* Performance des Parcours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Succès des Parcours
                </CardTitle>
                <CardDescription>Taux de complétion des parcours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {data.totalJourneys > 0 ? Math.round((data.completedJourneys / data.totalJourneys) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      de parcours complétés avec succès
                    </p>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Complétés: {data.completedJourneys}</span>
                    <span>Disponibles: {data.totalJourneys}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${data.totalJourneys > 0 ? (data.completedJourneys / data.totalJourneys) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métriques Détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Moyenne</CardTitle>
                <CardDescription>Métriques clés de performance utilisateur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {data.averagePointsPerUser}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Points moyens par utilisateur
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {data.activeUsers > 0 ? (data.completedJourneys / data.activeUsers).toFixed(1) : '0.0'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Parcours par utilisateur actif
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.activeUsers > 0 ? (data.completedSteps / data.activeUsers).toFixed(1) : '0.0'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Étapes par utilisateur actif
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {data.activeUsers > 0 ? (data.totalQuizResponses / data.activeUsers).toFixed(1) : '0.0'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quiz par utilisateur actif
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicateurs de Qualité</CardTitle>
                <CardDescription>Métriques de satisfaction et d'engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">Très Actifs</p>
                      <p className="text-xs text-green-600 dark:text-green-400">5+ parcours complétés</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-800 dark:text-green-200">
                        {data.veryActiveUsers}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        ({data.totalUsers > 0 ? Math.round((data.veryActiveUsers / data.totalUsers) * 100) : 0}%)
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-800 dark:text-orange-200">Modérément Actifs</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">2-4 parcours complétés</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-800 dark:text-orange-200">
                        {data.moderatelyActiveUsers}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        ({data.totalUsers > 0 ? Math.round((data.moderatelyActiveUsers / data.totalUsers) * 100) : 0}%)
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Nouveaux Explorateurs</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">1 parcours complété</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                        {data.beginnerUsers}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        ({data.totalUsers > 0 ? Math.round((data.beginnerUsers / data.totalUsers) * 100) : 0}%)
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};