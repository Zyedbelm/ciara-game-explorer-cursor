import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { geolocationService } from '@/services/geolocationService';
import { usePerformanceLogger } from '@/hooks/usePerformanceLogger';
import { useStableJourneyState } from '@/hooks/useStableJourneyState';
import { useJourneyCompletion } from '@/hooks/useJourneyCompletion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRenderTracker } from '@/hooks/useRenderTracker';
import { getAdminTranslation } from '@/utils/adminTranslations';
import { journeyDeletionService } from '@/services/journeyDeletionService';
import JourneyHeader from './JourneyHeader';
import MemoizedCurrentStepCard from './MemoizedCurrentStepCard';
import MemoizedStepsList from './MemoizedStepsList';
import { UnifiedJourneyCompletionModal } from './UnifiedJourneyCompletionModal';
import UnifiedAudioChatWidget from '@/components/chat/UnifiedAudioChatWidget';

import { JourneyPlayerProps } from '@/types/journey';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OptimizedJourneyPlayer: React.FC<JourneyPlayerProps> = ({ 
  journeyId, 
  onComplete, 
  onJourneyUpdate, 
  onLoadingChange 
}) => {
  // Performance monitoring
  const { renderCount } = useRenderTracker('OptimizedJourneyPlayer', 5);
  
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  
  // Stable refs for props to prevent unnecessary re-renders
  const stableCallbacks = useRef({
    onComplete,
    onJourneyUpdate,
    onLoadingChange
  });

  // Update refs only when callbacks actually change
  React.useEffect(() => {
    stableCallbacks.current = {
      onComplete,
      onJourneyUpdate,
      onLoadingChange
    };
  }, [onComplete, onJourneyUpdate, onLoadingChange]);

  // Performance logging
  const { measure, startTimer, endTimer } = usePerformanceLogger({
    component: 'OptimizedJourneyPlayer',
    threshold: 100
  });

  // Simple location state
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Simple geolocation handler
  const requestLocation = useCallback(async () => {
    if (!geolocationService.isSupported()) {
      toast({
        title: 'Géolocalisation non supportée',
        description: 'Votre navigateur ne supporte pas la géolocalisation.',
        variant: 'destructive'
      });
      return;
    }

    setLocationLoading(true);

    try {
      const newLocation = await geolocationService.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000
      });
      setLocation(newLocation);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de géolocalisation';
      toast({
        title: 'Erreur de géolocalisation',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLocationLoading(false);
    }
  }, [toast]);
  
  // Journey completion modal state
  const {
    showRatingModal,
    completedJourney,
    startJourneyTracking,
    handleJourneyCompletion,
    submitJourneyRating,
    closeRatingModal,
  } = useJourneyCompletion();
  
  // Journey completion handler - stable reference
  const stableJourneyCompletion = useCallback((completedJourney: any, points: number) => {
    console.log('🎉 Journey completion detected!', { journey: completedJourney, points });
    stableCallbacks.current.onComplete?.(points);
    
    // Trigger the journey completion modal
    handleJourneyCompletion(completedJourney, points);
  }, [handleJourneyCompletion]);

  // Consolidated journey state - eliminates hook order issues
  const {
    journey,
    loading,
    validatingStep,
    currentStepIndex,
    completedSteps,
    totalPointsEarned,
    isJourneyComplete,
    currentStep,
    initializeJourney,
    validateStepLocation,
    updateJourneyState,
    cleanup,
    calculateDistance,
    isStepCompleted,
  } = useStableJourneyState(journeyId, stableJourneyCompletion);


  // Stable memoized values
  const userLocation = useMemo(() => {
    return location ? { lat: location.latitude, lng: location.longitude } : undefined;
  }, [location]);

  const isCurrentStepCompleted = useMemo(() => {
    return isStepCompleted(currentStepIndex);
  }, [isStepCompleted, currentStepIndex]);

  // Updated journey object for display - memoized for stability
  const displayJourney = useMemo(() => {
    if (!journey) return null;
    return {
      ...journey,
      currentStepIndex,
      completedSteps,
      totalPointsEarned
    };
  }, [journey, currentStepIndex, completedSteps, totalPointsEarned]);

  // STABLE EFFECTS - properly ordered
  
  // Single initialization effect with journey validation
  useEffect(() => {
    if (!journeyId) return;

    // Validate journey exists before initializing
    const validateAndInitialize = async () => {
      const exists = await journeyDeletionService.validateJourneyExists(journeyId);
      if (!exists) {
        console.warn('⚠️ Journey not found or not active:', journeyId);
        navigate('/');
        return;
      }
      
      initializeJourney();
      startJourneyTracking();
    };

    validateAndInitialize();

    return cleanup;
  }, [journeyId, initializeJourney, startJourneyTracking, cleanup, navigate]);

  // Auto-request location on mount
  useEffect(() => {
    if (journey && !location) {
      requestLocation();
    }
  }, [journey, location, requestLocation]);
  
  // Notify parent of changes - using stable refs
  useEffect(() => {
    stableCallbacks.current.onJourneyUpdate?.(displayJourney);
    stableCallbacks.current.onLoadingChange?.(loading);
  }, [displayJourney, loading]);

  // STABLE HANDLERS - memoized to prevent child re-renders
  const handleValidateStep = useCallback(() => {
    if (!currentStep || !location || !journey) {
      return;
    }
    validateStepLocation(currentStep, location);
  }, [currentStep, location, journey, validateStepLocation]);

  const handleStepClick = useCallback((stepIndex: number) => {
    if (!journey) return;
    updateJourneyState({ currentStepIndex: stepIndex });
  }, [journey, updateJourneyState]);

  const handleForceStepSkip = useCallback((stepIndex: number) => {
    if (!journey) return;
    
    // Add skipped steps to completed steps (without points)
    const newCompletedSteps = [...completedSteps];
    for (let i = currentStepIndex; i < stepIndex; i++) {
      if (!newCompletedSteps.includes(i)) {
        newCompletedSteps.push(i);
      }
    }
    
    updateJourneyState({ 
      currentStepIndex: stepIndex,
      completedSteps: newCompletedSteps
    });
  }, [journey, completedSteps, currentStepIndex, updateJourneyState]);

  const handleBackToJourneys = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Performance logging in development only
  if (process.env.NODE_ENV === 'development' && renderCount > 3) {
    console.warn(`🔄 OptimizedJourneyPlayer rendered ${renderCount} times`);
  }

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="h-8 bg-muted animate-pulse rounded-md mb-4 w-2/3"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md mb-2 w-full"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md w-3/4"></div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="h-6 bg-muted animate-pulse rounded-md mb-4 w-1/2"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md mb-4 w-full"></div>
          <div className="h-64 bg-muted animate-pulse rounded-lg mb-4"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted animate-pulse rounded-md flex-1"></div>
            <div className="h-10 bg-muted animate-pulse rounded-md w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  // Journey not found or error - redirect to main page
  if (!journey) {
    // Redirect immediately instead of showing error
    navigate('/');
    return null;
  }

  // Journey has no steps
  if (!journey.steps || journey.steps.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {getAdminTranslation('journey.player.no_steps', currentLanguage)}
          </h3>
          <p className="text-muted-foreground mb-4">
            {getAdminTranslation('journey.player.no_steps_description', currentLanguage)}
          </p>
          <Button onClick={handleBackToJourneys}>
            {getAdminTranslation('journey.player.back_to_journeys', currentLanguage)}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <JourneyHeader journey={displayJourney} />
      
      {currentStep && (
        <MemoizedCurrentStepCard
          currentStep={currentStep}
          isStepCompleted={isCurrentStepCompleted}
          location={location}
          validatingStep={validatingStep}
            onRequestLocation={requestLocation}
          onValidateStep={handleValidateStep}
          calculateDistance={calculateDistance}
          allSteps={journey.steps}
          currentStepIndex={currentStepIndex}
        />
      )}

      <MemoizedStepsList 
        journey={displayJourney} 
        onStepClick={handleStepClick}
        onForceStepSkip={handleForceStepSkip}
      />
      
      {/* Unified Audio Chat Widget */}
      <UnifiedAudioChatWidget 
        currentJourney={journey}
        currentStep={currentStep}
        userLocation={userLocation}
        isInJourney={true}
      />

      {/* Unified Journey Completion Modal */}
      <UnifiedJourneyCompletionModal
        isVisible={showRatingModal}
        journeyName={completedJourney?.name || journey?.name || ''}
        totalPoints={completedJourney?.totalPointsEarned || totalPointsEarned}
        journeyId={completedJourney?.id || journey?.id}
        userJourneyProgressId={completedJourney?.userJourneyProgressId || journey?.userJourneyProgressId}
        onComplete={submitJourneyRating}
        onClose={closeRatingModal}
      />
    </div>
  );
};

export default OptimizedJourneyPlayer;