// =============================================================================
// CENTRALIZED LOGGING SYSTEM - PHASE 2 IMPLEMENTATION
// =============================================================================
// Advanced logging system with structured logs, metrics, and alerting

import { supabase } from '@/integrations/supabase/client';

// Log levels and types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type LogCategory = 
  | 'email' 
  | 'auth' 
  | 'journey' 
  | 'payment' 
  | 'security' 
  | 'performance' 
  | 'system';

export interface LogEntry {
  id?: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  emailId?: string;
  functionName?: string;
  duration?: number;
  success?: boolean;
  errorCode?: string;
  retryCount?: number;
  metadata?: Record<string, any>;
}

export interface EmailMetrics {
  sent: number;
  failed: number;
  retried: number;
  bounced: number;
  opened: number;
  clicked: number;
  successRate: number;
  averageDeliveryTime: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  activeUsers: number;
  memoryUsage?: number;
}

class CiaraLogger {
  private sessionId: string;
  private userId?: string;
  private batchLogs: LogEntry[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startBatchFlush();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startBatchFlush() {
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Core logging method
  async log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, any>
  ): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    // Console logging for development
    this.consoleLog(logEntry);

    // Add to batch
    this.batchLogs.push(logEntry);

    // Immediate flush for critical errors
    if (level === 'critical' || level === 'error') {
      await this.flushLogs();
    } else if (this.batchLogs.length >= this.batchSize) {
      await this.flushLogs();
    }
  }

  private consoleLog(entry: LogEntry) {
    const prefix = `[${entry.level.toUpperCase()}][${entry.category}]`;
    const message = `${prefix} ${entry.message}`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.context);
        break;
      case 'info':
        console.info(message, entry.context);
        break;
      case 'warn':
        console.warn(message, entry.context);
        break;
      case 'error':
      case 'critical':
        console.error(message, entry.context);
        break;
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.batchLogs.length === 0) return;

    const logsToFlush = [...this.batchLogs];
    this.batchLogs = [];

    try {
      const { error } = await supabase.functions.invoke('log-collector', {
        body: { logs: logsToFlush }
      });

      if (error) {
        console.error('Failed to flush logs:', error);
        // Re-add logs to batch if flush failed (but limit to prevent infinite growth)
        this.batchLogs = [...logsToFlush.slice(-5), ...this.batchLogs];
      }
    } catch (error) {
      console.error('Error flushing logs:', error);
    }
  }

  // Convenience methods
  debug(category: LogCategory, message: string, context?: Record<string, any>) {
    return this.log('debug', category, message, context);
  }

  info(category: LogCategory, message: string, context?: Record<string, any>) {
    return this.log('info', category, message, context);
  }

  warn(category: LogCategory, message: string, context?: Record<string, any>) {
    return this.log('warn', category, message, context);
  }

  error(category: LogCategory, message: string, context?: Record<string, any>) {
    return this.log('error', category, message, context);
  }

  critical(category: LogCategory, message: string, context?: Record<string, any>) {
    return this.log('critical', category, message, context);
  }

  // Email-specific logging
  async logEmailEvent(
    event: 'sent' | 'failed' | 'retried' | 'bounced' | 'opened' | 'clicked',
    emailId: string,
    context?: Record<string, any>
  ) {
    const level: LogLevel = event === 'failed' ? 'error' : 'info';
    return this.log(level, 'email', `Email ${event}`, {
      emailId,
      event,
      ...context
    });
  }

  // Performance logging
  async logPerformance(
    functionName: string,
    duration: number,
    success: boolean,
    context?: Record<string, any>
  ) {
    const level: LogLevel = success ? 'info' : 'warn';
    return this.log(level, 'performance', `Function ${functionName} completed`, {
      functionName,
      duration,
      success,
      ...context
    });
  }

  // Security logging
  async logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: Record<string, any>
  ) {
    const levelMap: Record<string, LogLevel> = {
      low: 'info',
      medium: 'warn',
      high: 'error',
      critical: 'critical'
    };

    return this.log(levelMap[severity], 'security', event, context);
  }

  // Metrics collection
  async getEmailMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<EmailMetrics> {
    try {
      const { data, error } = await supabase.functions.invoke('get-email-metrics', {
        body: { timeRange }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      await this.error('system', 'Failed to fetch email metrics', { error });
      throw error;
    }
  }

  async getPerformanceMetrics(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<PerformanceMetrics> {
    try {
      const { data, error } = await supabase.functions.invoke('get-performance-metrics', {
        body: { timeRange }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      await this.error('system', 'Failed to fetch performance metrics', { error });
      throw error;
    }
  }

  // Search logs
  async searchLogs(
    filters: {
      level?: LogLevel[];
      category?: LogCategory[];
      timeRange?: { start: string; end: string };
      userId?: string;
      limit?: number;
    }
  ): Promise<LogEntry[]> {
    try {
      const { data, error } = await supabase.functions.invoke('search-logs', {
        body: filters
      });

      if (error) throw error;
      return data;
    } catch (error) {
      await this.error('system', 'Failed to search logs', { error, filters });
      throw error;
    }
  }

  // Cleanup
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushLogs(); // Final flush
  }
}

// Singleton logger instance
export const logger = new CiaraLogger();

// React hook for logging
export const useLogger = () => {
  return logger;
};

// Performance tracking decorator
export function trackPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = performance.now();
    let success = true;
    let error: any = null;

    try {
      const result = await method.apply(this, args);
      return result;
    } catch (err) {
      success = false;
      error = err;
      throw err;
    } finally {
      const duration = performance.now() - start;
      logger.logPerformance(propertyName, duration, success, { error: error?.message });
    }
  };

  return descriptor;
}

// Error boundary logger
export const logError = (error: Error, componentStack?: string, errorBoundary?: string) => {
  logger.critical('system', 'React Error Boundary triggered', {
    error: error.message,
    stack: error.stack,
    componentStack,
    errorBoundary
  });
};

export default logger;