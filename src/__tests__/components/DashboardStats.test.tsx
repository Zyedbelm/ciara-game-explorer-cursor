import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import DashboardStats from '@/components/admin/DashboardStats';

// Mock the useAnalytics hook
vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: vi.fn()
}));

import { useAnalytics } from '@/hooks/useAnalytics';

describe('DashboardStats', () => {
  it('should show loading state', () => {
    (useAnalytics as any).mockReturnValue({
      analytics: null,
      loading: true,
      error: null
    });

    render(<DashboardStats />);
    
    // Check for loading skeleton cards
    const loadingCards = document.querySelectorAll('.animate-pulse');
    expect(loadingCards.length).toBeGreaterThan(0);
  });

  it('should show error state', () => {
    (useAnalytics as any).mockReturnValue({
      analytics: null,
      loading: false,
      error: 'Test error message'
    });

    render(<DashboardStats />);
    
    expect(screen.getByText(/Erreur lors du chargement des statistiques/)).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render analytics data correctly', () => {
    const mockAnalytics = {
      activeUsers: 1250,
      completedJourneys: 85,
      totalPoints: 12400,
      avgSessionTime: 135,
      engagementRate: 68.5,
      userGrowth: 12.5,
      journeyCompletionRate: 75.3
    };

    (useAnalytics as any).mockReturnValue({
      analytics: mockAnalytics,
      loading: false,
      error: null
    });

    render(<DashboardStats />);
    
    // Check if the data is displayed correctly
    expect(screen.getByText('1,250')).toBeInTheDocument(); // activeUsers
    expect(screen.getByText('85')).toBeInTheDocument(); // completedJourneys
    expect(screen.getByText('12,400')).toBeInTheDocument(); // totalPoints
    expect(screen.getByText('68.5%')).toBeInTheDocument(); // engagementRate
    expect(screen.getByText('2h 15min')).toBeInTheDocument(); // avgSessionTime
  });

  it('should show correct trend indicators', () => {
    const mockAnalytics = {
      activeUsers: 1250,
      completedJourneys: 85,
      totalPoints: 12400,
      avgSessionTime: 135,
      engagementRate: 68.5,
      userGrowth: 12.5,
      journeyCompletionRate: 75.3
    };

    (useAnalytics as any).mockReturnValue({
      analytics: mockAnalytics,
      loading: false,
      error: null
    });

    render(<DashboardStats />);
    
    // Check for positive trend indicators
    const trendTexts = screen.getAllByText(/\+12\.5%/);
    expect(trendTexts.length).toBeGreaterThan(0);
  });
});