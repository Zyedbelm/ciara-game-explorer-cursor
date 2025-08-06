import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioData?: string; // base64 audio data
  audioUrl?: string; // URL to audio file
  className?: string;
  onPlaybackComplete?: () => void;
  onError?: (error: string) => void;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioData,
  audioUrl,
  className,
  onPlaybackComplete,
  onError,
  autoPlay = false
}) => {
  const {
    isPlaying,
    isLoading,
    duration,
    currentTime,
    error,
    playFromBase64,
    playFromUrl,
    pause,
    resume,
    stop,
    progress
  } = useAudioPlayer({
    onPlaybackComplete,
    onError
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        pause();
      } else if (currentTime > 0) {
        // Resume if already started
        await resume();
      } else {
        // Start new playback
        if (audioData) {
          await playFromBase64(audioData);
        } else if (audioUrl) {
          await playFromUrl(audioUrl);
        }
      }
    } catch (err) {
      onError?.('Failed to play audio');
    }
  };

  // Auto-play when audio data is provided
  React.useEffect(() => {
    if (autoPlay && (audioData || audioUrl) && !isPlaying && currentTime === 0) {
      handlePlayPause();
    }
  }, [audioData, audioUrl, autoPlay]);

  if (error) {
    return (
      <div className={cn("flex items-center gap-2 text-destructive text-sm", className)}>
        <Volume2 className="w-4 h-4" />
        <span>Audio playback failed</span>
      </div>
    );
  }

  if (!audioData && !audioUrl) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-3 bg-muted/50 rounded-lg p-3 max-w-sm", className)}>
      {/* Play/Pause Button */}
      <Button
        onClick={handlePlayPause}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 rounded-full"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>

      {/* Progress Bar */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="relative bg-muted rounded-full h-1.5 overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>

      {/* Audio Icon */}
      <Volume2 className="w-4 h-4 text-muted-foreground" />
    </div>
  );
};