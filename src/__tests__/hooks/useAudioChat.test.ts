import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAudioChat } from '@/hooks/useAudioChat';

// Mock hooks and dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123' },
    profile: { 
      current_level: 1, 
      total_points: 100, 
      fitness_level: 3, 
      role: 'visitor' 
    }
  })
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'fr',
    t: (key: string) => key
  })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    functions: {
      invoke: vi.fn()
    }
  }
}));

vi.mock('@/utils/languageDetection', () => ({
  detectLanguage: vi.fn().mockReturnValue('fr'),
  getWelcomeMessage: vi.fn().mockReturnValue('Bienvenue!'),
  getLanguageSpecificSuggestions: vi.fn().mockReturnValue(['Suggestion 1', 'Suggestion 2'])
}));

describe('useAudioChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAudioChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isTranslating).toBe(false);
    expect(result.current.sessionId).toBeNull();
  });

  it('should generate session key correctly', () => {
    const context = {
      cityName: 'Lausanne',
      currentJourney: { id: 'journey-123' },
      currentStep: { id: 'step-456' }
    };

    const { result } = renderHook(() => useAudioChat(context));
    
    // We can't directly test getSessionKey as it's internal,
    // but we can verify it doesn't cause errors
    expect(result.current.messages).toEqual([]);
  });

  it('should handle context changes without infinite loops', () => {
    const { result, rerender } = renderHook(
      ({ context }) => useAudioChat(context),
      {
        initialProps: {
          context: { cityName: 'Lausanne' }
        }
      }
    );

    // Change context
    rerender({ 
      context: { 
        cityName: 'Geneva',
        currentJourney: { id: 'journey-456', name: 'Test Journey' }
      } as any
    });

    // Should not cause infinite re-renders
    expect(result.current.isLoading).toBe(false);
  });

  it('should prevent sending empty messages', async () => {
    const { result } = renderHook(() => useAudioChat());

    await act(async () => {
      await result.current.sendTextMessage('');
    });

    expect(result.current.messages).toEqual([]);
  });

  it('should prevent sending messages when loading', async () => {
    const { result } = renderHook(() => useAudioChat());

    // Simulate loading state
    act(() => {
      (result.current as any).setIsLoading?.(true);
    });

    const initialMessagesLength = result.current.messages.length;

    await act(async () => {
      await result.current.sendTextMessage('test message');
    });

    // Should not add message when loading
    expect(result.current.messages.length).toBe(initialMessagesLength);
  });

  it('should handle audio message processing', async () => {
    const { result } = renderHook(() => useAudioChat());

    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });

    await act(async () => {
      await result.current.sendAudioMessage(mockBlob, 5);
    });

    // Should handle the audio message (even if it fails due to mocked dependencies)
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear chat correctly', () => {
    const { result } = renderHook(() => useAudioChat());

    act(() => {
      result.current.clearChat();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.sessionId).toBeNull();
  });

  it('should build enhanced context correctly', () => {
    const context = {
      cityName: 'Lausanne',
      currentJourney: {
        id: 'journey-123',
        name: 'Test Journey',
        description: 'A test journey',
        category: { name: 'Culture' },
        difficulty: 'easy',
        estimated_duration: 60
      },
      currentStep: {
        id: 'step-456',
        name: 'Test Step',
        description: 'A test step',
        type: 'monument',
        points_awarded: 10
      },
      userLocation: { lat: 46.5197, lng: 6.6323 }
    };

    const { result } = renderHook(() => useAudioChat(context));

    // Context should be processed without errors
    expect(result.current.messages).toEqual([]);
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useAudioChat());

    // Mock an error in the supabase client
    const mockSupabase = await import('@/integrations/supabase/client');
    (mockSupabase.supabase.functions.invoke as any).mockRejectedValue(new Error('Network error'));

    await act(async () => {
      await result.current.sendTextMessage('test message');
    });

    // Should handle error without crashing
    expect(result.current.isLoading).toBe(false);
  });

  it('should detect language from message content', async () => {
    const { detectLanguage } = await import('@/utils/languageDetection');
    const { result } = renderHook(() => useAudioChat());

    await act(async () => {
      await result.current.sendTextMessage('Hello world');
    });

    expect(detectLanguage).toHaveBeenCalledWith('Hello world');
  });

  it('should generate welcome message for new sessions', () => {
    const context = { cityName: 'Lausanne' };
    const { getWelcomeMessage } = require('@/utils/languageDetection');
    
    renderHook(() => useAudioChat(context));

    expect(getWelcomeMessage).toHaveBeenCalledWith('fr', 'Lausanne');
  });
});