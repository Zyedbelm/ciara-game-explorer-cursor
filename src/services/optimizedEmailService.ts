// =============================================================================
// OPTIMIZED EMAIL SERVICE - PHASE 3 IMPLEMENTATION  
// =============================================================================
// Performance-optimized email service with caching, pooling, and batching

import { EmailService, EmailServiceError } from './emailService';
import { emailTemplateCache, optimizedRenderer } from './emailCacheService';
import { logger } from './loggingService';
import { supabase } from '@/integrations/supabase/client';

export interface EmailQueueItem {
  id: string;
  type: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  retryCount: number;
  scheduledAt: Date;
  createdAt: Date;
}

export interface BatchEmailConfig {
  batchSize: number;
  maxConcurrent: number;
  delayBetweenBatches: number;
  enablePrioritization: boolean;
}

export interface PerformanceConfig {
  enableCaching: boolean;
  cacheTemplates: boolean;
  enableBatching: boolean;
  enableCompression: boolean;
  poolSize: number;
  maxRetries: number;
  timeoutMs: number;
}

class OptimizedEmailService extends EmailService {
  private emailQueue: EmailQueueItem[] = [];
  private processingQueue = false;
  private connectionPool: Set<string> = new Set();
  private performanceConfig: PerformanceConfig;
  private batchConfig: BatchEmailConfig;

  constructor(
    performanceConfig: Partial<PerformanceConfig> = {},
    batchConfig: Partial<BatchEmailConfig> = {}
  ) {
    super();
    
    this.performanceConfig = {
      enableCaching: true,
      cacheTemplates: true,
      enableBatching: true,
      enableCompression: true,
      poolSize: 10,
      maxRetries: 3,
      timeoutMs: 30000,
      ...performanceConfig
    };

    this.batchConfig = {
      batchSize: 50,
      maxConcurrent: 5,
      delayBetweenBatches: 1000,
      enablePrioritization: true,
      ...batchConfig
    };

    this.initializeConnectionPool();
    this.startQueueProcessor();
  }

  // Initialize connection pool
  private initializeConnectionPool(): void {
    for (let i = 0; i < this.performanceConfig.poolSize; i++) {
      this.connectionPool.add(`connection-${i}`);
    }
    logger.info('performance', 'Connection pool initialized', { 
      poolSize: this.performanceConfig.poolSize 
    });
  }

  // Optimized template rendering with caching
  private async renderEmailTemplate(
    templateType: string,
    data: any,
    lang: string = 'fr'
  ): Promise<string> {
    if (!this.performanceConfig.cacheTemplates) {
      // Direct rendering without cache
      return this.directRenderTemplate(templateType, data, lang);
    }

    return optimizedRenderer.renderTemplate(
      templateType,
      lang,
      data,
      () => this.directRenderTemplate(templateType, data, lang),
      {
        ttl: 1800000, // 30 minutes
        variant: data.variant || 'default'
      }
    );
  }

  // Direct template rendering (fallback)
  private async directRenderTemplate(
    templateType: string,
    data: any,
    lang: string
  ): Promise<string> {
    // Simulate template rendering
    const template = `
      <html>
        <body>
          <h1>${templateType} - ${lang}</h1>
          <p>Data: ${JSON.stringify(data)}</p>
        </body>
      </html>
    `;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return template;
  }

  // Enhanced email sending with performance optimizations
  async sendOptimizedEmail(
    functionName: string,
    data: any,
    options: {
      priority?: 'low' | 'normal' | 'high' | 'critical';
      template?: string;
      lang?: string;
      scheduling?: Date;
      trackingId?: string;
    } = {}
  ): Promise<any> {
    const startTime = performance.now();
    const emailId = this.generateEmailId();

    try {
      // Pre-render template if specified
      if (options.template && this.performanceConfig.cacheTemplates) {
        const rendered = await this.renderEmailTemplate(
          options.template,
          data,
          options.lang
        );
        data.renderedTemplate = rendered;
      }

      // Add to queue if batching enabled
      if (this.performanceConfig.enableBatching && options.priority !== 'critical') {
        return this.queueEmail(functionName, data, options);
      }

      // Direct send for critical emails
      const result = await this.sendEmailWithPool(functionName, data, emailId);
      
      const duration = performance.now() - startTime;
      logger.logPerformance(`optimizedEmail:${functionName}`, duration, true, {
        emailId,
        priority: options.priority,
        batched: false
      });

      return result;

    } catch (error) {
      const duration = performance.now() - startTime;
      logger.logPerformance(`optimizedEmail:${functionName}`, duration, false, {
        emailId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Send email using connection pool
  private async sendEmailWithPool(
    functionName: string,
    data: any,
    emailId: string
  ): Promise<any> {
    // Wait for available connection
    const connection = await this.acquireConnection();
    
    try {
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email send timeout')), this.performanceConfig.timeoutMs);
      });

      const sendPromise = supabase.functions.invoke(functionName, {
        body: { ...data, emailId }
      });

      const { data: result, error } = await Promise.race([sendPromise, timeoutPromise]) as any;

      if (error) {
        throw new EmailServiceError(
          `Optimized email send failed: ${error.message}`,
          'SEND_ERROR',
          true,
          error
        );
      }

      logger.logEmailEvent('sent', emailId, { functionName, optimized: true });
      return result;

    } finally {
      this.releaseConnection(connection);
    }
  }

  // Queue email for batch processing
  private async queueEmail(
    functionName: string,
    data: any,
    options: any
  ): Promise<{ queued: true; emailId: string }> {
    const emailId = this.generateEmailId();
    const queueItem: EmailQueueItem = {
      id: emailId,
      type: functionName,
      data,
      priority: options.priority || 'normal',
      retryCount: 0,
      scheduledAt: options.scheduling || new Date(),
      createdAt: new Date()
    };

    this.emailQueue.push(queueItem);
    this.sortQueueByPriority();

    logger.debug('performance', 'Email queued', { 
      emailId, 
      functionName, 
      priority: queueItem.priority,
      queueSize: this.emailQueue.length 
    });

    return { queued: true, emailId };
  }

  // Sort queue by priority and schedule time
  private sortQueueByPriority(): void {
    if (!this.batchConfig.enablePrioritization) return;

    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    
    this.emailQueue.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by scheduled time
      return a.scheduledAt.getTime() - b.scheduledAt.getTime();
    });
  }

  // Process email queue in batches
  private startQueueProcessor(): void {
    setInterval(async () => {
      if (this.processingQueue || this.emailQueue.length === 0) return;
      
      this.processingQueue = true;
      await this.processEmailBatch();
      this.processingQueue = false;
    }, this.batchConfig.delayBetweenBatches);
  }

  // Process a batch of emails
  private async processEmailBatch(): Promise<void> {
    const now = new Date();
    const readyEmails = this.emailQueue.filter(email => email.scheduledAt <= now);
    
    if (readyEmails.length === 0) return;

    const batch = readyEmails.splice(0, this.batchConfig.batchSize);
    this.emailQueue = this.emailQueue.filter(email => !batch.includes(email));

    logger.info('performance', 'Processing email batch', { 
      batchSize: batch.length,
      remaining: this.emailQueue.length 
    });

    // Process batch in chunks
    const chunks = this.chunkArray(batch, this.batchConfig.maxConcurrent);
    
    for (const chunk of chunks) {
      const promises = chunk.map(email => this.processSingleEmail(email));
      await Promise.allSettled(promises);
    }
  }

  // Process single email from queue
  private async processSingleEmail(email: EmailQueueItem): Promise<void> {
    try {
      await this.sendEmailWithPool(email.type, email.data, email.id);
      logger.debug('performance', 'Batch email sent', { emailId: email.id });
    } catch (error) {
      email.retryCount++;
      
      if (email.retryCount < this.performanceConfig.maxRetries) {
        // Re-queue with delay
        email.scheduledAt = new Date(Date.now() + (email.retryCount * 5000));
        this.emailQueue.push(email);
        logger.warn('performance', 'Email retry queued', { 
          emailId: email.id, 
          retryCount: email.retryCount 
        });
      } else {
        logger.error('performance', 'Email failed permanently', { 
          emailId: email.id, 
          error 
        });
        logger.logEmailEvent('failed', email.id, { 
          reason: 'max_retries_exceeded',
          retryCount: email.retryCount 
        });
      }
    }
  }

  // Connection pool management
  private async acquireConnection(): Promise<string> {
    while (this.connectionPool.size === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const connection = this.connectionPool.values().next().value;
    this.connectionPool.delete(connection);
    return connection;
  }

  private releaseConnection(connection: string): void {
    this.connectionPool.add(connection);
  }

  // Utility methods
  private generateEmailId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Performance monitoring
  async getPerformanceMetrics(): Promise<{
    queueSize: number;
    connectionPoolSize: number;
    cacheStats: any;
    processingStatus: boolean;
  }> {
    return {
      queueSize: this.emailQueue.length,
      connectionPoolSize: this.connectionPool.size,
      cacheStats: emailTemplateCache.getStats(),
      processingStatus: this.processingQueue
    };
  }

  // Cache management
  invalidateTemplateCache(templateType?: string): number {
    if (templateType) {
      return optimizedRenderer.invalidateTemplateType(templateType);
    } else {
      emailTemplateCache.clear();
      return 0;
    }
  }

  // Override parent methods with optimizations
  async sendWelcomeEmail(data: any): Promise<any> {
    return this.sendOptimizedEmail('send-welcome-ciara', data, {
      template: 'welcome',
      lang: data.lang || 'fr',
      priority: 'normal'
    });
  }

  async sendJourneyCompletionEmail(data: any): Promise<any> {
    return this.sendOptimizedEmail('send-journey-completion', data, {
      template: 'journey_completion',
      lang: data.lang || 'fr',
      priority: 'normal'
    });
  }

  async sendSecurityAlertEmail(data: any): Promise<any> {
    return this.sendOptimizedEmail('send-security-alert', data, {
      template: 'security_alert',
      lang: data.lang || 'fr',
      priority: 'critical' // Security alerts are always critical
    });
  }

  // Preload common templates
  async preloadCommonTemplates(): Promise<void> {
    const commonTemplates = [
      { type: 'welcome', lang: 'fr', data: { userName: 'test' } },
      { type: 'welcome', lang: 'en', data: { userName: 'test' } },
      { type: 'journey_completion', lang: 'fr', data: { journeyName: 'test', pointsEarned: 100 } },
      { type: 'journey_completion', lang: 'en', data: { journeyName: 'test', pointsEarned: 100 } }
    ];

    await emailTemplateCache.preloadTemplates(
      commonTemplates.map(template => ({
        ...template,
        generator: () => this.directRenderTemplate(template.type, template.data, template.lang)
      }))
    );
  }
}

// Export optimized service instance
export const optimizedEmailService = new OptimizedEmailService({
  enableCaching: true,
  cacheTemplates: true,
  enableBatching: true,
  enableCompression: true,
  poolSize: 8,
  maxRetries: 3,
  timeoutMs: 25000
}, {
  batchSize: 30,
  maxConcurrent: 4,
  delayBetweenBatches: 2000,
  enablePrioritization: true
});

// React hook for optimized email service
export const useOptimizedEmailService = () => {
  return optimizedEmailService;
};