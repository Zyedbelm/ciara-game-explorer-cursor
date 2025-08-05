import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Square, 
  Send, 
  X,
  Volume2,
  Play,
  Pause
} from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface EnhancedAudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onError?: (error: string) => void;
  maxDuration?: number;
  disabled?: boolean;
  className?: string;
  showTranscription?: boolean;
  allowPlayback?: boolean;
}

export const EnhancedAudioRecorder: React.FC<EnhancedAudioRecorderProps> = ({
  onRecordingComplete,
  onError,
  maxDuration = 30,
  disabled = false,
  className,
  showTranscription = true,
  allowPlayback = true
}) => {
  const { currentLanguage } = useLanguage();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
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
    onRecordingComplete: (blob, duration) => {
      console.log('🎤 Recording completed:', { duration, size: blob.size });
      setRecordedBlob(blob);
      setShowPreview(true);
      
      // Create audio URL for playback
      if (allowPlayback && audioRef.current) {
        const audioUrl = URL.createObjectURL(blob);
        audioRef.current.src = audioUrl;
      }
    },
    onError,
    language: currentLanguage
  });

  useEffect(() => {
    return () => {
      // Cleanup audio URL
      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current || !recordedBlob) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSendRecording = () => {
    if (recordedBlob) {
      const duration = recordingTime; // Store duration before reset
      onRecordingComplete(recordedBlob, duration);
      handleCancel();
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      cancelRecording();
    }
    setRecordedBlob(null);
    setShowPreview(false);
    setIsPlaying(false);
    if (audioRef.current?.src) {
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current.src = '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return Math.min((recordingTime / maxDuration) * 100, 100);
  };

  const getStatusText = () => {
    if (isRecording) {
      return currentLanguage === 'en' ? 'Recording...' : 
             currentLanguage === 'de' ? 'Aufnahme...' : 'Enregistrement...';
    }
    if (showPreview) {
      return currentLanguage === 'en' ? 'Recording ready' : 
             currentLanguage === 'de' ? 'Aufnahme bereit' : 'Enregistrement prêt';
    }
    return currentLanguage === 'en' ? 'Tap to record' : 
           currentLanguage === 'de' ? 'Tippen für Aufnahme' : 'Appuyez pour enregistrer';
  };

  if (!isSupported) {
    return (
      <Card className={cn("border-destructive/50", className)}>
        <CardContent className="p-4 text-center">
          <MicOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {currentLanguage === 'en' ? 'Audio recording not supported' :
             currentLanguage === 'de' ? 'Audioaufnahme nicht unterstützt' :
             'Enregistrement audio non supporté'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Preview mode
  if (showPreview && recordedBlob) {
    return (
      <Card className={cn("border-primary/50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Volume2 className="h-3 w-3 mr-1" />
                {formatTime(recordingTime)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {getStatusText()}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Audio player (hidden) */}
          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            onLoadedData={() => console.log('Audio loaded for playback')}
          />

          <div className="flex items-center gap-2">
            {allowPlayback && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                className="flex-shrink-0"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            )}
            
            <Button
              onClick={handleSendRecording}
              className="flex-1 bg-primary"
              disabled={disabled}
            >
              <Send className="h-4 w-4 mr-2" />
              {currentLanguage === 'en' ? 'Send' :
               currentLanguage === 'de' ? 'Senden' : 'Envoyer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Recording mode
  return (
    <Card className={cn(
      "transition-all duration-200",
      isRecording ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-muted",
      className
    )}>
      <CardContent className="p-4">
        {/* Status header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
            <span className="text-sm font-medium">
              {getStatusText()}
            </span>
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="animate-pulse">
                {formatTime(recordingTime)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {formatTime(remainingTime)} {currentLanguage === 'en' ? 'left' : 
                                           currentLanguage === 'de' ? 'übrig' : 'restant'}
              </Badge>
            </div>
          )}
        </div>

        {/* Progress bar during recording */}
        {isRecording && (
          <div className="mb-4">
            <Progress 
              value={getProgressPercentage()} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(recordingTime)}</span>
              <span>{formatTime(maxDuration)}</span>
            </div>
          </div>
        )}

        {/* Control buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            variant={isRecording ? "destructive" : "outline"}
            className={cn(
              "flex-1 transition-all duration-200",
              isRecording && "bg-red-500 hover:bg-red-600 border-red-500"
            )}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                {currentLanguage === 'en' ? 'Stop' :
                 currentLanguage === 'de' ? 'Stopp' : 'Arrêter'}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {currentLanguage === 'en' ? 'Record' :
                 currentLanguage === 'de' ? 'Aufnehmen' : 'Enregistrer'}
              </>
            )}
          </Button>

          {isRecording && (
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Countdown warning */}
        {isRecording && remainingTime <= 5 && (
          <div className="mt-3 text-center">
            <Badge variant="destructive" className="animate-pulse">
              {currentLanguage === 'en' ? `${remainingTime}s remaining` :
               currentLanguage === 'de' ? `${remainingTime}s verbleibend` :
               `${remainingTime}s restantes`}
            </Badge>
          </div>
        )}

        {/* Instructions */}
        {!isRecording && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {currentLanguage === 'en' ? `Max ${maxDuration} seconds` :
             currentLanguage === 'de' ? `Max ${maxDuration} Sekunden` :
             `Maximum ${maxDuration} secondes`}
          </p>
        )}
      </CardContent>
    </Card>
  );
};