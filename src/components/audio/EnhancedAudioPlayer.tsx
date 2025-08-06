import React, { useRef, useEffect } from 'react';
import { AudioPlayer } from './AudioPlayer';
import { useToast } from '@/hooks/use-toast';

interface EnhancedAudioPlayerProps {
  audioData?: string;
  audioUrl?: string;
  autoPlay?: boolean;
  onPlaybackComplete?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  showControls?: boolean;
}

export const EnhancedAudioPlayer: React.FC<EnhancedAudioPlayerProps> = ({
  audioData,
  audioUrl,
  autoPlay = false,
  onPlaybackComplete,
  onError,
  className,
  showControls = true
}) => {
  const { toast } = useToast();
  const hasAutoPlayedRef = useRef(false);

  const handleError = (error: string) => {
    toast({
      title: "Audio Error",
      description: "Failed to play audio message",
      variant: "destructive",
    });
    onError?.(new Error(error));
  };

  const handlePlaybackComplete = () => {
    onPlaybackComplete?.();
  };

  // Reset auto-play flag when audioData changes
  useEffect(() => {
    hasAutoPlayedRef.current = false;
  }, [audioData, audioUrl]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !hasAutoPlayedRef.current && (audioData || audioUrl)) {
      hasAutoPlayedRef.current = true;
      }
  }, [autoPlay, audioData, audioUrl]);

  if (!audioData && !audioUrl) {
    return null;
  }

  return (
    <div className={className}>
      <AudioPlayer
        audioData={audioData}
        audioUrl={audioUrl}
        autoPlay={autoPlay && !hasAutoPlayedRef.current}
        onPlaybackComplete={handlePlaybackComplete}
        onError={handleError}
      />
      {!showControls && (
        <div className="text-xs text-muted-foreground mt-1">
          🔊 Audio message
        </div>
      )}
    </div>
  );
};