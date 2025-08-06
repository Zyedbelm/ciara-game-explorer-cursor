import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PartnerAnalytics from '@/components/admin/PartnerAnalytics';
import PartnerHeader from '@/components/common/PartnerHeader';
import Footer from '@/components/common/Footer';

const PartnerAnalyticsPage: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PartnerHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <PartnerAnalytics />
      </main>
      <Footer />
    </div>
  );
};

export default PartnerAnalyticsPage; 