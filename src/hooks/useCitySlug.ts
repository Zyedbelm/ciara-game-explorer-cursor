
import { useLocation, useParams } from 'react-router-dom';

/**
 * Extract city slug from URL patterns:
 * /destinations/sion -> sion
 * /dashboard/sion -> sion
 * /sion/... -> sion
 */
export function useCitySlug(): string | null {
  const location = useLocation();
  const params = useParams();
  const pathname = location.pathname;
  
  console.log('🔍 useCitySlug - pathname:', pathname, 'params:', params);
  
  // First try to get slug from URL params (this is the most reliable way)
  // Check both 'slug' and 'citySlug' parameters for compatibility
  if (params.slug && params.slug !== 'undefined') {
    console.log('✅ useCitySlug - Found slug from params.slug:', params.slug);
    return params.slug;
  }
  
  if (params.citySlug && params.citySlug !== 'undefined') {
    console.log('✅ useCitySlug - Found slug from params.citySlug:', params.citySlug);
    return params.citySlug;
  }
  
  // Define routes that should NOT be treated as city slugs
  const excludedRoutes = [
    'auth', 
    'admin', 
    'profile', 
    'rewards', 
    'journey',
    'creator',
    'terms',
    'privacy',
    'contact',
    'cities',
    'faq',
    'legal',
    'cookies',
    'my-journeys',
    'partner-dashboard',
    'reset-password'
  ];
  
  // Clean the pathname and split into segments
  const segments = pathname.split('/').filter(segment => segment.length > 0);
  console.log('🔍 useCitySlug - URL segments:', segments);
  
  // Match patterns: /destinations/:slug, /dashboard/:slug
  if (segments.length >= 2) {
    if (segments[0] === 'destinations' && segments[1] && segments[1] !== 'undefined') {
      console.log('✅ useCitySlug - Found slug from destinations route:', segments[1]);
      return segments[1];
    }
    
    if (segments[0] === 'dashboard' && segments[1] && segments[1] !== 'undefined') {
      console.log('✅ useCitySlug - Found slug from dashboard route:', segments[1]);
      return segments[1];
    }
  }
  
  // For direct routes (/:slug), check if it's not an excluded route
  if (segments.length === 1) {
    const potentialSlug = segments[0];
    if (!excludedRoutes.includes(potentialSlug) && potentialSlug !== 'undefined') {
      console.log('✅ useCitySlug - Found slug from direct route:', potentialSlug);
      return potentialSlug;
    }
  }
  
  console.warn('🚨 useCitySlug: Could not extract city slug from:', pathname);
  return null;
}

export default useCitySlug;
