import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ActiveJourney, JourneyStep } from '@/types/journey';
import { journeyService } from '@/services/journeyService';
import { journeyDataSynchronizer } from '@/services/journeyDataSynchronizer';
import { supabase } from '@/integrations/supabase/client';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface StepValidationResult {
  success: boolean;
  reason: string;
  pointsEarned?: number;
  journeyCompleted?: boolean;
}

interface JourneyStateData {
  journey: ActiveJourney | null;
  loading: boolean;
  validatingStep: boolean;
  currentStepIndex: number;
  completedSteps: number[];
  totalPointsEarned: number;
  isJourneyComplete: boolean;
}

/**
 * Master hook that consolidates ALL journey-related state and logic
 * This eliminates hook order issues and state duplication
 */
export function useStableJourneyState(
  journeyId: string,
  onJourneyCompletion?: (journey: ActiveJourney, totalPoints: number) => void
) {
  // Core state - consolidated in one place
  const [state, setState] = useState<JourneyStateData>({
    journey: null,
    loading: true,
    validatingStep: false,
    currentStepIndex: 0,
    completedSteps: [],
    totalPointsEarned: 0,
    isJourneyComplete: false,
  });

  // Stable references
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();
  
  // Refs for preventing double validation and callback stability
  const lastValidationTime = useRef<number>(0);
  const validatingStepId = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const stableOnJourneyCompletion = useRef(onJourneyCompletion);

  // Update callback ref
  useEffect(() => {
    stableOnJourneyCompletion.current = onJourneyCompletion;
  }, [onJourneyCompletion]);

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Convert to meters
  }, []);

  // Fetch journey data - single source of truth
  const fetchJourneyData = useCallback(async () => {
    if (!journeyId || isFetchingRef.current) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      isFetchingRef.current = true;
      setState(prev => ({ ...prev, loading: true }));

      const journeyData = await journeyService.fetchJourney(journeyId, user?.id, currentLanguage);
      
      // The synchronizer automatically handles data inconsistencies during journey fetch
      
      // Calculate derived state once
      const currentStep = journeyData.completedSteps.length < journeyData.steps.length
        ? journeyData.completedSteps.length
        : Math.max(0, journeyData.steps.length - 1);
      
      const isComplete = journeyData.completedSteps.length >= journeyData.steps.length;

      setState(prev => ({
        ...prev,
        journey: journeyData,
        currentStepIndex: currentStep,
        completedSteps: journeyData.completedSteps || [],
        totalPointsEarned: journeyData.totalPointsEarned || 0,
        isJourneyComplete: isComplete,
        loading: false,
      }));

    } catch (error) {
      if (error instanceof Error && error.message !== 'Request cancelled') {
        toast({
          title: "Erreur de chargement",
          description: error.message || "Impossible de charger le parcours",
          variant: "destructive",
        });
      }
      
      setState(prev => ({
        ...prev,
        journey: null,
        loading: false,
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [journeyId, user?.id, currentLanguage, toast]);

  // Initialize journey - controlled execution
  const initializeJourney = useCallback(() => {
    if (!isInitializedRef.current && journeyId) {
      isInitializedRef.current = true;
      fetchJourneyData();
    }
  }, [journeyId, fetchJourneyData]);

  // Check if step is completed
  const isStepCompleted = useCallback((stepIndex: number): boolean => {
    if (typeof stepIndex !== 'number' || stepIndex < 0) {
      return false;
    }
    return state.completedSteps.includes(stepIndex);
  }, [state.completedSteps]);

  // Validate step location - consolidated logic
  const validateStepLocation = useCallback(async (
    step: JourneyStep, 
    location: LocationCoords
  ): Promise<StepValidationResult> => {
    if (!user || !state.journey || !state.journey.steps || !step) {
      return { success: false, reason: 'missing_requirements' };
    }

    // Prevent duplicate validations
    const now = Date.now();
    if (now - lastValidationTime.current < 3000 || validatingStepId.current === step.id) {
      return { success: false, reason: 'duplicate_validation' };
    }

    const stepIndex = state.journey.steps.findIndex(s => s.id === step.id);
    if (state.completedSteps.includes(stepIndex)) {
      toast({
        title: 'Étape déjà validée',
        description: 'Cette étape est déjà complétée',
      });
      return { success: true, reason: 'already_completed' };
    }

    setState(prev => ({ ...prev, validatingStep: true }));
    validatingStepId.current = step.id;
    lastValidationTime.current = now;

    try {
      // Calculate distance
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        step.latitude,
        step.longitude
      );

      if (distance > step.validation_radius) {
        toast({
          title: 'Erreur',
          description: `Vous devez être à moins de ${step.validation_radius}m du point d'intérêt (${Math.round(distance)}m)`,
          variant: 'destructive',
        });
        return { success: false, reason: 'too_far' };
      }

      // Check database for existing completion
      const { data: existingCompletion } = await supabase
        .from('step_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('step_id', step.id)
        .maybeSingle();

      if (existingCompletion) {
        toast({
          title: 'Succès',
          description: 'Cette étape est déjà validée',
        });
        return { success: true, reason: 'already_completed' };
      }

      // Record completion
      const { error: completionError } = await supabase
        .from('step_completions')
        .insert({
          user_id: user.id,
          step_id: step.id,
          journey_id: state.journey.id,
          points_earned: step.points_awarded,
          validation_method: 'geolocation'
        });

      if (completionError) {
        if (completionError.code === '23505') {
          toast({
            title: 'Information',
            description: 'Cette étape est déjà validée',
          });
          return { success: true, reason: 'already_completed' };
        }
        throw completionError;
      }

      // Update state in one atomic operation
      const newCompletedSteps = [...state.completedSteps, stepIndex];
      const newTotalPoints = state.totalPointsEarned + step.points_awarded;
      const journeyNowComplete = newCompletedSteps.length >= state.journey.steps.length;
      const newCurrentStep = journeyNowComplete ? stepIndex : stepIndex + 1;

      setState(prev => ({
        ...prev,
        completedSteps: newCompletedSteps,
        totalPointsEarned: newTotalPoints,
        currentStepIndex: newCurrentStep,
        isJourneyComplete: journeyNowComplete,
        validatingStep: false,
      }));

      // Trigger data synchronization after the step completion is recorded
      // This ensures quiz_responses are rebuilt correctly from step_completions
      try {
        console.log(`🔄 [STEP-VALIDATION] Synchronizing data after step completion...`);
        const syncResult = await journeyDataSynchronizer.synchronizeJourneyData(user.id, state.journey.id);
        
        if (syncResult.success) {
          console.log(`✅ [STEP-VALIDATION] Data synchronized successfully`);
        } else {
          console.warn(`⚠️ [STEP-VALIDATION] Data synchronization had issues:`, syncResult.errors);
        }
      } catch (syncError) {
        console.error(`❌ [STEP-VALIDATION] Data synchronization failed:`, syncError);
        // Continue even if sync fails - step completion is still recorded
      }

      // Enhanced success toast notification  
      toast({
        title: journeyNowComplete ? '🎉 Parcours terminé !' : '✅ Étape validée !',
        description: journeyNowComplete 
          ? `Félicitations ! Vous avez gagné ${newTotalPoints} points au total.`
          : `+${step.points_awarded} points gagnés ! ${state.journey!.steps.length - newCurrentStep} étapes restantes.`,
        duration: journeyNowComplete ? 6000 : 4000,
      });

      // Trigger completion callback
      if (journeyNowComplete && state.journey) {
        const updatedJourney = {
          ...state.journey,
          currentStepIndex: newCurrentStep,
          completedSteps: newCompletedSteps,
          totalPointsEarned: newTotalPoints
        };
        stableOnJourneyCompletion.current?.(updatedJourney, newTotalPoints);
      }

      return { 
        success: true, 
        reason: 'validation_successful',
        pointsEarned: step.points_awarded,
        journeyCompleted: journeyNowComplete
      };

    } catch (error) {
      console.error('❌ Error validating step:', error);
      toast({
        title: 'Erreur de validation',
        description: "Impossible de valider l'étape. Veuillez réessayer.",
        variant: 'destructive',
      });
      return { success: false, reason: 'validation_error' };
    } finally {
      setState(prev => ({ ...prev, validatingStep: false }));
      validatingStepId.current = null;
    }
  }, [user, state.journey, state.completedSteps, state.totalPointsEarned, calculateDistance, toast]);

  // Update journey state (for external updates)
  const updateJourneyState = useCallback((updates: Partial<ActiveJourney>) => {
    setState(prev => ({
      ...prev,
      journey: prev.journey ? { ...prev.journey, ...updates } : null,
    }));
  }, []);

  // Refetch journey
  const refetchJourney = useCallback(() => {
    journeyService.clearJourneyCache(journeyId);
    isInitializedRef.current = false;
    initializeJourney();
  }, [journeyId, initializeJourney]);

  // Cleanup
  const cleanup = useCallback(() => {
    isInitializedRef.current = false;
    isFetchingRef.current = false;
    validatingStepId.current = null;
  }, []);

  // Derived values - memoized for stability
  const currentStep = useMemo(() => {
    return state.journey?.steps?.[state.currentStepIndex] || null;
  }, [state.journey?.steps, state.currentStepIndex]);

  return {
    // State
    journey: state.journey,
    loading: state.loading,
    validatingStep: state.validatingStep,
    currentStepIndex: state.currentStepIndex,
    completedSteps: state.completedSteps,
    totalPointsEarned: state.totalPointsEarned,
    isJourneyComplete: state.isJourneyComplete,
    currentStep,

    // Actions
    initializeJourney,
    validateStepLocation,
    updateJourneyState,
    refetchJourney,
    cleanup,
    calculateDistance,
    isStepCompleted,
  };
}