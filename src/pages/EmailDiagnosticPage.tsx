import React from 'react';
import { StandardPageLayout } from '@/components/layout';
import EmailDiagnosticDashboard from '@/components/admin/EmailDiagnosticDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const EmailDiagnosticPage = () => {
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !profile || !['super_admin', 'tenant_admin'].includes(profile.role)) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <StandardPageLayout>
      <div className="container mx-auto py-6">
        <EmailDiagnosticDashboard />
      </div>
    </StandardPageLayout>
  );
};

export default EmailDiagnosticPage;