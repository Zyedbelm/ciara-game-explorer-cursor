
import { supabase } from '@/integrations/supabase/client';
import { getCityImage } from '@/utils/cityImageHelpers';

export interface GenerationCriteria {
  duration?: number;
  difficulty?: string;
  interests?: string[];
  groupSize?: string;
  startLocation?: string;
  language?: string;
}

export interface UserJourneyProgress {
  id: string;
  journeyId: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  status: 'saved' | 'in_progress' | 'completed' | 'abandoned';
  progress: number;
  currentStep: number;
  totalSteps: number;
  pointsEarned: number;
  totalPoints: number;
  imageUrl: string;
  lastActivity: string;
  completedDate?: string;
  duration?: string;
  rating?: number;
  estimatedDuration?: string;
  citySlug: string;
  generationCriteria?: GenerationCriteria;
  generatedAt?: string;
  generationSource?: string;
  acquiredAt?: string;
  userComment?: string;
}

export interface UserStats {
  totalJourneys: number;
  completedJourneys: number;
  inProgressJourneys: number;
  totalPoints: number;
  averageRating: number;
  totalSteps: number;
  completedSteps: number;
  favoriteCategory: string;
  level: number;
  achievements: string[];
}

export interface PopularJourney {
  id: string;
  name: string;
  completions: number;
  averageRating: number;
}

export interface AggregatedUserStats {
  totalUsers: number;
  activeUsers: number;
  completedJourneys: number;
  totalPoints: number;
  averageCompletionRate: number;
  popularJourneys: PopularJourney[];
}

class UserJourneysService {
  async getUserJourneyProgress(userId: string, language: string = 'fr'): Promise<UserJourneyProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_journey_progress')
        .select(`
          id,
          journey_id,
          status,
          current_step_order,
          total_points_earned,
          is_completed,
          completed_at,
          created_at,
          updated_at,
          acquired_at,
          generation_criteria,
          generated_at,
          generation_source,
          user_rating,
          user_comment,
          journeys!inner (
            id,
            name,
            description,
            difficulty,
            estimated_duration,
            total_points,
            image_url,
            cities!inner (
              name,
              slug,
              hero_image_url
            ),
            journey_categories!inner (
              name,
              type
            ),
            journey_steps!inner (
              step_order
            )
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Pour chaque parcours, calculer les points réels depuis les quiz et les points gagnés
      const progressData: UserJourneyProgress[] = await Promise.all(
        data.map(async (progress: any) => {
          const journey = progress.journeys;
          const totalSteps = journey.journey_steps?.length || 1;
          const currentStep = progress.current_step_order || 1;
          const progressPercentage = Math.round((currentStep / totalSteps) * 100);

          // 1. Calculer le VRAI total de points possible (étapes + quiz)
          const { data: journeyStepsData } = await supabase
            .from('journey_steps')
            .select(`
              step_id,
              steps!inner (
                id,
                points_awarded
              )
            `)
            .eq('journey_id', journey.id);

          let realTotalPoints = 0;
          
          if (journeyStepsData && journeyStepsData.length > 0) {
            // Points des étapes
            const stepPoints = journeyStepsData.reduce((sum, js) => 
              sum + (js.steps.points_awarded || 0), 0
            );

            // Points des quiz
            const stepIds = journeyStepsData.map(js => js.step_id);
            const { data: quizData } = await supabase
              .from('quiz_questions')
              .select('points_awarded, step_id')
              .in('step_id', stepIds);

            const quizPoints = quizData?.reduce((sum, quiz) => 
              sum + (quiz.points_awarded || 0), 0
            ) || 0;

            realTotalPoints = stepPoints + quizPoints;
          }

          // Si pas de données trouvées, utiliser la valeur par défaut du parcours
          if (realTotalPoints === 0) {
            realTotalPoints = journey.total_points || 0;
          }

          // 2. Calculer les points réellement gagnés depuis step_completions (source de vérité)
          const { data: stepCompletions, error: completionsError } = await supabase
            .from('step_completions')
            .select('points_earned')
            .eq('user_id', userId)
            .eq('journey_id', journey.id);

          let realPointsEarned = 0;
          if (!completionsError && stepCompletions) {
            realPointsEarned = stepCompletions.reduce((sum, completion) => 
              sum + (completion.points_earned || 0), 0
            );
          } else if (completionsError) {
            // Use the progress total as fallback only
            realPointsEarned = progress.total_points_earned || 0;
          }

          // Get estimated duration in readable format
          let estimatedDuration = '';
          if (journey.estimated_duration) {
            const hours = Math.floor(journey.estimated_duration / 60);
            const minutes = journey.estimated_duration % 60;
            if (hours > 0) {
              estimatedDuration = `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
            } else {
              estimatedDuration = `${minutes}min`;
            }
          }

          return {
            id: progress.id,
            journeyId: journey.id,
            title: journey.name,
            description: journey.description || '',
            category: journey.journey_categories?.name || 'Général',
            difficulty: journey.difficulty || 'Modéré',
            status: progress.status,
            progress: progress.status === 'completed' ? 100 : progressPercentage,
            currentStep: currentStep,
            totalSteps: totalSteps,
            pointsEarned: realPointsEarned, // Points vraiment gagnés
            totalPoints: realTotalPoints, // Points totaux calculés depuis les quiz
            imageUrl: journey.image_url || getCityImage({ 
              hero_image_url: journey.cities?.hero_image_url,
              name: journey.cities?.name || 'Unknown City',
              slug: journey.cities?.slug 
            }),
            lastActivity: progress.updated_at,
            completedDate: progress.completed_at,
            estimatedDuration: estimatedDuration,
            citySlug: journey.cities?.slug || '',
            generationCriteria: progress.generation_criteria || undefined,
            generatedAt: progress.generated_at || undefined,
            generationSource: progress.generation_source || 'manual',
            acquiredAt: progress.acquired_at || undefined,
            rating: progress.user_rating || undefined,
            userComment: progress.user_comment || undefined,
          };
        })
      );

      return progressData;

    } catch (error) {
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Get user's total points from profile (le vrai total de tous les parcours)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (profileError) {
      }

      // Get user's journey progress
      const journeyProgress = await this.getUserJourneyProgress(userId);
      
      const totalJourneys = journeyProgress.length;
      const completedJourneys = journeyProgress.filter(j => j.status === 'completed').length;
      const inProgressJourneys = journeyProgress.filter(j => j.status === 'in_progress').length;
      
      // Utiliser les points réels du profil au lieu de la somme des parcours
      const totalPoints = profileData?.total_points || 0;
      
      // Calculate average rating (simulated for now)
      const averageRating = 4.2;
      
      // Calculate total steps
      const totalSteps = journeyProgress.reduce((sum, j) => sum + j.totalSteps, 0);
      const completedSteps = journeyProgress.reduce((sum, j) => sum + j.currentStep, 0);
      
      // Find favorite category
      const categoryCount: { [key: string]: number } = {};
      journeyProgress.forEach(j => {
        categoryCount[j.category] = (categoryCount[j.category] || 0) + 1;
      });
      const favoriteCategory = Object.keys(categoryCount).length > 0 
        ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b)
        : 'Aucune';

      // Calculate level based on points
      const level = Math.floor(totalPoints / 100) + 1;

      // Simulated achievements
      const achievements: string[] = [];
      if (completedJourneys > 0) achievements.push('Premier parcours');
      if (completedJourneys >= 5) achievements.push('Explorateur');
      if (totalPoints >= 500) achievements.push('Collectionneur de points');

      return {
        totalJourneys,
        completedJourneys,
        inProgressJourneys,
        totalPoints,
        averageRating,
        totalSteps,
        completedSteps,
        favoriteCategory,
        level,
        achievements
      };

    } catch (error) {
      throw error;
    }
  }

  async getAggregatedUserStats(cityId?: string, activityPeriodDays: number = 30): Promise<AggregatedUserStats> {
    try {
      // Build base query for user journey progress
      let progressQuery = supabase
        .from('user_journey_progress')
        .select(`
          status,
          total_points_earned,
          user_id,
          created_at,
          journeys!inner (
            id,
            name,
            city_id
          )
        `);

      // Filter by city if specified
      if (cityId) {
        progressQuery = progressQuery.eq('journeys.city_id', cityId);
      }

      const { data: progressData, error: progressError } = await progressQuery;

      if (progressError) {
        throw progressError;
      }

      // Calculate activity period date
      const activityCutoff = new Date();
      activityCutoff.setDate(activityCutoff.getDate() - activityPeriodDays);

      // Get step completions for active user calculation
      let stepCompletionsQuery = supabase
        .from('step_completions')
        .select(`
          user_id,
          completed_at,
          steps!inner (
            city_id
          )
        `)
        .gte('completed_at', activityCutoff.toISOString());

      if (cityId) {
        stepCompletionsQuery = stepCompletionsQuery.eq('steps.city_id', cityId);
      }

      const { data: stepCompletions, error: stepError } = await stepCompletionsQuery;
      if (stepError) {
        throw stepError;
      }

      // Calculate metrics
      const uniqueUsers = new Set(progressData?.map(p => p.user_id) || []).size;
      
      // Calculate real active users based on recent activity
      const activeUserIds = new Set<string>();
      
      // Users who completed steps in the activity period
      stepCompletions?.forEach(completion => {
        activeUserIds.add(completion.user_id);
      });
      
      // Users who started journeys in the activity period
      progressData?.forEach(progress => {
        const startedAt = new Date(progress.created_at || '');
        if (startedAt >= activityCutoff) {
          activeUserIds.add(progress.user_id);
        }
      });
      
      const activeUsers = activeUserIds.size;
      
      const completedJourneys = progressData?.filter(p => p.status === 'completed').length || 0;
      const totalPoints = progressData?.reduce((sum, p) => sum + (p.total_points_earned || 0), 0) || 0;
      
      const totalJourneys = progressData?.length || 1;
      const averageCompletionRate = (completedJourneys / totalJourneys) * 100;

      // Get popular journeys
      const journeyCompletions: { [key: string]: { name: string; count: number } } = {};
      
      progressData?.forEach(p => {
        if (p.status === 'completed' && p.journeys) {
          const journeyId = p.journeys.id;
          const journeyName = p.journeys.name;
          
          if (!journeyCompletions[journeyId]) {
            journeyCompletions[journeyId] = { name: journeyName, count: 0 };
          }
          journeyCompletions[journeyId].count++;
        }
      });

      const popularJourneys: PopularJourney[] = Object.entries(journeyCompletions)
        .map(([id, data]) => ({
          id,
          name: data.name,
          completions: data.count,
          averageRating: 4.2 // Simulated
        }))
        .sort((a, b) => b.completions - a.completions)
        .slice(0, 5);

      const result: AggregatedUserStats = {
        totalUsers: uniqueUsers,
        activeUsers,
        completedJourneys,
        totalPoints,
        averageCompletionRate,
        popularJourneys
      };

      return result;

    } catch (error) {
      throw error;
    }
  }

  async updateJourneyStatus(progressId: string, status: 'saved' | 'in_progress' | 'completed' | 'abandoned'): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      // If marking as completed, also set completed_at
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.is_completed = true;
      } else {
        updateData.is_completed = false;
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('user_journey_progress')
        .update(updateData)
        .eq('id', progressId);

      if (error) {
        throw error;
      }

      } catch (error) {
      throw error;
    }
  }

  async abandonJourney(progressId: string): Promise<void> {
    return this.updateJourneyStatus(progressId, 'abandoned');
  }
}

export const userJourneysService = new UserJourneysService();
