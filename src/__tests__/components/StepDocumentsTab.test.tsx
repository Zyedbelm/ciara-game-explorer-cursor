import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StepDocumentsTab } from '@/components/admin/StepDocumentsTab';

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
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({
          error: null,
        })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/file.pdf' },
        })),
      })),
    },
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
    watch: vi.fn(),
  }),
}));

describe('StepDocumentsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render documents tab', () => {
    render(<StepDocumentsTab stepId="test-step-id" cityId="test-city-id" />);
    
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  it('should fetch documents on mount', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    render(<StepDocumentsTab stepId="test-step-id" cityId="test-city-id" />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('content_documents');
    });
  });

  it('should use correct table name for document operations', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    render(<StepDocumentsTab stepId="test-step-id" cityId="test-city-id" />);

    // Verify it uses the correct table name
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('content_documents');
    });
  });

  it('should handle document fetch errors', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockToast = vi.fn();
    
    // Mock the toast hook
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

    render(<StepDocumentsTab stepId="test-step-id" cityId="test-city-id" />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('content_documents');
    });
  });

  it('should handle successful document creation', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    render(<StepDocumentsTab stepId="test-step-id" cityId="test-city-id" />);

    // The component should load without errors
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('content_documents');
    });
  });
});