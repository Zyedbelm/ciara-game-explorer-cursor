
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { JourneyStep, ActiveJourney } from '@/types/journey';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function useStepValidation(
  journey: ActiveJourney | null,
  setJourney: React.Dispatch<React.SetStateAction<ActiveJourney | null>>,
  onComplete?: (journey: ActiveJourney, totalPoints: number) => void
) {
  const [validatingStep, setValidatingStep] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
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

  const validateStepLocation = useCallback(async (step: JourneyStep, location: LocationCoords) => {
    if (!location || !user || !journey) {
      console.log('🚫 Validation cancelled - missing requirements');
      return;
    }

    // Prevent duplicate validations within 5 seconds
    const now = Date.now();
    if (now - lastValidationTime.current < 5000 || validatingStepId.current === step.id) {
      console.log('🚫 Validation cancelled - too recent or already validating');
      return;
    }

    console.log('🎯 Starting step validation for:', step.name);
    setValidatingStep(true);
    validatingStepId.current = step.id;
    lastValidationTime.current = now;

    try {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        step.latitude,
        step.longitude
      );

      console.log('📏 Distance to step:', distance, 'Required:', step.validation_radius);

      // Log validation attempt for security monitoring
      try {
        await supabase.rpc('log_step_validation', {
          p_user_id: user.id,
          p_step_id: step.id,
          p_validation_method: 'geolocation',
          p_location: {
            latitude: location.latitude,
            longitude: location.longitude,
            distance: distance,
            required_radius: step.validation_radius
          },
          p_success: distance <= step.validation_radius
        });
      } catch (logError) {
        console.warn('Failed to log validation attempt:', logError);
      }

      if (distance <= step.validation_radius) {
        console.log('✅ User is within range, completing step...');
        
        // Check if step is already completed to prevent duplicates
        // Only check for GPS-based validation (not quiz completion)
        const { data: existingCompletion } = await supabase
          .from('step_completions')
          .select('id, validation_method')
          .eq('user_id', user.id)
          .eq('step_id', step.id)
          .eq('validation_method', 'geolocation')
          .maybeSingle();

        if (existingCompletion) {
          console.log('ℹ️ Step already completed via geolocation, skipping...');
          
          // Check if journey is already completed
          const isJourneyCompleted = journey.completedSteps.length >= journey.steps.length;
          
          toast({
            title: 'Information',
            description: isJourneyCompleted 
              ? 'Ce parcours est déjà terminé. Consultez vos parcours terminés pour revoir cette aventure.'
              : 'Cette étape est déjà validée par géolocalisation',
          });
          return;
        }

        // Record step completion with enhanced error handling
        const { error: completionError } = await supabase
          .from('step_completions')
          .insert({
            user_id: user.id,
            step_id: step.id,
            journey_id: journey.id,
            points_earned: step.points_awarded,
            validation_method: 'geolocation'
          });

        if (completionError) {
          console.error('❌ Error recording completion:', completionError);
          
          // Handle specific error types
          if (completionError.code === '23505') { // Unique violation
            toast({
              title: 'Information',
              description: 'Cette étape est déjà validée',
            });
            return;
          }
          
          throw completionError;
        }

        // Update journey progress
        const currentStepIndex = journey.steps.findIndex(s => s.id === step.id);
        const newCompletedSteps = [...new Set([...journey.completedSteps, currentStepIndex])];
        const newCurrentIndex = Math.min(journey.currentStepIndex + 1, journey.steps.length - 1);
        const newTotalPoints = journey.totalPointsEarned + step.points_awarded;

        console.log('🔄 Updating progress:', {
          stepId: step.id,
          currentStepIndex,
          newCompletedSteps,
          newCurrentIndex,
          newTotalPoints
        });

        const { error: progressError } = await supabase
          .from('user_journey_progress')
          .upsert({
            user_id: user.id,
            journey_id: journey.id,
            current_step_order: newCurrentIndex + 1,
            total_points_earned: newTotalPoints,
            is_completed: newCurrentIndex >= journey.steps.length - 1,
            updated_at: new Date().toISOString()
          });

        if (progressError) {
          console.error('❌ Progress update error:', progressError);
          throw progressError;
        }

        // Update local state
        setJourney(prev => prev ? {
          ...prev,
          currentStepIndex: newCurrentIndex,
          completedSteps: newCompletedSteps,
          totalPointsEarned: newTotalPoints
        } : null);

        toast({
          title: 'Succès',
          description: `+${step.points_awarded} points gagnés !`,
        });

        // Check if journey is complete (when all steps are completed)
        const isJourneyComplete = newCompletedSteps.length >= journey.steps.length;
        if (isJourneyComplete) {
          console.log('🎉 Journey completed! All steps validated.');
          
          // Mark journey as completed in database
          const { error: completionError } = await supabase
            .from('user_journey_progress')
            .update({
              is_completed: true,
              completed_at: new Date().toISOString(),
              status: 'completed'
            })
            .eq('user_id', user.id)
            .eq('journey_id', journey.id);

          if (completionError) {
            console.error('❌ Error marking journey complete:', completionError);
          }

          const updatedJourney = {
            ...journey,
            currentStepIndex: newCurrentIndex,
            completedSteps: newCompletedSteps,
            totalPointsEarned: newTotalPoints
          };
          onComplete?.(updatedJourney, newTotalPoints);
        }

      } else {
        console.log('📍 User too far from step');
        toast({
          title: 'Erreur',
          description: `Vous devez être à moins de ${step.validation_radius}m du point d'intérêt (${Math.round(distance)}m)`,
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('❌ Error validating step:', error);
      
      // Enhanced error handling based on error type
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
              title: 'Erreur',
              description: "Impossible de valider l'étape",
              variant: 'destructive',
            });
        }
      } else {
        toast({
          title: 'Erreur',
          description: "Impossible de valider l'étape",
          variant: 'destructive',
        });
      }
    } finally {
      setValidatingStep(false);
      validatingStepId.current = null;
    }
  }, [journey, user, toast, onComplete, setJourney, calculateDistance]);

  return {
    validatingStep,
    validateStepLocation,
    calculateDistance
  };
}
