import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ActiveJourney } from '@/types/journey';

interface JourneyCompletionData {
  rating: number;
  comment: string;
  completionDuration?: string;
}

export function useJourneyCompletion() {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [completingJourney, setCompletingJourney] = useState(false);
  const [completedJourney, setCompletedJourney] = useState<ActiveJourney | null>(null);
  const [journeyStartTime, setJourneyStartTime] = useState<Date | null>(null);
  
  const { user, profile } = useAuth();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();

  const startJourneyTracking = useCallback(() => {
    setJourneyStartTime(new Date());
  }, []);

  const handleJourneyCompletion = useCallback((journey: ActiveJourney, totalPoints: number) => {
    console.log('🎉 Journey completed, preparing rating modal');
    setCompletedJourney(journey);
    setShowRatingModal(true);
  }, []);

  const submitJourneyRating = useCallback(async (rating: number, comment: string) => {
    if (!completedJourney || !user || !profile) {
      console.error('Missing required data for journey completion');
      return;
    }

    setCompletingJourney(true);

    try {
      // Calculate completion duration
      let completionDuration: string | undefined;
      if (journeyStartTime) {
        const endTime = new Date();
        const durationMs = endTime.getTime() - journeyStartTime.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        completionDuration = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
      }

      // Update user_journey_progress with enriched data
      const { error: updateError } = await supabase
        .from('user_journey_progress')
        .update({
          user_rating: rating,
          user_comment: comment,
          completion_duration: completionDuration ? `${completionDuration}` : null,
          completed_at: new Date().toISOString(),
          is_completed: true,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('journey_id', completedJourney.id);

      if (updateError) {
        throw updateError;
      }

      // Send congratulatory email
      try {
        console.log('📧 Sending congratulatory email...');
        const { error: emailError } = await supabase.functions.invoke('send-journey-completion', {
          body: {
            userName: profile.full_name || 'Explorer',
            userEmail: user.email,
            journeyName: completedJourney.name,
            pointsEarned: 0, // Will be calculated from step completions
            totalPoints: profile.total_points || 0,
            userRating: rating,
            completionDuration,
            cityName: '', // Will be fetched from journey data
            stepCount: 0, // Will be calculated from step completions
            language: currentLanguage
          }
        });
        
        if (emailError) {
          console.error('Email sending failed (non-blocking):', emailError);
          // Don't block the completion process for email failures
        } else {
          console.log('✅ Congratulatory email sent successfully');
        }
      } catch (emailError) {
        console.error('Email sending error (non-blocking):', emailError);
        // Don't block the completion process for email failures
      }

      toast({
        title: currentLanguage === 'fr' ? 'Parcours terminé !' : 'Journey completed!',
        description: currentLanguage === 'fr' 
          ? `Merci pour votre évaluation de ${rating}/5 étoiles !`
          : `Thank you for your ${rating}/5 star rating!`,
      });

      // Redirect to completed tab after successful rating submission
      setTimeout(() => {
        window.location.href = '/my-journeys?tab=completed';
      }, 1500);

    } catch (error) {
      console.error('Error completing journey:', error);
      toast({
        title: currentLanguage === 'fr' ? 'Erreur' : 'Error',
        description: currentLanguage === 'fr' 
          ? 'Impossible de finaliser le parcours'
          : 'Failed to complete journey',
        variant: 'destructive',
      });
    } finally {
      setCompletingJourney(false);
    }
  }, [completedJourney, user, profile, currentLanguage, journeyStartTime, toast]);

  const closeRatingModal = useCallback(() => {
    setShowRatingModal(false);
    setCompletedJourney(null);
  }, []);

  return {
    showRatingModal,
    completedJourney,
    completingJourney,
    startJourneyTracking,
    handleJourneyCompletion,
    submitJourneyRating,
    closeRatingModal,
  };
}