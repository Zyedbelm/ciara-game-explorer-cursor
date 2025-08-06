
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { useCitySlug } from './useCitySlug';
import { navigateToJourney as navigateToJourneyUtil } from '@/utils/navigationHelpers';
import { useCityOptional } from '@/contexts/CityContext';

/**
 * Hook centralisé pour la navigation avec gestion robuste des slugs
 */
export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { city } = useCityOptional();
  const citySlug = useCitySlug();

  // Mémoriser le slug valide pour éviter les recalculs
  const validCitySlug = useMemo(() => {
    // Priority: city context > hook > URL extraction
    if (city?.slug && city.slug !== 'undefined') {
      return city.slug;
    }
    
    if (citySlug && citySlug !== 'undefined') {
      return citySlug;
    }
    
    // Last resort: extract from current URL
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 2 && pathSegments[0] === 'destinations' && pathSegments[1] !== 'undefined') {
      return pathSegments[1];
    }
    
    return null;
  }, [city?.slug, citySlug, location.pathname]);

  // Navigation sécurisée vers les parcours
  const navigateToJourney = useCallback((journeyId: string) => {
    if (!validCitySlug) {
      throw new Error('Invalid city context for navigation');
    }

    try {
      navigateToJourneyUtil(navigate, {
        citySlug: validCitySlug,
        journeyId
      });
    } catch (error) {
      throw error;
    }
  }, [validCitySlug, navigate]);

  // Navigation sécurisée vers les destinations
  const navigateToDestination = useCallback(() => {
    if (!validCitySlug) {
      navigate('/cities');
      return;
    }

    const targetUrl = `/destinations/${validCitySlug}`;
    navigate(targetUrl);
  }, [validCitySlug, navigate]);

  return {
    validCitySlug,
    navigateToJourney,
    navigateToDestination,
    navigate, // Pour les cas d'usage avancés
  };
}
