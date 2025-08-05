import React from 'react';
import SimpleJourneyButton from '@/components/journey/SimpleJourneyButton';

interface JourneyActionButtonProps {
  journey: {
    id: string;
    name: string;
  };
  showProgress?: boolean;
  userProgress?: {
    is_completed: boolean;
    current_step_order?: number;
    total_points_earned?: number;
  };
}

const JourneyActionButton: React.FC<JourneyActionButtonProps> = ({ 
  journey, 
  userProgress 
}) => {
  
  
  const getVariant = () => {
    if (!userProgress) return 'start';
    if (userProgress.is_completed) return 'replay';
    if (userProgress.current_step_order && userProgress.current_step_order > 1) return 'continue';
    return 'start';
  };

  return (
    <SimpleJourneyButton
      journey={journey}
      userProgress={userProgress}
      variant={getVariant()}
    />
  );
};

export default JourneyActionButton;
