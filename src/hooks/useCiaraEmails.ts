// =============================================================================
// REFACTORED CIARA EMAILS HOOK - PHASE 1 IMPLEMENTATION
// =============================================================================
// This hook now uses the unified email service with enhanced error handling.

import { useCallback } from 'react';
import { useEmailService, type WelcomeEmailData } from '@/services/emailService';

/**
 * Refactored CIARA emails hook using the unified email service.
 * Now provides better error handling, logging, and retry mechanisms.
 * 
 * @deprecated Consider using useEmailService directly for new implementations
 */
export function useCiaraEmails() {
  const emailService = useEmailService();

  const sendWelcomeEmail = useCallback(async (data: WelcomeEmailData) => {
    return emailService.sendWelcomeEmail(data);
  }, [emailService]);

  // Additional methods available through the service
  const sendJourneyCompletionEmail = useCallback(async (data: Parameters<typeof emailService.sendJourneyCompletionEmail>[0]) => {
    return emailService.sendJourneyCompletionEmail(data);
  }, [emailService]);

  const sendRewardNotificationEmail = useCallback(async (data: Parameters<typeof emailService.sendRewardNotificationEmail>[0]) => {
    return emailService.sendRewardNotificationEmail(data);
  }, [emailService]);

  // Health check method
  const checkHealth = useCallback(async () => {
    return emailService.healthCheck();
  }, [emailService]);

  return {
    sendWelcomeEmail,
    sendJourneyCompletionEmail,
    sendRewardNotificationEmail,
    checkHealth,
    // Direct access to the full email service
    emailService,
  };
}