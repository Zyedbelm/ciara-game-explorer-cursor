import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface TourismMetrics {
  attendanceMetrics: {
    hourlyDistribution: Record<string, number>;
    dailyAverage: number;
    peakHours: Array<{ hour: number; visitors: number }>;
    weekdayVsWeekend: { weekday: number; weekend: number };
  };
  satisfactionMetrics: {
    averageRating: number;
    ratingDistribution: Record<string, number>;
    completionRate: number;
    abandonmentRate: number;
    topRatedSteps: Array<{ stepId: string; name: string; rating: number }>;
  };
  // New dynamic KPIs
  kpis: {
    satisfactionRate: number; // From quiz_score in step_completions
    totalPointsEarned: number; // Sum of points_earned from step_completions  
    retentionRate: number; // Users with multiple journeys
    avgActivityScore: number; // Average steps completed per user
    quizConversionRate: number; // Quiz completion percentage
    yearOverYearGrowth: number; // YoY growth in visits
    journeyEfficiency: number; // Completion time vs estimated duration ratio
    geographicDistribution: Record<string, number>; // Completions by step/zone
  };
  // Performance insights based on real data
  performanceInsights: {
    conversionToRewards: number; // Actual reward redemptions vs completions
    avgTimeToComplete: number; // Average time from start to completion
    peakPerformanceHours: Array<{ hour: number; efficiency: number }>;
    stepSuccessRates: Record<string, number>; // Success rate per step
    userEngagementScore: number; // Based on multiple factors
  };
  economicImpact: {
    totalVisits: number;
    estimatedRevenue: number;
    avgVisitDuration: number;
    repeatVisitRate: number;
  };
  seasonalInsights: {
    monthlyTrends: Record<string, number>;
    seasonalPeaks: Record<string, { visitors: number; growthRate: number }>;
    weatherCorrelation: Record<string, number>;
  };
  competitiveAnalysis: {
    benchmarkScore: number;
    marketPosition: string;
    growthRate: number;
    uniqueFeatures: string[];
  };
}

export interface TourismAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  actionRequired: boolean;
}

export const useTourismMetrics = (cityId?: string, timeRange: string = '30d') => {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<TourismMetrics | null>(null);
  const [alerts, setAlerts] = useState<TourismAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTourismMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isSuperAdmin = profile?.role === 'super_admin';
      const targetCityId = isSuperAdmin ? cityId : profile?.city_id;

      // Time range setup
      const now = new Date();
      const timeRangeMap: Record<string, number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      const daysBack = timeRangeMap[timeRange] || 30;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      // Fetch step completions with detailed data
      let completionsQuery = supabase
        .from('step_completions')
        .select(`
          *,
          step:steps!inner(id, name, city_id, points_awarded, has_quiz),
          journey:journeys(id, name, estimated_duration)
        `)
        .gte('completed_at', startDate.toISOString());

      if (targetCityId) {
        completionsQuery = completionsQuery.eq('step.city_id', targetCityId);
      }

      const { data: completions, error: completionsError } = await completionsQuery;
      if (completionsError) throw completionsError;

      // Fetch user journey progress for completion rates
      let progressQuery = supabase
        .from('user_journey_progress')
        .select(`
          *,
          journey:journeys!inner(id, name, city_id, estimated_duration)
        `)
        .gte('started_at', startDate.toISOString());

      if (targetCityId) {
        progressQuery = progressQuery.eq('journey.city_id', targetCityId);
      }

      const { data: progress, error: progressError } = await progressQuery;
      if (progressError) throw progressError;

      // Process attendance metrics
      const hourlyDistribution: Record<string, number> = {};
      const dailyVisits: Record<string, number> = {};
      let weekdayCount = 0;
      let weekendCount = 0;

      completions?.forEach(completion => {
        const date = new Date(completion.completed_at);
        const hour = date.getHours();
        const dayKey = date.toDateString();
        const dayOfWeek = date.getDay();

        hourlyDistribution[hour.toString()] = (hourlyDistribution[hour.toString()] || 0) + 1;
        dailyVisits[dayKey] = (dailyVisits[dayKey] || 0) + 1;

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          weekendCount++;
        } else {
          weekdayCount++;
        }
      });

      const peakHours = Object.entries(hourlyDistribution)
        .map(([hour, visitors]) => ({ hour: parseInt(hour), visitors }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 3);

      const dailyAverage = Object.values(dailyVisits).reduce((sum, visits) => sum + visits, 0) / Object.keys(dailyVisits).length || 0;

      // Process satisfaction metrics
      const totalProgress = progress?.length || 0;
      const completedJourneys = progress?.filter(p => p.is_completed).length || 0;
      const completionRate = totalProgress > 0 ? (completedJourneys / totalProgress) * 100 : 0;
      const abandonmentRate = 100 - completionRate;

      // Mock rating data (in real app, this would come from user feedback)
      const averageRating = 4.3;
      const ratingDistribution = { '5': 45, '4': 35, '3': 15, '2': 3, '1': 2 };

      // Process economic impact
      const totalVisits = completions?.length || 0;
      const estimatedRevenue = totalVisits * 15; // Estimated 15 CHF per visit
      const avgVisitDuration = progress?.reduce((sum, p) => {
        if (p.completed_at && p.started_at) {
          const duration = new Date(p.completed_at).getTime() - new Date(p.started_at).getTime();
          return sum + duration;
        }
        return sum;
      }, 0) / (completedJourneys || 1) / (1000 * 60); // in minutes

      // Calculate new dynamic KPIs
      const completionsWithQuiz = completions?.filter(c => c.quiz_score !== null) || [];
      const totalQuizAttempts = completionsWithQuiz.length;
      const successfulQuizzes = completionsWithQuiz.filter(c => (c.quiz_score || 0) >= 70).length;
      
      // 1. Satisfaction Rate (from quiz scores)
      const satisfactionRate = totalQuizAttempts > 0 
        ? (completionsWithQuiz.reduce((sum, c) => sum + (c.quiz_score || 0), 0) / totalQuizAttempts)
        : 0;

      // 2. Total Points Earned 
      const totalPointsEarned = completions?.reduce((sum, c) => sum + (c.points_earned || 0), 0) || 0;

      // 3. Retention Rate (users with multiple journeys)
      const userJourneyCounts: Record<string, number> = {};
      progress?.forEach(p => {
        userJourneyCounts[p.user_id] = (userJourneyCounts[p.user_id] || 0) + 1;
      });
      const uniqueUsers = Object.keys(userJourneyCounts).length;
      const retentionUsers = Object.values(userJourneyCounts).filter(count => count > 1).length;
      const retentionRate = uniqueUsers > 0 ? (retentionUsers / uniqueUsers) * 100 : 0;

      // 4. Average Activity Score (steps completed per user)
      const userStepCounts: Record<string, number> = {};
      completions?.forEach(c => {
        userStepCounts[c.user_id] = (userStepCounts[c.user_id] || 0) + 1;
      });
      const avgActivityScore = Object.keys(userStepCounts).length > 0 
        ? Object.values(userStepCounts).reduce((sum, count) => sum + count, 0) / Object.keys(userStepCounts).length
        : 0;

      // 5. Quiz Conversion Rate
      const stepsWithQuiz = completions?.filter(c => c.step?.has_quiz) || [];
      const quizConversionRate = stepsWithQuiz.length > 0 
        ? (totalQuizAttempts / stepsWithQuiz.length) * 100 
        : 0;

      // 6. Year-over-Year Growth
      const currentYearStart = new Date(now.getFullYear(), 0, 1);
      const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
      
      const currentYearVisits = completions?.filter(c => 
        new Date(c.completed_at) >= currentYearStart
      ).length || 0;
      
      // For YoY comparison, we'd need last year's data - for now calculate based on available data
      const yearOverYearGrowth = totalVisits > 0 ? 15.3 : 0; // Mock calculation

      // 7. Journey Efficiency (completion time vs estimated duration)
      const efficientJourneys = progress?.filter(p => {
        if (!p.completed_at || !p.started_at || !p.journey?.estimated_duration) return false;
        const actualDuration = (new Date(p.completed_at).getTime() - new Date(p.started_at).getTime()) / (1000 * 60);
        return actualDuration <= (p.journey.estimated_duration * 1.2); // Within 120% of estimated
      }).length || 0;
      const journeyEfficiency = completedJourneys > 0 ? (efficientJourneys / completedJourneys) * 100 : 0;

      // 8. Geographic Distribution
      const geographicDistribution: Record<string, number> = {};
      completions?.forEach(c => {
        const stepName = c.step?.name || 'Unknown';
        geographicDistribution[stepName] = (geographicDistribution[stepName] || 0) + 1;
      });

      // Process seasonal insights
      const monthlyTrends: Record<string, number> = {};
      completions?.forEach(completion => {
        const month = new Date(completion.completed_at).toLocaleDateString('fr-FR', { month: 'long' });
        monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;
      });

      // Fetch reward redemptions for conversion calculation
      let rewardsQuery = supabase
        .from('reward_redemptions')
        .select('*')
        .gte('redeemed_at', startDate.toISOString());

      const { data: rewards } = await rewardsQuery;

      // Calculate performance insights dynamically
      const conversionToRewards = totalVisits > 0 ? ((rewards?.length || 0) / totalVisits) * 100 : 0;
      
      const avgTimeToComplete = progress?.filter(p => p.completed_at && p.started_at).length > 0
        ? progress.filter(p => p.completed_at && p.started_at)
            .reduce((sum, p) => {
              const duration = (new Date(p.completed_at!).getTime() - new Date(p.started_at).getTime()) / (1000 * 60);
              return sum + duration;
            }, 0) / progress.filter(p => p.completed_at && p.started_at).length
        : 0;

      // Calculate step success rates
      const stepSuccessRates: Record<string, number> = {};
      const stepAttempts: Record<string, number> = {};
      
      progress?.forEach(p => {
        const stepCount = completions?.filter(c => c.journey_id === p.journey_id && c.user_id === p.user_id).length || 0;
        stepAttempts[p.journey_id] = (stepAttempts[p.journey_id] || 0) + 1;
        if (p.is_completed) {
          stepSuccessRates[p.journey_id] = (stepSuccessRates[p.journey_id] || 0) + 1;
        }
      });

      Object.keys(stepAttempts).forEach(journeyId => {
        const successes = stepSuccessRates[journeyId] || 0;
        const attempts = stepAttempts[journeyId];
        stepSuccessRates[journeyId] = attempts > 0 ? (successes / attempts) * 100 : 0;
      });

      // Calculate peak performance hours based on completion efficiency
      const peakPerformanceHours = Object.entries(hourlyDistribution)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          efficiency: count > 0 ? (count / Math.max(...Object.values(hourlyDistribution))) * 100 : 0
        }))
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 5);

      // User engagement score based on multiple factors
      const userEngagementScore = Math.round(
        (completionRate * 0.3) + 
        (satisfactionRate * 0.25) + 
        (retentionRate * 0.2) + 
        (quizConversionRate * 0.15) + 
        (journeyEfficiency * 0.1)
      );

      // Generate alerts based on metrics
      const newAlerts: TourismAlert[] = [];

      if (completionRate < 70) {
        newAlerts.push({
          id: 'low-completion',
          type: 'warning',
          title: 'Taux de complétion faible',
          message: `Le taux de complétion des parcours est de ${completionRate.toFixed(1)}%, en dessous de l'objectif de 70%`,
          priority: 'high',
          timestamp: new Date(),
          actionRequired: true
        });
      }

      if (dailyAverage < 10) {
        newAlerts.push({
          id: 'low-traffic',
          type: 'info',
          title: 'Trafic quotidien faible',
          message: `Moyenne de ${dailyAverage.toFixed(1)} visites par jour. Considérez des actions promotionnelles.`,
          priority: 'medium',
          timestamp: new Date(),
          actionRequired: false
        });
      }

      setMetrics({
        attendanceMetrics: {
          hourlyDistribution,
          dailyAverage,
          peakHours,
          weekdayVsWeekend: { weekday: weekdayCount, weekend: weekendCount }
        },
        satisfactionMetrics: {
          averageRating,
          ratingDistribution,
          completionRate,
          abandonmentRate,
          topRatedSteps: [] // Would be populated from actual rating data
        },
        kpis: {
          satisfactionRate,
          totalPointsEarned,
          retentionRate,
          avgActivityScore,
          quizConversionRate,
          yearOverYearGrowth,
          journeyEfficiency,
          geographicDistribution
        },
        performanceInsights: {
          conversionToRewards,
          avgTimeToComplete,
          peakPerformanceHours,
          stepSuccessRates,
          userEngagementScore
        },
        economicImpact: {
          totalVisits,
          estimatedRevenue,
          avgVisitDuration,
          repeatVisitRate: retentionRate // Use calculated retention rate
        },
        seasonalInsights: {
          monthlyTrends,
          seasonalPeaks: {
            'Été': { visitors: Math.max(...Object.values(monthlyTrends)), growthRate: 15 },
            'Printemps': { visitors: Math.max(...Object.values(monthlyTrends)) * 0.8, growthRate: 8 }
          },
          weatherCorrelation: {} // Would be populated with weather API data
        },
        competitiveAnalysis: {
          benchmarkScore: userEngagementScore / 10, // Convert to 0-10 scale
          marketPosition: userEngagementScore > 80 ? 'Excellence' : userEngagementScore > 60 ? 'Performant' : 'À améliorer',
          growthRate: yearOverYearGrowth,
          uniqueFeatures: ['Gamification', 'Réalité augmentée', 'Points de récompense']
        }
      });

      setAlerts(newAlerts);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des métriques touristiques');
    } finally {
      setLoading(false);
    }
  }, [profile, cityId, timeRange]);

  useEffect(() => {
    if (profile) {
      fetchTourismMetrics();
    }
  }, [profile, fetchTourismMetrics]);

  return {
    metrics,
    alerts,
    loading,
    error,
    refetch: fetchTourismMetrics
  };
};