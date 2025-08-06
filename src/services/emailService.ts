// =============================================================================
// CENTRALIZED EMAIL SERVICE - PHASE 1 IMPLEMENTATION
// =============================================================================
// Unified email service with error handling, logging, and retry mechanisms

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Email service error types
export class EmailServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

// Email template types
export interface BaseEmailData {
  email: string;
  userName?: string;
  name?: string;
  lang?: 'fr' | 'en';
}

export interface WelcomeEmailData extends BaseEmailData {
  loginUrl?: string;
}

export interface JourneyCompletionData extends BaseEmailData {
  journeyName: string;
  pointsEarned: number;
  totalPoints: number;
  newLevel?: number;
  rewardsUrl?: string;
}

export interface InactiveReminderData extends BaseEmailData {
  daysSinceLastActivity: number;
  incompleteJourneys: Array<{name: string; progress: number}>;
  continueUrl?: string;
}

export interface RewardNotificationData extends BaseEmailData {
  rewardName: string;
  rewardDescription: string;
  rewardValue: string;
  expirationDate?: string;
  redeemUrl?: string;
  qrCode?: string;
}

export interface SecurityAlertData extends BaseEmailData {
  alertType: string;
  alertMessage: string;
  timestamp: string;
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
  supportUrl?: string;
}

export interface PartnerWelcomeData {
  partnerName: string;
  partnerEmail: string;
  cityName: string;
  contactEmail?: string;
  contactName?: string;
  lang?: 'fr' | 'en';
}

export interface PartnerOfferNotificationData {
  partnerName: string;
  partnerEmail: string;
  offerTitle: string;
  offerDescription: string;
  pointsRequired: number;
  validityDays: number;
  maxRedemptions?: number;
  cityName: string;
  createdBy?: string;
  lang?: 'fr' | 'en';
}

export interface NewRewardsNotificationData extends BaseEmailData {
  cityName: string;
  userPoints: number;
  newRewards: Array<{
    name: string;
    description: string;
    pointsRequired: number;
  }>;
}

export interface EmailConfirmationData extends BaseEmailData {
  confirmationUrl: string;
}

export interface PackageInquiryData {
  packageName: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  cityName: string;
  message?: string;
  lang?: 'fr' | 'en';
}

// Email service configuration
interface EmailServiceConfig {
  maxRetries: number;
  retryDelay: number;
  enableLogging: boolean;
}

const DEFAULT_CONFIG: EmailServiceConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  enableLogging: true,
};

// Email service class
export class CiaraEmailService {
  private config: EmailServiceConfig;
  private toast: ReturnType<typeof useToast>['toast'] | null = null;

  constructor(config: Partial<EmailServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Initialize with toast (for client-side usage)
  setToastHandler(toast: ReturnType<typeof useToast>['toast']) {
    this.toast = toast;
  }

  // Centralized logging
  private log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    if (!this.config.enableLogging) return;
    
    const logMessage = `[EmailService] ${message}`;
    const logData = data ? { data } : undefined;
    
    switch (level) {
      case 'info':
        break;
      case 'warn':
        break;
      case 'error':
        break;
    }
  }

  // Centralized error handling
  private handleError(error: unknown, operation: string): EmailServiceError {
    this.log('error', `Error in ${operation}`, error);
    
    if (error instanceof EmailServiceError) {
      return error;
    }
    
    // Supabase errors
    if (error && typeof error === 'object' && 'message' in error) {
      const supabaseError = error as { message: string; code?: string };
      return new EmailServiceError(
        `Email service error: ${supabaseError.message}`,
        supabaseError.code || 'SUPABASE_ERROR',
        true, // Most Supabase errors are retryable
        error
      );
    }
    
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new EmailServiceError(
        'Network error: Unable to send email',
        'NETWORK_ERROR',
        true,
        error
      );
    }
    
    // Generic error
    return new EmailServiceError(
      error instanceof Error ? error.message : 'Unknown email service error',
      'UNKNOWN_ERROR',
      false,
      error
    );
  }

  // Retry mechanism
  private async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: EmailServiceError | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        this.log('info', `${operationName} - Attempt ${attempt}/${this.config.maxRetries}`);
        return await operation();
      } catch (error) {
        lastError = this.handleError(error, operationName);
        
        if (!lastError.retryable || attempt === this.config.maxRetries) {
          break;
        }
        
        this.log('warn', `${operationName} failed, retrying in ${this.config.retryDelay}ms`, lastError);
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      }
    }
    
    throw lastError;
  }

  // Show toast notification
  private showToast(type: 'success' | 'error', title: string, description: string) {
    if (!this.toast) return;
    
    this.toast({
      title,
      description,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  }

  // Generic email sending method
  private async sendEmail(
    functionName: string,
    data: any,
    successMessage: string = 'Email envoyé avec succès'
  ): Promise<any> {
    return this.retryOperation(async () => {
      this.log('info', `Sending email via ${functionName}`, { email: data.email });
      
      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body: data
      });

      if (error) {
        throw new EmailServiceError(
          `Failed to send email: ${error.message}`,
          'FUNCTION_ERROR',
          true,
          error
        );
      }

      this.log('info', `Email sent successfully via ${functionName}`);
      this.showToast('success', 'Succès', successMessage);
      
      return result;
    }, `sendEmail:${functionName}`);
  }

  // Email type methods
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<any> {
    return this.sendEmail(
      'send-welcome-ciara',
      data,
      'Email de bienvenue envoyé avec succès'
    );
  }

  async sendJourneyCompletionEmail(data: JourneyCompletionData): Promise<any> {
    return this.sendEmail(
      'send-journey-completion',
      data,
      'Email de félicitations envoyé avec succès'
    );
  }

  async sendInactiveReminderEmail(data: InactiveReminderData): Promise<any> {
    return this.sendEmail(
      'send-inactive-reminder',
      data,
      'Email de rappel envoyé avec succès'
    );
  }

  async sendRewardNotificationEmail(data: RewardNotificationData): Promise<any> {
    return this.sendEmail(
      'send-reward-notification',
      data,
      'Notification de récompense envoyée avec succès'
    );
  }

  async sendSecurityAlertEmail(data: SecurityAlertData): Promise<any> {
    return this.sendEmail(
      'send-security-alert',
      data,
      'Alerte de sécurité envoyée avec succès'
    );
  }

  async sendPartnerWelcomeEmail(data: PartnerWelcomeData): Promise<any> {
    return this.sendEmail(
      'send-partner-welcome',
      data,
      'Email de bienvenue partenaire envoyé avec succès'
    );
  }

  async sendPartnerOfferNotificationEmail(data: PartnerOfferNotificationData): Promise<any> {
    return this.sendEmail(
      'send-partner-offer-notification',
      data,
      'Notification d\'offre partenaire envoyée avec succès'
    );
  }

  async sendNewRewardsNotificationEmail(data: NewRewardsNotificationData): Promise<any> {
    return this.sendEmail(
      'send-new-rewards-notification',
      data,
      'Notification de nouvelles récompenses envoyée avec succès'
    );
  }

  async sendEmailConfirmation(data: EmailConfirmationData): Promise<any> {
    return this.sendEmail(
      'send-email-confirmation',
      data,
      'Email de confirmation envoyé avec succès'
    );
  }

  async sendPackageInquiry(data: PackageInquiryData): Promise<any> {
    return this.sendEmail(
      'send-package-inquiry',
      data,
      'Demande d\'information envoyée avec succès'
    );
  }

  // Batch email sending (for future implementation)
  async sendBatchEmails(emails: Array<{
    type: string;
    data: any;
  }>): Promise<Array<{ success: boolean; error?: EmailServiceError }>> {
    this.log('info', `Sending batch of ${emails.length} emails`);
    
    const results = await Promise.allSettled(
      emails.map(async (email) => {
        const methodName = `send${email.type}Email` as keyof this;
        const method = this[methodName];
        
        if (typeof method === 'function') {
          return (method as Function).call(this, email.data);
        } else {
          throw new EmailServiceError(
            `Unknown email type: ${email.type}`,
            'UNKNOWN_EMAIL_TYPE'
          );
        }
      })
    );

    return results.map((result) => ({
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? 
        this.handleError(result.reason, 'batchEmail') : undefined
    }));
  }

  // Health check method
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string }> {
    try {
      // Simple health check by testing the welcome email function
      const testData: WelcomeEmailData = {
        email: 'health-check@test.local',
        userName: 'Health Check',
        lang: 'fr'
      };

      // Don't actually send, just test the function invocation
      const { error } = await supabase.functions.invoke('send-welcome-ciara', {
        body: { ...testData, dryRun: true }
      });

      if (error && !error.message.includes('dry run')) {
        throw error;
      }

      return { status: 'healthy', details: 'Email service is operational' };
    } catch (error) {
      this.log('error', 'Health check failed', error);
      return { 
        status: 'unhealthy', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Singleton instance
export const emailService = new CiaraEmailService();

// Hook for React components
export const useEmailService = () => {
  const { toast } = useToast();
  
  // Initialize toast handler if not already set
  if (!emailService['toast']) {
    emailService.setToastHandler(toast);
  }
  
  return emailService;
};

// Export for backward compatibility and type safety
export {
  CiaraEmailService as EmailService,
  EmailServiceError as EmailError
};