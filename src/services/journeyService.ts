
import { supabase } from '@/integrations/supabase/client';
import { ActiveJourney, JourneyStep } from '@/types/journey';
import { getLocalizedText } from '@/utils/translations';
import type { Language } from '@/contexts/LanguageContext';
import { journeyDataSynchronizer } from './journeyDataSynchronizer';

interface JourneyCache {
  [key: string]: {
    data: ActiveJourney;
    timestamp: number;
    expiresAt: number;
  };
}

class JourneyService {
  private cache: JourneyCache = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private activeRequests = new Map<string, Promise<ActiveJourney>>();
  private abortControllers = new Map<string, AbortController>();

  // Circuit breaker state
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly MAX_FAILURES = 3;
  private readonly RESET_TIMEOUT = 30000; // 30 seconds

  private isCircuitOpen(): boolean {
    if (this.failureCount >= this.MAX_FAILURES) {
      const now = Date.now();
      if (now - this.lastFailureTime < this.RESET_TIMEOUT) {
        return true;
      } else {
        // Reset circuit breaker
        this.failureCount = 0;
        this.lastFailureTime = 0;
      }
    }
    return false;
  }

  private getCachedJourney(journeyId: string, language: Language): ActiveJourney | null {
    const cacheKey = `${journeyId}-${language}`;
    const cached = this.cache[cacheKey];
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expiresAt) {
      delete this.cache[cacheKey];
      return null;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Using cached journey:', cacheKey);
    }
    return cached.data;
  }

  private setCachedJourney(journeyId: string, journey: ActiveJourney, language: Language): void {
    const now = Date.now();
    const cacheKey = `${journeyId}-${language}`;
    this.cache[cacheKey] = {
      data: journey,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    };
  }

  async fetchJourney(journeyId: string, userId?: string, language: Language = 'fr'): Promise<ActiveJourney> {
    // Check circuit breaker
    if (this.isCircuitOpen()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔴 Circuit breaker open, rejecting request');
      }
      throw new Error('Service temporarily unavailable');
    }

    // Check cache first
    const cached = this.getCachedJourney(journeyId, language);
    if (cached) {
      return cached;
    }

    // Check if there's already a request in progress
    const requestKey = `${journeyId}-${language}`;
    const existingRequest = this.activeRequests.get(requestKey);
    if (existingRequest) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Reusing existing request for journey:', requestKey);
      }
      return existingRequest;
    }

    // Create new request
    const requestPromise = this.performJourneyFetch(journeyId, userId, language);
    this.activeRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      this.setCachedJourney(journeyId, result, language);
      this.failureCount = 0; // Reset on success
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      throw error;
    } finally {
      this.activeRequests.delete(requestKey);
    }
  }

  private async performJourneyFetch(journeyId: string, userId?: string, language: Language = 'fr'): Promise<ActiveJourney> {
    // Cancel any existing request for this journey
    const existingController = this.abortControllers.get(journeyId);
    if (existingController) {
      existingController.abort();
    }

    const abortController = new AbortController();
    this.abortControllers.set(journeyId, abortController);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Fetching journey data for:', journeyId);
      }

      // Fetch journey with steps including translations
      const { data: journeyData, error: journeyError } = await supabase
        .from('journeys')
        .select(`
          id,
          name,
          name_en,
          name_de,
          description,
          description_en,
          description_de,
          difficulty,
          estimated_duration,
          distance_km,
          total_points,
          image_url,
          journey_steps(
            step_order,
            steps(
              id,
              name,
              name_en,
              name_de,
              description,
              description_en,
              description_de,
              latitude,
              longitude,
              points_awarded,
              validation_radius,
              has_quiz,
              images
            )
          )
        `)
        .eq('id', journeyId)
        .eq('is_active', true)
        .abortSignal(abortController.signal)
        .maybeSingle();

      if (journeyError) {
        console.error('❌ Journey fetch error:', journeyError);
        throw journeyError;
      }

      if (!journeyData) {
        console.error('❌ No journey found with ID:', journeyId);
        throw new Error('Journey not found');
      }

      // Process journey steps
      const sortedSteps = journeyData.journey_steps
        ? journeyData.journey_steps
            .filter(js => js.steps)
            .sort((a, b) => a.step_order - b.step_order)
            .map(js => ({
              id: js.steps.id,
              name: getLocalizedText(
                js.steps.name,
                {
                  en: js.steps.name_en,
                  de: js.steps.name_de
                },
                language
              ),
              description: getLocalizedText(
                js.steps.description,
                {
                  en: js.steps.description_en,
                  de: js.steps.description_de
                },
                language
              ),
              latitude: js.steps.latitude,
              longitude: js.steps.longitude,
              points_awarded: js.steps.points_awarded,
              validation_radius: js.steps.validation_radius || 50,
              has_quiz: js.steps.has_quiz || false,
              images: js.steps.images || []
            }))
        : [];

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Processed steps:', sortedSteps.length);
      }

      // Fetch user progress and completed steps if userId is provided
      let progressData = null;
      let completedStepIndices: number[] = [];
      let totalPointsEarned = 0;
      
      if (userId && sortedSteps.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Fetching user progress for user:', userId);
        }

        // Check for data inconsistencies and auto-fix if needed
        try {
          const hasInconsistencies = await journeyDataSynchronizer.hasInconsistencies(userId, journeyId);
          if (hasInconsistencies) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔧 Data inconsistencies detected, auto-synchronizing...');
            }
            await journeyDataSynchronizer.fullSynchronization(userId, journeyId);
          }
        } catch (error) {
          console.warn('⚠️ Error during auto-sync (non-critical):', error);
        }
        
        // Fetch user journey progress
        const { data: progress, error: progressError } = await supabase
          .from('user_journey_progress')
          .select('*')
          .eq('journey_id', journeyId)
          .eq('user_id', userId)
          .abortSignal(abortController.signal)
          .maybeSingle();

        if (progressError && progressError.name !== 'AbortError') {
          console.warn('⚠️ Progress fetch error (non-critical):', progressError);
        } else if (progress) {
          progressData = progress;
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ User progress found:', progressData);
          }
        } else if (!progressError) {
          // Create progress record
          if (process.env.NODE_ENV === 'development') {
            console.log('📝 Creating initial progress record...');
          }
          const { data: newProgress, error: insertError } = await supabase
            .from('user_journey_progress')
            .insert({
              user_id: userId,
              journey_id: journeyId,
              current_step_order: 1,
              is_completed: false,
              total_points_earned: 0
            })
            .select()
            .single();

          if (insertError && insertError.code !== '23505') {
            console.warn('⚠️ Error creating progress (non-critical):', insertError);
          } else if (newProgress) {
            progressData = newProgress;
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Initial progress created:', progressData);
            }
          }
        }

        // SINGLE SOURCE OF TRUTH: Get completed steps from step_completions table
        const { data: stepCompletions, error: completionsError } = await supabase
          .from('step_completions')
          .select('step_id, points_earned')
          .eq('user_id', userId)
          .eq('journey_id', journeyId)
          .abortSignal(abortController.signal);

        if (completionsError && completionsError.name !== 'AbortError') {
          console.warn('⚠️ Step completions fetch error (non-critical):', completionsError);
        } else if (stepCompletions) {
          // Create step ID to index mapping
          const stepIdToIndex = new Map<string, number>();
          sortedSteps.forEach((step, index) => {
            stepIdToIndex.set(step.id, index);
          });

          // Convert step completions to indices and calculate total points
          completedStepIndices = stepCompletions
            .map(completion => stepIdToIndex.get(completion.step_id))
            .filter((index): index is number => index !== undefined)
            .sort((a, b) => a - b);
          
          totalPointsEarned = stepCompletions.reduce((total, completion) => {
            return total + (completion.points_earned || 0);
          }, 0);

          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Step completions (single source of truth):', {
              completedIndices: completedStepIndices,
              totalPoints: totalPointsEarned,
              completionsCount: stepCompletions.length
            });
          }
        }
      }

      // Build the journey object with localized content
      const journey: ActiveJourney = {
        id: journeyData.id,
        name: getLocalizedText(
          journeyData.name,
          {
            en: journeyData.name_en,
            de: journeyData.name_de
          },
          language
        ),
        description: getLocalizedText(
          journeyData.description,
          {
            en: journeyData.description_en,
            de: journeyData.description_de
          },
          language
        ),
        steps: sortedSteps,
        currentStepIndex: progressData?.current_step_order ? Math.max(0, progressData.current_step_order - 1) : 0,
        completedSteps: completedStepIndices || [],
        totalPointsEarned: totalPointsEarned, // Use the calculated value from step_completions
        userJourneyProgressId: progressData?.id, // Include progress record ID
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Journey service: journey created successfully:', journey.name);
      }
      return journey;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🛑 Journey fetch aborted for:', journeyId);
        throw new Error('Request cancelled');
      }
      
      console.error('❌ Journey service error:', error);
      throw error;
    } finally {
      this.abortControllers.delete(journeyId);
    }
  }

  // Clear cache for a specific journey (all languages)
  clearJourneyCache(journeyId: string): void {
    const keysToDelete = Object.keys(this.cache).filter(key => key.startsWith(journeyId));
    keysToDelete.forEach(key => delete this.cache[key]);
    if (process.env.NODE_ENV === 'development') {
      console.log('🗑️ Cleared cache for journey:', journeyId, 'keys:', keysToDelete.length);
    }
  }

  // Clear all cache
  clearAllCache(): void {
    this.cache = {};
    if (process.env.NODE_ENV === 'development') {
      console.log('🗑️ Cleared all journey cache');
    }
  }

  // Cancel all active requests
  cancelAllRequests(): void {
    for (const [journeyId, controller] of this.abortControllers.entries()) {
      controller.abort();
      if (process.env.NODE_ENV === 'development') {
        console.log('🛑 Cancelled request for journey:', journeyId);
      }
    }
    this.abortControllers.clear();
    this.activeRequests.clear();
  }
}

export const journeyService = new JourneyService();
