import { supabase } from '@/integrations/supabase/client';

export interface SyncResult {
  success: boolean;
  stepsProcessed: number;
  inconsistenciesFound: number;
  inconsistenciesFixed: number;
  errors: string[];
}

export interface SyncDiagnostics {
  userId: string;
  journeyId: string;
  stepCompletions: Array<{
    stepId: string;
    stepIndex: number;
    pointsEarned: number;
    completedAt: string;
  }>;
  quizResponses: Array<{
    stepIndex: number;
    pointsEarned?: number;
  }>;
  missingFromQuizResponses: number[];
  extraInQuizResponses: number[];
  totalInconsistencies: number;
}

class JourneyDataSynchronizer {
  /**
   * Diagnose data inconsistencies between step_completions and quiz_responses
   * This helps identify the scope of the problem before fixing
   */
  async diagnoseInconsistencies(userId: string, journeyId: string): Promise<SyncDiagnostics> {
    try {
      // Get journey steps to map step IDs to indices
      const { data: journeySteps, error: journeyError } = await supabase
        .from('journey_steps')
        .select(`
          step_order,
          step_id,
          steps(id)
        `)
        .eq('journey_id', journeyId)
        .order('step_order');

      if (journeyError) {
        throw new Error(`Failed to fetch journey steps: ${journeyError.message}`);
      }

      // Create step ID to index mapping
      const stepIdToIndex = new Map<string, number>();
      journeySteps?.forEach((js, index) => {
        stepIdToIndex.set(js.step_id, index);
      });

      // Get actual step completions from database
      const { data: stepCompletions, error: completionsError } = await supabase
        .from('step_completions')
        .select('step_id, points_earned, completed_at')
        .eq('user_id', userId)
        .eq('journey_id', journeyId);

      if (completionsError) {
        throw new Error(`Failed to fetch step completions: ${completionsError.message}`);
      }

      // Get quiz responses from user_journey_progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_journey_progress')
        .select('quiz_responses')
        .eq('user_id', userId)
        .eq('journey_id', journeyId)
        .maybeSingle();

      if (progressError) {
        throw new Error(`Failed to fetch progress data: ${progressError.message}`);
      }

      // Parse quiz responses
      let quizResponses: Array<{ stepIndex: number; pointsEarned?: number }> = [];
      if (progressData?.quiz_responses) {
        try {
          const responses = Array.isArray(progressData.quiz_responses) ? progressData.quiz_responses : [];
          quizResponses = responses
            .filter((r: any) => r && typeof r.stepIndex === 'number')
            .map((r: any) => ({
              stepIndex: r.stepIndex,
              pointsEarned: r.pointsEarned
            }));
        } catch (error) {
          console.warn('Error parsing quiz_responses:', error);
        }
      }

      // Convert step completions to indices
      const completionsWithIndices = (stepCompletions || []).map(completion => {
        const stepIndex = stepIdToIndex.get(completion.step_id);
        return {
          stepId: completion.step_id,
          stepIndex: stepIndex ?? -1,
          pointsEarned: completion.points_earned || 0,
          completedAt: completion.completed_at
        };
      }).filter(c => c.stepIndex >= 0);

      // Find inconsistencies
      const completedIndices = new Set(completionsWithIndices.map(c => c.stepIndex));
      const quizResponseIndices = new Set(quizResponses.map(r => r.stepIndex));

      const missingFromQuizResponses = Array.from(completedIndices).filter(index => !quizResponseIndices.has(index));
      const extraInQuizResponses = Array.from(quizResponseIndices).filter(index => !completedIndices.has(index));

      return {
        userId,
        journeyId,
        stepCompletions: completionsWithIndices,
        quizResponses,
        missingFromQuizResponses,
        extraInQuizResponses,
        totalInconsistencies: missingFromQuizResponses.length + extraInQuizResponses.length
      };
    } catch (error) {
      console.error('Error diagnosing inconsistencies:', error);
      throw error;
    }
  }

  /**
   * Synchronize quiz_responses with step_completions data
   * Makes step_completions the single source of truth
   */
  async synchronizeJourneyData(userId: string, journeyId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      stepsProcessed: 0,
      inconsistenciesFound: 0,
      inconsistenciesFixed: 0,
      errors: []
    };

    try {
      console.log(`🔧 [SYNC] Starting synchronization for user ${userId}, journey ${journeyId}`);

      // First, diagnose the current state
      const diagnostics = await this.diagnoseInconsistencies(userId, journeyId);
      result.inconsistenciesFound = diagnostics.totalInconsistencies;

      console.log(`📊 [SYNC] Found ${diagnostics.totalInconsistencies} inconsistencies`);
      console.log(`📋 [SYNC] Step completions:`, diagnostics.stepCompletions);
      console.log(`📝 [SYNC] Current quiz responses:`, diagnostics.quizResponses);

      if (diagnostics.totalInconsistencies === 0) {
        console.log(`✅ [SYNC] No inconsistencies found, data already synchronized`);
        result.success = true;
        return result;
      }

      // Use the database repair function for robust data synchronization
      const { data: repairResult, error: repairError } = await supabase
        .rpc('repair_journey_data', {
          p_user_id: userId,
          p_journey_id: journeyId
        });

      if (repairError) {
        console.error(`❌ [SYNC] Database repair function failed:`, repairError);
        result.errors.push(`Database repair failed: ${repairError.message}`);
        return result;
      }

      // Cast the result to proper type
      const repair = repairResult as any;
      
      if (!repair?.success) {
        const errorMsg = repair?.error || 'Unknown repair error';
        console.error(`❌ [SYNC] Repair function returned failure:`, errorMsg);
        result.errors.push(`Repair function failed: ${errorMsg}`);
        return result;
      }

      console.log(`🔧 [SYNC] Database repair completed:`, repair);

      // Update user's total points in profiles based on ALL their step completions
      const { data: allUserPoints, error: pointsError } = await supabase
        .from('step_completions')
        .select('points_earned')
        .eq('user_id', userId);

      if (!pointsError && allUserPoints) {
        const totalUserPoints = allUserPoints.reduce((sum, completion) => 
          sum + (completion.points_earned || 0), 0
        );

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            total_points: totalUserPoints,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (profileError) {
          console.warn(`⚠️ [SYNC] Failed to update profile points:`, profileError);
          result.errors.push(`Failed to update profile points: ${profileError.message}`);
        } else {
          console.log(`🎯 [SYNC] Updated user total points to ${totalUserPoints}`);
        }
      }

      result.success = true;
      result.stepsProcessed = repair.steps_processed || 0;
      result.inconsistenciesFixed = diagnostics.totalInconsistencies;

      console.log(`✅ [SYNC] Synchronization complete: ${result.inconsistenciesFixed} inconsistencies fixed`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      console.error('❌ [SYNC] Synchronization failed:', error);
      return result;
    }
  }

  /**
   * Check if a specific user-journey combination has data inconsistencies
   */
  async hasInconsistencies(userId: string, journeyId: string): Promise<boolean> {
    try {
      const diagnostics = await this.diagnoseInconsistencies(userId, journeyId);
      return diagnostics.totalInconsistencies > 0;
    } catch (error) {
      console.error('Error checking for inconsistencies:', error);
      return false;
    }
  }

  /**
   * Clean up test data and ghost completions
   * Removes orphaned step_completions that don't correspond to valid journey steps
   */
  async cleanupGhostData(userId: string, journeyId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      stepsProcessed: 0,
      inconsistenciesFound: 0,
      inconsistenciesFixed: 0,
      errors: []
    };

    try {
      // Get valid step IDs for this journey
      const { data: validSteps, error: stepsError } = await supabase
        .from('journey_steps')
        .select('step_id')
        .eq('journey_id', journeyId);

      if (stepsError) {
        result.errors.push(`Failed to fetch valid steps: ${stepsError.message}`);
        return result;
      }

      const validStepIds = validSteps?.map(s => s.step_id) || [];

      // Find ghost completions (step_completions for steps not in this journey)
      const { data: allCompletions, error: completionsError } = await supabase
        .from('step_completions')
        .select('id, step_id')
        .eq('user_id', userId)
        .eq('journey_id', journeyId);

      if (completionsError) {
        result.errors.push(`Failed to fetch completions: ${completionsError.message}`);
        return result;
      }

      const ghostCompletions = (allCompletions || []).filter(completion => 
        !validStepIds.includes(completion.step_id)
      );

      result.inconsistenciesFound = ghostCompletions.length;

      if (ghostCompletions.length > 0) {
        console.log(`🧹 Cleaning up ${ghostCompletions.length} ghost completions`);

        // Delete ghost completions
        const { error: deleteError } = await supabase
          .from('step_completions')
          .delete()
          .in('id', ghostCompletions.map(g => g.id));

        if (deleteError) {
          result.errors.push(`Failed to delete ghost completions: ${deleteError.message}`);
          return result;
        }

        result.inconsistenciesFixed = ghostCompletions.length;
      }

      result.success = true;
      console.log(`✅ Ghost data cleanup complete: ${result.inconsistenciesFixed} ghost completions removed`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      console.error('❌ Ghost cleanup failed:', error);
      return result;
    }
  }

  /**
   * Manual repair function - use the database repair function directly
   */
  async manualRepair(userId: string, journeyId: string): Promise<SyncResult> {
    try {
      console.log(`🔧 [MANUAL] Starting manual repair for user ${userId}, journey ${journeyId}`);

      const { data: repairResult, error: repairError } = await supabase
        .rpc('repair_journey_data', {
          p_user_id: userId,
          p_journey_id: journeyId
        });

      if (repairError) {
        console.error(`❌ [MANUAL] Manual repair failed:`, repairError);
        return {
          success: false,
          stepsProcessed: 0,
          inconsistenciesFound: 0,
          inconsistenciesFixed: 0,
          errors: [`Manual repair failed: ${repairError.message}`]
        };
      }

      // Cast the result to proper type
      const repair = repairResult as any;
      console.log(`✅ [MANUAL] Manual repair completed:`, repair);

      return {
        success: repair?.success || false,
        stepsProcessed: repair?.steps_processed || 0,
        inconsistenciesFound: 0,
        inconsistenciesFixed: repair?.steps_processed || 0,
        errors: repair?.success ? [] : [repair?.error || 'Unknown error']
      };

    } catch (error) {
      console.error('❌ [MANUAL] Manual repair failed:', error);
      return {
        success: false,
        stepsProcessed: 0,
        inconsistenciesFound: 0,
        inconsistenciesFixed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Full synchronization process: cleanup ghosts + synchronize data
   */
  async fullSynchronization(userId: string, journeyId: string): Promise<SyncResult> {
    try {
      console.log(`🔄 [FULL] Starting full synchronization for user ${userId}, journey ${journeyId}`);

      // Step 1: Clean up ghost data
      const cleanupResult = await this.cleanupGhostData(userId, journeyId);
      if (!cleanupResult.success) {
        console.error('❌ [FULL] Ghost cleanup failed, aborting synchronization');
        return cleanupResult;
      }

      // Step 2: Synchronize remaining data using improved method
      const syncResult = await this.synchronizeJourneyData(userId, journeyId);
      if (!syncResult.success) {
        console.error('❌ [FULL] Data synchronization failed');
        return syncResult;
      }

      // Combine results
      const combinedResult: SyncResult = {
        success: true,
        stepsProcessed: syncResult.stepsProcessed,
        inconsistenciesFound: cleanupResult.inconsistenciesFound + syncResult.inconsistenciesFound,
        inconsistenciesFixed: cleanupResult.inconsistenciesFixed + syncResult.inconsistenciesFixed,
        errors: [...cleanupResult.errors, ...syncResult.errors]
      };

      console.log(`✅ [FULL] Full synchronization complete: ${combinedResult.inconsistenciesFixed} total inconsistencies fixed`);
      return combinedResult;

    } catch (error) {
      console.error('❌ [FULL] Full synchronization failed:', error);
      return {
        success: false,
        stepsProcessed: 0,
        inconsistenciesFound: 0,
        inconsistenciesFixed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

export const journeyDataSynchronizer = new JourneyDataSynchronizer();