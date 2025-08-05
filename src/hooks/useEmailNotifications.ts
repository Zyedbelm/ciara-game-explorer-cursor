
// =============================================================================
// REFACTORED EMAIL NOTIFICATIONS HOOK - PHASE 1 IMPLEMENTATION
// =============================================================================
// This hook now uses the unified email service for better error handling,
// logging, and consistency across the application.

import { useEmailService } from '@/services/emailService';
import type {
  WelcomeEmailData,
  JourneyCompletionData,
  InactiveReminderData,
  RewardNotificationData,
  SecurityAlertData,
  PartnerWelcomeData,
  PartnerOfferNotificationData,
  NewRewardsNotificationData,
  EmailConfirmationData,
  PackageInquiryData
} from '@/services/emailService';

/**
 * Refactored email notifications hook using the unified email service.
 * Provides consistent error handling, logging, and retry mechanisms.
 * 
 * @deprecated Consider using useEmailService directly for new implementations
 */
export const useEmailNotifications = () => {
  const emailService = useEmailService();

  // Wrapper methods for backward compatibility
  const sendWelcomeEmail = async (data: WelcomeEmailData) => {
    return emailService.sendWelcomeEmail(data);
  };

  const sendJourneyCompletionEmail = async (data: JourneyCompletionData) => {
    return emailService.sendJourneyCompletionEmail(data);
  };

  const sendInactiveReminderEmail = async (data: InactiveReminderData) => {
    return emailService.sendInactiveReminderEmail(data);
  };

  const sendRewardNotificationEmail = async (data: RewardNotificationData) => {
    return emailService.sendRewardNotificationEmail(data);
  };

  const sendSecurityAlertEmail = async (data: SecurityAlertData) => {
    return emailService.sendSecurityAlertEmail(data);
  };

  const sendPartnerWelcomeEmail = async (data: PartnerWelcomeData) => {
    return emailService.sendPartnerWelcomeEmail(data);
  };

  const sendPartnerOfferNotificationEmail = async (data: PartnerOfferNotificationData) => {
    return emailService.sendPartnerOfferNotificationEmail(data);
  };

  // New methods available through the unified service
  const sendNewRewardsNotificationEmail = async (data: NewRewardsNotificationData) => {
    return emailService.sendNewRewardsNotificationEmail(data);
  };

  const sendEmailConfirmation = async (data: EmailConfirmationData) => {
    return emailService.sendEmailConfirmation(data);
  };

  const sendPackageInquiry = async (data: PackageInquiryData) => {
    return emailService.sendPackageInquiry(data);
  };

  // Batch operations
  const sendBatchEmails = async (emails: Array<{ type: string; data: any }>) => {
    return emailService.sendBatchEmails(emails);
  };

  // Health check
  const checkEmailServiceHealth = async () => {
    return emailService.healthCheck();
  };

  return {
    // Existing methods (backward compatibility)
    sendWelcomeEmail,
    sendJourneyCompletionEmail,
    sendInactiveReminderEmail,
    sendRewardNotificationEmail,
    sendSecurityAlertEmail,
    sendPartnerWelcomeEmail,
    sendPartnerOfferNotificationEmail,
    
    // New methods
    sendNewRewardsNotificationEmail,
    sendEmailConfirmation,
    sendPackageInquiry,
    sendBatchEmails,
    checkEmailServiceHealth,
    
    // Direct access to email service
    emailService,
  };
};

// Re-export types for backward compatibility
export type {
  WelcomeEmailData,
  JourneyCompletionData,
  InactiveReminderData,
  RewardNotificationData,
  SecurityAlertData,
  PartnerWelcomeData,
  PartnerOfferNotificationData,
  NewRewardsNotificationData,
  EmailConfirmationData,
  PackageInquiryData
};
