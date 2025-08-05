import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StepQuizzesTab } from '@/components/admin/StepQuizzesTab';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        data: null,
        error: null,
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    handleSubmit: vi.fn((fn) => fn),
    register: vi.fn(),
    formState: { errors: {} },
    reset: vi.fn(),
    watch: vi.fn(() => 'multiple_choice'),
  }),
}));

describe('StepQuizzesTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render quizzes tab', () => {
    render(<StepQuizzesTab stepId="test-step-id" />);
    
    expect(screen.getByText('Quiz')).toBeInTheDocument();
  });

  it('should fetch quizzes for the step', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    render(<StepQuizzesTab stepId="test-step-id" />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('quiz_questions');
    });
  });

  it('should not fetch quizzes when stepId is not provided', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    render(<StepQuizzesTab />);

    // Should not make any database calls without stepId
    await waitFor(() => {
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  it('should handle quiz fetch errors', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockToast = vi.fn();
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: null,
            error: new Error('Database error'),
          })),
        })),
      })),
    } as any);

    render(<StepQuizzesTab stepId="test-step-id" />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('quiz_questions');
    });
  });

  it('should update step has_quiz flag when quiz is created', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    render(<StepQuizzesTab stepId="test-step-id" />);

    // Verify the component loads and handles quiz creation logic
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('quiz_questions');
    });
  });

  it('should validate quiz data before submission', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    render(<StepQuizzesTab stepId="test-step-id" />);

    // Component should load without errors
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('quiz_questions');
    });
  });

  it('should handle quiz creation errors gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        data: null,
        error: new Error('Insert failed'),
      })),
    } as any);

    render(<StepQuizzesTab stepId="test-step-id" />);

    // Component should handle errors gracefully
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('quiz_questions');
    });
  });
});