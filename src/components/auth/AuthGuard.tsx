
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string[];
  fallbackPath?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredRole = [],
  fallbackPath = '/auth'
}) => {
  const { isAuthenticated, profile, loading: authLoading } = useAuth();
  const location = useLocation();

  // Show loading while authentication state is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If specific role is required but user doesn't have it
  if (requiredRole.length > 0 && profile && !requiredRole.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }
  
  // Debug logging for partner dashboard access
  if (location.pathname === '/partner-dashboard') {
  }

  // If user is authenticated but trying to access auth pages, redirect to home
  // Exception: Allow access to reset-password page even if authenticated (for password reset flow)
  if (!requireAuth && isAuthenticated && location.pathname === '/auth') {
    return <Navigate to="/" replace />;
  }

  // Allow access to reset-password page even if authenticated
  if (location.pathname === '/reset-password') {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default AuthGuard;
