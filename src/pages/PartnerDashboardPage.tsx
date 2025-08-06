import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PartnerDashboardNew from '@/components/admin/PartnerDashboardNew';

const PartnerDashboardPage: React.FC = () => {
  const { isAuthenticated, isPartner, loading } = useAuth();

  // Redirection si non authentifié
  if (!loading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirection si pas un partenaire
  if (!loading && !isPartner()) {
    return <Navigate to="/" replace />;
  }

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <PartnerDashboardNew />;
};

export default PartnerDashboardPage; 