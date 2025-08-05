import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock waitFor for async testing
const waitFor = async (callback: () => void, options = { timeout: 1000 }) => {
  let timeoutId: NodeJS.Timeout;
  return new Promise<void>((resolve, reject) => {
    const check = () => {
      try {
        callback();
        clearTimeout(timeoutId);
        resolve();
      } catch (error) {
        // Keep trying
      }
    };
    
    timeoutId = setTimeout(() => {
      reject(new Error('waitFor timeout'));
    }, options.timeout);
    
    // Check immediately and then every 50ms
    check();
    const interval = setInterval(check, 50);
    
    setTimeout(() => {
      clearInterval(interval);
      clearTimeout(timeoutId);
      resolve();
    }, options.timeout);
  });
};
import { useAnalytics } from '@/hooks/useAnalytics';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.analytics).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should calculate metrics correctly with empty data', async () => {
    const { result } = renderHook(() => useAnalytics());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.analytics).toEqual({
      totalUsers: 0,
      activeUsers: 0,
      completedJourneys: 0,
      totalPoints: 0,
      engagementRate: 0,
      userGrowth: 12.5,
      journeyCompletionRate: 0,
      avgSessionTime: 135
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock error response
    const { supabase } = await import('@/integrations/supabase/client');
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => {
          throw new Error('Database error');
        })
      }))
    }));

    const { result } = renderHook(() => useAnalytics());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.analytics).toBe(null);
  });
});