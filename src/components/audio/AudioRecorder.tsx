import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onError?: (error: string) => void;
  maxDuration?: number;
  disabled?: boolean;
  className?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onError,
  maxDuration = 15,
  disabled = false,
  className
}) => {
  const {
    isRecording,
    recordingTime,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    remainingTime
  } = useAudioRecording({
    maxDuration,
    onRecordingComplete,
    onError
  });

  if (!isSupported) {
    return (
      <div className="text-muted-foreground text-sm">
        Audio recording not supported
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonContent = () => {
    if (isRecording) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">
            {formatTime(recordingTime)}
          </span>
          <Square className="w-4 h-4" />
        </div>
      );
    }

    return (
      <Mic className="w-4 h-4" />
    );
  };

  const getProgressWidth = () => {
    if (!isRecording) return 0;
    return (recordingTime / maxDuration) * 100;
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          isRecording && "bg-red-500 hover:bg-red-600 text-white border-red-500"
        )}
      >
        {/* Progress bar background for recording */}
        {isRecording && (
          <div 
            className="absolute inset-0 bg-red-600/30 transition-all duration-100"
            style={{ width: `${getProgressWidth()}%` }}
          />
        )}
        
        {/* Button content */}
        <div className="relative z-10">
          {getButtonContent()}
        </div>
      </Button>

      {/* Remaining time indicator */}
      {isRecording && remainingTime <= 5 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-lg animate-pulse">
          {remainingTime}s
        </div>
      )}

      {/* Cancel button when recording */}
      {isRecording && (
        <Button
          onClick={cancelRecording}
          variant="ghost"
          size="sm"
          className="ml-2 text-muted-foreground hover:text-destructive"
        >
          <MicOff className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};