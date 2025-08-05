import React from 'react';
import { JourneyStep } from '@/types/journey';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface MemoizedCurrentStepCardProps {
  currentStep: JourneyStep;
  isStepCompleted: boolean;
  location: LocationCoords | null;
  validatingStep: boolean;
  onRequestLocation: () => void;
  onValidateStep: () => void;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  allSteps: JourneyStep[];
  currentStepIndex: number;
}

// Import the original component
import CurrentStepCard from './CurrentStepCard';

/**
 * Memoized wrapper for CurrentStepCard to prevent unnecessary re-renders
 */
const MemoizedCurrentStepCard = React.memo<MemoizedCurrentStepCardProps>(
  ({ 
    currentStep, 
    isStepCompleted, 
    location, 
    validatingStep, 
    onRequestLocation, 
    onValidateStep, 
    calculateDistance, 
    allSteps, 
    currentStepIndex 
  }) => {
    return (
      <CurrentStepCard
        currentStep={currentStep}
        isStepCompleted={isStepCompleted}
        location={location}
        validatingStep={validatingStep}
        onRequestLocation={onRequestLocation}
        onValidateStep={onValidateStep}
        calculateDistance={calculateDistance}
        allSteps={allSteps}
        currentStepIndex={currentStepIndex}
      />
    );
  },
  // Custom comparison function for memo
  (prevProps, nextProps) => {
    // Only re-render if critical props actually change
    return (
      prevProps.currentStep?.id === nextProps.currentStep?.id &&
      prevProps.isStepCompleted === nextProps.isStepCompleted &&
      prevProps.validatingStep === nextProps.validatingStep &&
      prevProps.currentStepIndex === nextProps.currentStepIndex &&
      prevProps.location?.latitude === nextProps.location?.latitude &&
      prevProps.location?.longitude === nextProps.location?.longitude
    );
  }
);

MemoizedCurrentStepCard.displayName = 'MemoizedCurrentStepCard';

export default MemoizedCurrentStepCard;