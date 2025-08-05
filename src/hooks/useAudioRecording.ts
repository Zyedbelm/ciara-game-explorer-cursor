import { useState, useRef, useCallback } from 'react';
import { getAudioErrorMessage } from '@/utils/audioErrorMessages';

interface UseAudioRecordingProps {
  maxDuration?: number; // in seconds, default 15
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onError?: (error: string) => void;
  language?: 'fr' | 'en' | 'de'; // for error messages
}

export const useAudioRecording = ({
  maxDuration = 15,
  onRecordingComplete,
  onError,
  language = 'fr'
}: UseAudioRecordingProps = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const checkSupport = useCallback(() => {
    const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setIsSupported(supported);
    if (!supported) {
      onError?.(getAudioErrorMessage('not supported', language));
    }
    return supported;
  }, [onError, language]);

  const startRecording = useCallback(async () => {
    if (!checkSupport()) {
      onError?.('Audio recording is not supported in this browser');
      return;
    }

    if (isRecording) return;

    try {
      console.log('Starting audio recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });

      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped');
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        
        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { 
            type: mediaRecorder.mimeType || 'audio/webm' 
          });
          console.log('Audio blob created:', audioBlob.size, 'bytes');
          onRecordingComplete?.(audioBlob, duration);
        }
        
        cleanup();
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        onError?.('Recording failed');
        cleanup();
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setRecordingTime(elapsed);

        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);

      console.log('Recording started successfully');

    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.(getAudioErrorMessage(error as Error, language));
      cleanup();
    }
  }, [isRecording, maxDuration, onRecordingComplete, onError, checkSupport]);

  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;

    console.log('Stopping recording...');
    
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
  }, [isRecording]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  const cancelRecording = useCallback(() => {
    console.log('Cancelling recording...');
    cleanup();
  }, [cleanup]);

  // Convert blob to base64 for API transmission
  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  return {
    isRecording,
    recordingTime,
    isSupported,
    maxDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    blobToBase64,
    remainingTime: Math.max(0, maxDuration - recordingTime)
  };
};