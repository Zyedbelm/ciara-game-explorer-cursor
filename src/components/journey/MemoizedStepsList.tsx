import React from 'react';
import { ActiveJourney } from '@/types/journey';

interface MemoizedStepsListProps {
  journey: ActiveJourney;
  onStepClick: (stepIndex: number) => void;
  onForceStepSkip: (stepIndex: number) => void;
}

// Import the original component
import StepsList from './StepsList';

/**
 * Memoized wrapper for StepsList to prevent unnecessary re-renders
 */
const MemoizedStepsList = React.memo<MemoizedStepsListProps>(
  ({ journey, onStepClick, onForceStepSkip }) => {
    return (
      <StepsList 
        journey={journey} 
        onStepClick={onStepClick}
        onForceStepSkip={onForceStepSkip}
      />
    );
  },
  // Custom comparison function for memo
  (prevProps, nextProps) => {
    // Only re-render if journey state actually changes
    return (
      prevProps.journey.id === nextProps.journey.id &&
      prevProps.journey.currentStepIndex === nextProps.journey.currentStepIndex &&
      JSON.stringify(prevProps.journey.completedSteps) === JSON.stringify(nextProps.journey.completedSteps) &&
      prevProps.journey.totalPointsEarned === nextProps.journey.totalPointsEarned
    );
  }
);

MemoizedStepsList.displayName = 'MemoizedStepsList';

export default MemoizedStepsList;