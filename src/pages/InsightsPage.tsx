import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { EnhancedInsightsDashboard } from '@/components/admin/EnhancedInsightsDashboard';

const InsightsPage: React.FC = () => {
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();

  // Vérifier les permissions
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  const canViewAnalytics = ['super_admin', 'tenant_admin'].includes(profile.role);
  
  if (!canViewAnalytics) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Accès Refusé</h1>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder aux insights avancés.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isTenantAdmin = profile.role === 'tenant_admin';
  const cityId = isTenantAdmin ? profile.city_id : undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <EnhancedInsightsDashboard cityId={cityId} />
      </div>
    </div>
  );
};

export default InsightsPage;