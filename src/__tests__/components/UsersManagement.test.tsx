import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UsersManagement from '@/components/admin/UsersManagement';

// Mock the hooks and integrations
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    profile: {
      id: '1',
      user_id: '1',
      email: 'admin@test.com',
      role: 'super_admin',
      city_id: null,
    },
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [
              {
                id: '1',
                user_id: '1',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@test.com',
                role: 'visitor',
                total_points: 100,
                current_level: 1,
                city_id: null,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                avatar_url: null,
                cities: { name: 'Test City' },
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('UsersManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders users management interface', async () => {
    render(
      <TestWrapper>
        <UsersManagement />
      </TestWrapper>
    );

    expect(screen.getByText('Gestion des Utilisateurs')).toBeInTheDocument();
    expect(screen.getByText('Gérez les utilisateurs et leurs permissions')).toBeInTheDocument();
    expect(screen.getByText('Nouvel utilisateur')).toBeInTheDocument();
  });

  test('displays loading state initially', async () => {
    render(
      <TestWrapper>
        <UsersManagement />
      </TestWrapper>
    );

    expect(screen.getByText('Chargement des utilisateurs...')).toBeInTheDocument();
  });

  test('shows user data after loading', async () => {
    render(
      <TestWrapper>
        <UsersManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('Explorateur')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Niveau 1')).toBeInTheDocument();
    });
  });

  test('has search functionality', async () => {
    render(
      <TestWrapper>
        <UsersManagement />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Rechercher par nom ou email...');
    expect(searchInput).toBeInTheDocument();
  });

  test('has role filter functionality', async () => {
    render(
      <TestWrapper>
        <UsersManagement />
      </TestWrapper>
    );

    const roleFilter = screen.getByText('Filtrer par rôle');
    expect(roleFilter).toBeInTheDocument();
  });
});