
/**
 * Navigation utilities for journey-related actions
 */

interface NavigationOptions {
  citySlug: string;
  journeyId: string;
}

/**
 * Constructs a safe journey URL
 */
export function buildJourneyUrl({ citySlug, journeyId }: NavigationOptions): string {
  if (!citySlug || citySlug === 'undefined') {
    throw new Error('Invalid city slug for navigation');
  }
  
  if (!journeyId || journeyId === 'undefined') {
    throw new Error('Invalid journey ID for navigation');
  }
  
  return `/destinations/${citySlug}/journey/${journeyId}`;
}

/**
 * Safely navigates to a journey page
 */
export function navigateToJourney(
  navigate: (url: string) => void,
  options: NavigationOptions
): void {
  try {
    const url = buildJourneyUrl(options);
    console.log('🔗 Navigating to:', url);
    navigate(url);
  } catch (error) {
    console.error('❌ Navigation failed:', error);
    throw error;
  }
}
