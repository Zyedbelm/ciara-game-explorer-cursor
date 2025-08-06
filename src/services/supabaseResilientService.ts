import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types pour la résilience
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  threshold: number;
  timeout: number;
}

// Configuration par défaut
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

const DEFAULT_CIRCUIT_BREAKER: CircuitBreakerState = {
  isOpen: false,
  failureCount: 0,
  lastFailureTime: 0,
  threshold: 5,
  timeout: 30000 // 30 secondes
};

class SupabaseResilientService {
  private retryConfig: RetryConfig;
  private circuitBreakers: Map<string, CircuitBreakerState>;
  private requestQueue: Map<string, Promise<any>>;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    this.circuitBreakers = new Map();
    this.requestQueue = new Map();
    this.cache = new Map();
  }

  // Circuit Breaker Logic
  private getCircuitBreaker(key: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, { ...DEFAULT_CIRCUIT_BREAKER });
    }
    return this.circuitBreakers.get(key)!;
  }

  private updateCircuitBreaker(key: string, success: boolean): void {
    const cb = this.getCircuitBreaker(key);
    
    if (success) {
      cb.failureCount = 0;
      cb.isOpen = false;
    } else {
      cb.failureCount++;
      cb.lastFailureTime = Date.now();
      
      if (cb.failureCount >= cb.threshold) {
        cb.isOpen = true;
      }
    }
    
    this.circuitBreakers.set(key, cb);
  }

  private isCircuitBreakerOpen(key: string): boolean {
    const cb = this.getCircuitBreaker(key);
    
    if (!cb.isOpen) return false;
    
    // Vérifier si le timeout est écoulé
    if (Date.now() - cb.lastFailureTime > cb.timeout) {
      cb.isOpen = false;
      cb.failureCount = 0;
      this.circuitBreakers.set(key, cb);
      return false;
    }
    
    return true;
  }

  // Cache Management
  private getCacheKey(operation: string, params: any): string {
    return `${operation}:${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Request Deduplication
  private getRequestKey(operation: string, params: any): string {
    return `${operation}:${JSON.stringify(params)}`;
  }

  private async deduplicateRequest<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key)!;
    }

    const promise = operation();
    this.requestQueue.set(key, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      this.requestQueue.delete(key);
    }
  }

  // Exponential Backoff
  private async delay(attempt: number): Promise<void> {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
      this.retryConfig.maxDelay
    );
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Main Resilient Query Method
  async resilientQuery<T>(
    operation: string,
    queryFn: () => Promise<{ data: T | null; error: any }>,
    options: {
      retryConfig?: Partial<RetryConfig>;
      cache?: boolean;
      cacheTTL?: number;
      circuitBreakerKey?: string;
    } = {}
  ): Promise<{ data: T | null; error: any }> {
    const {
      retryConfig = {},
      cache = false,
      cacheTTL = 300000,
      circuitBreakerKey = operation
    } = options;

    const finalRetryConfig = { ...this.retryConfig, ...retryConfig };
    const cacheKey = this.getCacheKey(operation, {});
    const requestKey = this.getRequestKey(operation, {});

    // Vérifier le cache
    if (cache) {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return { data: cachedData, error: null };
      }
    }

    // Vérifier le circuit breaker
    if (this.isCircuitBreakerOpen(circuitBreakerKey)) {
      return {
        data: null,
        error: new Error(`Circuit breaker is open for ${circuitBreakerKey}`)
      };
    }

    // Déduplication des requêtes
    return this.deduplicateRequest(requestKey, async () => {
      let lastError: any;

      for (let attempt = 0; attempt <= finalRetryConfig.maxRetries; attempt++) {
        try {
          const result = await queryFn();
          
          if (result.error) {
            throw result.error;
          }

          // Succès - mettre à jour le circuit breaker
          this.updateCircuitBreaker(circuitBreakerKey, true);
          
          // Mettre en cache si demandé
          if (cache && result.data) {
            this.setCache(cacheKey, result.data, cacheTTL);
          }
          
          return result;
        } catch (error) {
          lastError = error;
          
          // Mettre à jour le circuit breaker
          this.updateCircuitBreaker(circuitBreakerKey, false);
          
          // Si c'est la dernière tentative, ne pas retry
          if (attempt === finalRetryConfig.maxRetries) {
            break;
          }
          
          // Attendre avant de retry
          await this.delay(attempt);
        }
      }
      
      return { data: null, error: lastError };
    });
  }

  // Méthodes spécialisées pour les opérations courantes
  async getProfiles(filters: any = {}) {
    return this.resilientQuery(
      'getProfiles',
      () => supabase.from('profiles').select('*').match(filters),
      { cache: true, cacheTTL: 60000 }
    );
  }

  async getJourneys(filters: any = {}) {
    return this.resilientQuery(
      'getJourneys',
      () => supabase.from('journeys').select('*').match(filters),
      { cache: true, cacheTTL: 60000 }
    );
  }

  async getPartners(filters: any = {}) {
    return this.resilientQuery(
      'getPartners',
      () => supabase.from('partners').select('*').match(filters),
      { cache: true, cacheTTL: 60000 }
    );
  }

  async getRewards(filters: any = {}) {
    return this.resilientQuery(
      'getRewards',
      () => supabase.from('rewards').select('*').match(filters),
      { cache: true, cacheTTL: 60000 }
    );
  }

  // Méthode pour nettoyer le cache
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Méthode pour réinitialiser les circuit breakers
  resetCircuitBreakers(): void {
    this.circuitBreakers.clear();
  }

  // Méthode pour obtenir les statistiques
  getStats() {
    return {
      cacheSize: this.cache.size,
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([key, cb]) => ({
        key,
        isOpen: cb.isOpen,
        failureCount: cb.failureCount
      })),
      activeRequests: this.requestQueue.size
    };
  }
}

// Instance singleton
export const resilientService = new SupabaseResilientService();

// Hook pour utiliser le service
export const useResilientService = () => {
  return resilientService;
}; 