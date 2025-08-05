
import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAdminTranslation } from '@/utils/adminTranslations';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import JourneyContainer from '@/components/journey/JourneyContainer';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const JourneyDetailPage = () => {
  const { slug: citySlug, journeyId } = useParams();
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { currentLanguage } = useLanguage();

  // Memoize route validation to prevent unnecessary re-calculations
  const routeValidation = useMemo(() => {
    const isCitySlugValid = citySlug && citySlug !== 'undefined';
    const isJourneyIdValid = journeyId && journeyId !== 'undefined';
    
    return {
      isCitySlugValid,
      isJourneyIdValid,
      shouldRedirectToHome: !isCitySlugValid,
      shouldRedirectToDestination: isCitySlugValid && !isJourneyIdValid
    };
  }, [citySlug, journeyId]);

  // Check for invalid or undefined slug early
  if (routeValidation.shouldRedirectToHome) {
    return <Navigate to="/cities" replace />;
  }

  // Check for invalid journey ID
  if (routeValidation.shouldRedirectToDestination) {
    return <Navigate to={`/destinations/${citySlug}`} replace />;
  }

  // Wait for auth to load before making redirection decisions
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton title={getAdminTranslation('journey.detail.loading', currentLanguage)} />
        <div className="container mx-auto px-2 sm:px-4 py-8">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  // Only redirect to destination page if user is not authenticated AND auth has finished loading
  if (!user && !authLoading) {
    return <Navigate to={`/destinations/${citySlug}`} replace />;
  }

  // Simple container that delegates everything to JourneyContainer
  return <JourneyContainer journeyId={journeyId!} />;
};

export default JourneyDetailPage;
