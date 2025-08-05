import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAudioRecording } from '@/hooks/useAudioRecording';

// Mock MediaRecorder
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null as any,
  onstop: null as any,
  onerror: null as any,
  state: 'inactive',
  mimeType: 'audio/webm',
};

const mockMediaStream = {
  getTracks: vi.fn(() => [{ stop: vi.fn() }]),
};

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(),
  },
  writable: true,
});

// Mock MediaRecorder constructor
(global as any).MediaRecorder = vi.fn(() => mockMediaRecorder);
(global as any).MediaRecorder.isTypeSupported = vi.fn().mockReturnValue(true);

describe('useAudioRecording', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMediaRecorder.state = 'inactive';
    (navigator.mediaDevices.getUserMedia as any).mockResolvedValue(mockMediaStream);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAudioRecording());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.recordingTime).toBe(0);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.maxDuration).toBe(15);
    expect(result.current.remainingTime).toBe(15);
  });

  it('should detect unsupported browsers', () => {
    // Mock unsupported browser
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: undefined,
      writable: true,
    });

    const onError = vi.fn();
    const { result } = renderHook(() => useAudioRecording({ onError }));

    expect(result.current.isSupported).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      'Audio recording is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.'
    );
  });

  it('should start recording successfully', async () => {
    const onRecordingComplete = vi.fn();
    const { result } = renderHook(() => 
      useAudioRecording({ onRecordingComplete })
    );

    await act(async () => {
      await result.current.startRecording();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
      }
    });

    expect(mockMediaRecorder.start).toHaveBeenCalledWith(100);
    expect(result.current.isRecording).toBe(true);
  });

  it('should handle permission denied error', async () => {
    const onError = vi.fn();
    (navigator.mediaDevices.getUserMedia as any).mockRejectedValue(
      new Error('Permission denied')
    );

    const { result } = renderHook(() => useAudioRecording({ onError }));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(onError).toHaveBeenCalledWith(
      'Microphone access denied. Please allow microphone permissions and try again.'
    );
    expect(result.current.isRecording).toBe(false);
  });

  it('should stop recording and call onRecordingComplete', async () => {
    const onRecordingComplete = vi.fn();
    const { result } = renderHook(() => 
      useAudioRecording({ onRecordingComplete })
    );

    // Start recording first
    await act(async () => {
      await result.current.startRecording();
    });

    mockMediaRecorder.state = 'recording';

    // Stop recording
    await act(async () => {
      result.current.stopRecording();
    });

    expect(mockMediaRecorder.stop).toHaveBeenCalled();
    expect(result.current.isRecording).toBe(false);
  });

  it('should auto-stop recording at max duration', async () => {
    vi.useFakeTimers();
    const onRecordingComplete = vi.fn();
    
    const { result } = renderHook(() => 
      useAudioRecording({ maxDuration: 5, onRecordingComplete })
    );

    await act(async () => {
      await result.current.startRecording();
    });

    // Fast-forward time to exceed max duration
    act(() => {
      vi.advanceTimersByTime(6000); // 6 seconds
    });

    expect(mockMediaRecorder.stop).toHaveBeenCalled();
    
    vi.useRealTimers();
  });

  it('should convert blob to base64 correctly', async () => {
    const { result } = renderHook(() => useAudioRecording());

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      result: 'data:audio/webm;base64,SGVsbG8gd29ybGQ=',
      onload: null as any,
      onerror: null as any,
    };

    (global as any).FileReader = vi.fn(() => mockFileReader);

    const blob = new Blob(['test'], { type: 'audio/webm' });
    
    const promise = result.current.blobToBase64(blob);
    
    // Simulate FileReader onload
    act(() => {
      mockFileReader.onload?.();
    });

    const base64 = await promise;
    expect(base64).toBe('SGVsbG8gd29ybGQ=');
  });

  it('should handle MediaRecorder not supported error', async () => {
    const onError = vi.fn();
    (navigator.mediaDevices.getUserMedia as any).mockRejectedValue(
      new Error('NotFoundError')
    );

    const { result } = renderHook(() => useAudioRecording({ onError }));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(onError).toHaveBeenCalledWith(
      'No microphone found. Please check your audio devices.'
    );
  });

  it('should cancel recording and cleanup', async () => {
    const { result } = renderHook(() => useAudioRecording());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);

    act(() => {
      result.current.cancelRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.recordingTime).toBe(0);
  });

  it('should not start recording if already recording', async () => {
    const { result } = renderHook(() => useAudioRecording());

    await act(async () => {
      await result.current.startRecording();
    });

    const getUserMediaCallCount = (navigator.mediaDevices.getUserMedia as any).mock.calls.length;

    await act(async () => {
      await result.current.startRecording();
    });

    // Should not call getUserMedia again
    expect((navigator.mediaDevices.getUserMedia as any).mock.calls.length).toBe(getUserMediaCallCount);
  });
});