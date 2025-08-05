export interface JourneyStep {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  points_awarded: number;
  validation_radius: number;
  has_quiz: boolean;
  images: string[];
}

export interface ActiveJourney {
  id: string;
  name: string;
  description: string;
  steps: JourneyStep[];
  currentStepIndex: number;
  completedSteps: number[]; // Changed to number[] to store step indices
  totalPointsEarned: number;
  userJourneyProgressId?: string; // Add progress record ID for journal generation
}

export interface JourneyDetail {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  estimated_duration: number;
  distance_km: number;
  total_points: number;
  steps: JourneyStep[];
}

export interface AudioChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  messageType?: 'text' | 'audio';
  audioData?: string;
  duration?: number;
  language?: string;
  voice?: string;
  autoPlay?: boolean;
}

export interface JourneyPlayerProps {
  journeyId: string;
  onComplete?: (totalPoints: number) => void;
  onJourneyUpdate?: (journey: ActiveJourney | null) => void;
  onLoadingChange?: (loading: boolean) => void;
}