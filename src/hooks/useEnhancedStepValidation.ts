import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { JourneyStep, ActiveJourney } from '@/types/journey';
import { useJourneySession } from './useJourneySession';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface ValidationOptions {
  forceValidation?: boolean;
  bypassGPS?: boolean;
  method?: 'geolocation' | 'manual' | 'qr_code';
}

export function useEnhancedStepValidation(
  journey: ActiveJourney | null,
  onComplete?: (journey: ActiveJourney, totalPoints: number) => void
) {
  const [validatingStep, setValidatingStep] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { sessionData, markStepCompleted, completeJourney } = useJourneySession(journey?.id || '');
  
  // Prevent duplicate validations
  const lastValidationTime = useRef<number>(0);
  const validatingStepId = useRef<string | null>(null);

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

  const validateStepLocation = useCallback(async (
    step: JourneyStep, 
    location: LocationCoords | null,
    options: ValidationOptions = {}
  ) => {
    if (!user || !journey || !sessionData) {
      return { success: false, reason: 'missing_requirements' };
    }

    // Prevent duplicate validations within 3 seconds
    const now = Date.now();
    if (!options.forceValidation && (now - lastValidationTime.current < 3000 || validatingStepId.current === step.id)) {
      return { success: false, reason: 'duplicate_validation' };
    }

    // Check if step is already completed
    const stepIndex = journey.steps.findIndex(s => s.id === step.id);
    if (sessionData.completed_steps.includes(stepIndex)) {
      toast({
        title: 'Étape déjà validée',
        description: 'Cette étape est déjà complétée dans votre progression',
      });
      return { success: true, reason: 'already_completed' };
    }

    setValidatingStep(true);
    validatingStepId.current = step.id;
    lastValidationTime.current = now;

    try {
      let isLocationValid = false;
      let distance = 0;

      // Handle different validation methods
      if (options.bypassGPS || options.method === 'manual') {
        ');
        isLocationValid = true;
      } else if (location) {
        distance = calculateDistance(
          location.latitude,
          location.longitude,
          step.latitude,
          step.longitude
        );
        isLocationValid = distance <= step.validation_radius;
        } else {
        toast({
          title: 'Position requise',
          description: 'Activez votre géolocalisation pour valider cette étape',
          variant: 'destructive'
        });
        return { success: false, reason: 'no_location' };
      }

      // Log validation attempt for analytics and security
      try {
        await supabase.rpc('log_step_validation', {
          p_user_id: user.id,
          p_step_id: step.id,
          p_validation_method: options.method || 'geolocation',
          p_location: location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            distance: distance,
            required_radius: step.validation_radius,
            accuracy: location.accuracy
          } : null,
          p_success: isLocationValid
        });
      } catch (logError) {
      }

      if (!isLocationValid) {
        toast({
          title: 'Position incorrecte',
          description: `Vous devez être à moins de ${step.validation_radius}m du point d'intérêt (vous êtes à ${Math.round(distance)}m)`,
          variant: 'destructive',
        });
        return { success: false, reason: 'too_far', distance };
      }

      // Check for existing completion in database to prevent duplicates
      const { data: existingCompletion } = await supabase
        .from('step_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('step_id', step.id)
        .maybeSingle();

      if (existingCompletion) {
        // Update session to reflect database state
        markStepCompleted(stepIndex, step, options.method || 'geolocation');
        return { success: true, reason: 'already_completed_db' };
      }

      // Record step completion
      const { error: completionError } = await supabase
        .from('step_completions')
        .insert({
          user_id: user.id,
          step_id: step.id,
          journey_id: journey.id,
          points_earned: step.points_awarded,
          validation_method: options.method || 'geolocation'
        });

      if (completionError) {
        
        if (completionError.code === '23505') { // Unique violation
          toast({
            title: 'Étape déjà validée',
            description: 'Cette étape est déjà complétée',
          });
          markStepCompleted(stepIndex, step, options.method || 'geolocation');
          return { success: true, reason: 'already_completed_db' };
        }
        
        throw completionError;
      }

      // Update session with completion
      markStepCompleted(stepIndex, step, options.method || 'geolocation');

      // Check if journey is complete
      const newCompletedSteps = [...sessionData.completed_steps, stepIndex];
      if (newCompletedSteps.length >= journey.steps.length) {
        // Update journey with completion
        const updatedJourney = {
          ...journey,
          currentStepIndex: stepIndex,
          completedSteps: newCompletedSteps,
          totalPointsEarned: sessionData.total_points_earned + step.points_awarded
        };
        
        await completeJourney();
        onComplete?.(updatedJourney, sessionData.total_points_earned + step.points_awarded);
      }

      return { 
        success: true, 
        reason: 'validation_successful',
        pointsEarned: step.points_awarded 
      };

    } catch (error) {
      
      // Enhanced error handling
      if (error && typeof error === 'object' && 'code' in error) {
        switch ((error as any).code) {
          case 'PGRST116': // Row Level Security violation
            toast({
              title: 'Erreur d\'autorisation',
              description: 'Vous n\'êtes pas autorisé à valider cette étape',
              variant: 'destructive',
            });
            break;
          case '23503': // Foreign key violation
            toast({
              title: 'Erreur de données',
              description: 'Cette étape n\'existe plus',
              variant: 'destructive',
            });
            break;
          default:
            toast({
              title: 'Erreur de validation',
              description: "Impossible de valider l'étape. Veuillez réessayer.",
              variant: 'destructive',
            });
        }
      } else {
        toast({
          title: 'Erreur de validation',
          description: "Impossible de valider l'étape. Veuillez réessayer.",
          variant: 'destructive',
        });
      }

      return { success: false, reason: 'validation_error', error };
    } finally {
      setValidatingStep(false);
      validatingStepId.current = null;
    }
  }, [journey, sessionData, user, toast, calculateDistance, markStepCompleted, completeJourney, onComplete]);

  // Check if a step is completed
  const isStepCompleted = useCallback((stepIndex: number): boolean => {
    return sessionData?.completed_steps.includes(stepIndex) || false;
  }, [sessionData?.completed_steps]);

  // Get step validation status
  const getStepStatus = useCallback((stepIndex: number) => {
    if (!sessionData || !journey) return 'locked';
    
    const isCompleted = sessionData.completed_steps.includes(stepIndex);
    const isCurrent = sessionData.current_step_index === stepIndex;
    const isUnlocked = stepIndex <= sessionData.current_step_index;
    
    if (isCompleted) return 'completed';
    if (isCurrent) return 'current';
    if (isUnlocked) return 'unlocked';
    return 'locked';
  }, [sessionData, journey]);

  // Force unlock next step (admin/debug function)
  const forceUnlockStep = useCallback(async (stepIndex: number) => {
    if (!sessionData || !journey) return;
    
    // This just updates the current step without completing the previous one
    const newCurrentIndex = Math.max(stepIndex, sessionData.current_step_index);
    // Update session through the session hook
    // Note: This would need to be implemented in useJourneySession
    
    toast({
      title: 'Étape débloquée',
      description: `Étape ${stepIndex + 1} débloquée`,
    });
  }, [sessionData, journey, toast]);

  return {
    validatingStep,
    validateStepLocation,
    calculateDistance,
    isStepCompleted,
    getStepStatus,
    forceUnlockStep,
    sessionData,
    completedStepsCount: sessionData?.completed_steps.length || 0,
    totalPointsEarned: sessionData?.total_points_earned || 0
  };
}