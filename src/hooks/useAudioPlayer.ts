import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioPlayerProps {
  onPlaybackComplete?: () => void;
  onError?: (error: string) => void;
}

export const useAudioPlayer = ({
  onPlaybackComplete,
  onError
}: UseAudioPlayerProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourceRef = useRef<string | null>(null);

  // Create audio element if it doesn't exist
  const getAudioElement = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
      
      // Event listeners
      audioRef.current.addEventListener('loadstart', () => {
        setIsLoading(true);
        setError(null);
      });

      audioRef.current.addEventListener('canplay', () => {
        setIsLoading(false);
      });

      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onPlaybackComplete?.();
      });

      audioRef.current.addEventListener('error', (e) => {
        const errorMsg = 'Audio playback failed';
        setError(errorMsg);
        setIsLoading(false);
        setIsPlaying(false);
        onError?.(errorMsg);
        console.error('Audio error:', e);
      });

      audioRef.current.addEventListener('play', () => {
        setIsPlaying(true);
      });

      audioRef.current.addEventListener('pause', () => {
        setIsPlaying(false);
      });
    }
    return audioRef.current;
  }, [onPlaybackComplete, onError]);

  const playFromBase64 = useCallback(async (base64Audio: string, mimeType = 'audio/mp3') => {
    try {
      setError(null);
      
      // Clean up previous source
      if (sourceRef.current) {
        URL.revokeObjectURL(sourceRef.current);
      }

      // Convert base64 to blob
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      
      // Create object URL
      const audioUrl = URL.createObjectURL(blob);
      sourceRef.current = audioUrl;

      const audio = getAudioElement();
      audio.src = audioUrl;
      
      console.log('Loading audio from base64...');
      await audio.load();
      
      console.log('Playing audio...');
      await audio.play();
      
    } catch (error) {
      const errorMsg = 'Failed to play audio';
      setError(errorMsg);
      setIsLoading(false);
      setIsPlaying(false);
      onError?.(errorMsg);
      console.error('Error playing audio:', error);
    }
  }, [getAudioElement, onError]);

  const playFromUrl = useCallback(async (url: string) => {
    try {
      setError(null);
      
      const audio = getAudioElement();
      audio.src = url;
      
      console.log('Loading audio from URL...');
      await audio.load();
      
      console.log('Playing audio...');
      await audio.play();
      
    } catch (error) {
      const errorMsg = 'Failed to play audio from URL';
      setError(errorMsg);
      setIsLoading(false);
      setIsPlaying(false);
      onError?.(errorMsg);
      console.error('Error playing audio from URL:', error);
    }
  }, [getAudioElement, onError]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(async () => {
    if (audioRef.current && audioRef.current.paused) {
      try {
        await audioRef.current.play();
      } catch (error) {
        const errorMsg = 'Failed to resume audio';
        setError(errorMsg);
        onError?.(errorMsg);
        console.error('Error resuming audio:', error);
      }
    }
  }, [onError]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
    }
  }, [duration]);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (sourceRef.current) {
        URL.revokeObjectURL(sourceRef.current);
      }
    };
  }, []);

  return {
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
    seek,
    setVolume,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0
  };
};