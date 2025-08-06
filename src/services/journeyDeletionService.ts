import { supabase } from '@/integrations/supabase/client';
import { journeyService } from './journeyService';

interface DeletionResult {
  success: boolean;
  deleted_steps: number;
  deleted_progress: number;
  points_removed: number;
  error?: string;
}

interface ResetResult {
  success: boolean;
  deleted_steps: number;
  points_removed: number;
  progress_id: string;
  error?: string;
}

class JourneyDeletionService {
  
  /**
   * Completely delete a user's journey progress and all associated step completions
   */
  async deleteJourneyCompletely(userId: string, journeyId: string): Promise<DeletionResult> {
    try {
      const { data, error } = await supabase.rpc('delete_user_journey_completely', {
        p_user_id: userId,
        p_journey_id: journeyId
      });

      if (error) {
        throw error;
      }

      // Clear the journey cache to prevent stale data
      journeyService.clearJourneyCache(journeyId);
      
      return data as unknown as DeletionResult;
      
    } catch (error) {
      return {
        success: false,
        deleted_steps: 0,
        deleted_progress: 0,
        points_removed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Reset a completed journey for replay - clean slate approach
   */
  async resetJourneyForReplay(userId: string, journeyId: string): Promise<ResetResult> {
    try {
      const { data, error } = await supabase.rpc('reset_journey_for_replay', {
        p_user_id: userId,
        p_journey_id: journeyId
      });

      if (error) {
        throw error;
      }

      // Clear the journey cache to prevent stale data
      journeyService.clearJourneyCache(journeyId);
      
      return data as unknown as ResetResult;
      
    } catch (error) {
      return {
        success: false,
        deleted_steps: 0,
        points_removed: 0,
        progress_id: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Acquire a completed journey (mark as permanently owned by user)
   */
  async acquireCompletedJourney(userId: string, journeyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_journey_progress')
        .update({ 
          acquired_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('journey_id', journeyId)
        .eq('is_completed', true);

      if (error) {
        return false;
      }

      return true;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a journey exists and is accessible
   */
  async validateJourneyExists(journeyId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('journeys')
        .select('id, is_active')
        .eq('id', journeyId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check for conflicting step completions (ghost validations)
   */
  async checkForGhostValidations(userId: string, journeyId: string): Promise<{
    hasConflicts: boolean;
    conflictingSteps: string[];
  }> {
    try {
      // Get journey steps
      const { data: journeySteps, error: stepsError } = await supabase
        .from('journey_steps')
        .select('step_id')
        .eq('journey_id', journeyId);

      if (stepsError || !journeySteps) {
        return { hasConflicts: false, conflictingSteps: [] };
      }

      const stepIds = journeySteps.map(js => js.step_id);

      // Check for existing step completions
      const { data: completions, error: completionsError } = await supabase
        .from('step_completions')
        .select('step_id')
        .eq('user_id', userId)
        .in('step_id', stepIds);

      if (completionsError) {
        return { hasConflicts: false, conflictingSteps: [] };
      }

      const conflictingSteps = completions?.map(c => c.step_id) || [];
      const hasConflicts = conflictingSteps.length > 0;

      if (hasConflicts) {
      } else {
        }

      return { hasConflicts, conflictingSteps };
      
    } catch (error) {
      return { hasConflicts: false, conflictingSteps: [] };
    }
  }
}

export const journeyDeletionService = new JourneyDeletionService();