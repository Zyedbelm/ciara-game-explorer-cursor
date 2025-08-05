// =============================================================================
// EMAIL TEMPLATE CACHE SYSTEM - PHASE 3 IMPLEMENTATION
// =============================================================================
// Intelligent caching system for email templates with performance optimization

import { logger } from '@/services/loggingService';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  compressed?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  memoryUsage: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enableCompression: boolean;
  enableMetrics: boolean;
  persistToDisk: boolean;
  compressionThreshold: number;
}

class EmailTemplateCache {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0, hitRate: 0, memoryUsage: 0 };
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 3600000, // 1 hour
      enableCompression: true,
      enableMetrics: true,
      persistToDisk: false,
      compressionThreshold: 1024, // 1KB
      ...config
    };

    this.startCleanupTimer();
    this.loadFromDisk();
  }

  // Generate cache key with context
  private generateKey(
    templateType: string,
    lang: string,
    data: Record<string, any>,
    variant?: string
  ): string {
    const dataHash = this.hashObject(data);
    const baseKey = `${templateType}:${lang}:${dataHash}`;
    return variant ? `${baseKey}:${variant}` : baseKey;
  }

  // Simple hash function for objects
  private hashObject(obj: Record<string, any>): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Compress data if needed
  private async compressData(data: any): Promise<{ data: any; compressed: boolean }> {
    if (!this.config.enableCompression) {
      return { data, compressed: false };
    }

    const serialized = JSON.stringify(data);
    if (serialized.length < this.config.compressionThreshold) {
      return { data, compressed: false };
    }

    try {
      // Simple compression simulation (in real app, use gzip or similar)
      const compressed = btoa(serialized);
      return { 
        data: compressed, 
        compressed: compressed.length < serialized.length 
      };
    } catch (error) {
      logger.warn('performance', 'Compression failed, storing uncompressed', { error });
      return { data, compressed: false };
    }
  }

  // Decompress data if needed
  private async decompressData(entry: CacheEntry): Promise<any> {
    if (!entry.compressed) {
      return entry.data;
    }

    try {
      const decompressed = atob(entry.data);
      return JSON.parse(decompressed);
    } catch (error) {
      logger.error('performance', 'Decompression failed', { error });
      return entry.data;
    }
  }

  // Get from cache
  async get<T>(
    templateType: string,
    lang: string,
    data: Record<string, any>,
    variant?: string
  ): Promise<T | null> {
    const key = this.generateKey(templateType, lang, data, variant);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateMetrics();
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateMetrics();
      return null;
    }

    this.stats.hits++;
    this.updateMetrics();

    logger.debug('performance', 'Cache hit', { 
      key, 
      templateType, 
      hitRate: this.stats.hitRate 
    });

    return this.decompressData(entry);
  }

  // Set in cache
  async set<T>(
    templateType: string,
    lang: string,
    data: Record<string, any>,
    value: T,
    ttl?: number,
    variant?: string
  ): Promise<void> {
    const key = this.generateKey(templateType, lang, data, variant);
    
    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const { data: compressedData, compressed } = await this.compressData(value);

    const entry: CacheEntry<T> = {
      data: compressedData,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      version: '1.0',
      compressed
    };

    this.cache.set(key, entry);
    this.updateMetrics();

    logger.debug('performance', 'Cache set', { 
      key, 
      templateType, 
      compressed,
      size: this.cache.size 
    });

    if (this.config.persistToDisk) {
      this.saveToDisk();
    }
  }

  // Evict oldest entries
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('performance', 'Cache eviction', { evictedKey: oldestKey });
    }
  }

  // Update metrics
  private updateMetrics(): void {
    if (!this.config.enableMetrics) return;

    this.stats.size = this.cache.size;
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    // Estimate memory usage
    this.stats.memoryUsage = this.estimateMemoryUsage();
  }

  // Estimate memory usage
  private estimateMemoryUsage(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += JSON.stringify(entry).length * 2; // Rough estimate
    }
    return total;
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, size: 0, hitRate: 0, memoryUsage: 0 };
    logger.info('performance', 'Cache cleared');
  }

  // Get cache statistics
  getStats(): CacheStats {
    this.updateMetrics();
    return { ...this.stats };
  }

  // Invalidate by pattern
  invalidatePattern(pattern: RegExp): number {
    let invalidated = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    this.updateMetrics();
    logger.info('performance', 'Cache pattern invalidation', { 
      pattern: pattern.toString(), 
      invalidated 
    });
    
    return invalidated;
  }

  // Preload common templates
  async preloadTemplates(templates: Array<{
    type: string;
    lang: string;
    data: Record<string, any>;
    generator: () => Promise<any>;
  }>): Promise<void> {
    logger.info('performance', 'Starting template preload', { count: templates.length });

    const preloadPromises = templates.map(async (template) => {
      try {
        const cached = await this.get(template.type, template.lang, template.data);
        if (!cached) {
          const generated = await template.generator();
          await this.set(template.type, template.lang, template.data, generated);
        }
      } catch (error) {
        logger.warn('performance', 'Template preload failed', { 
          template: template.type, 
          error 
        });
      }
    });

    await Promise.allSettled(preloadPromises);
    logger.info('performance', 'Template preload completed');
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    this.updateMetrics();
    
    if (cleaned > 0) {
      logger.debug('performance', 'Cache cleanup', { cleaned, remaining: this.cache.size });
    }
  }

  // Start cleanup timer
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 300000); // Every 5 minutes
  }

  // Load from disk (placeholder for persistence)
  private loadFromDisk(): void {
    if (!this.config.persistToDisk) return;
    
    try {
      const stored = localStorage.getItem('ciara-email-cache');
      if (stored) {
        const data = JSON.parse(stored);
        // Reconstruct cache with validation
        for (const [key, entry] of Object.entries(data)) {
          if (this.isValidEntry(entry)) {
            this.cache.set(key, entry as CacheEntry);
          }
        }
        logger.info('performance', 'Cache loaded from disk', { size: this.cache.size });
      }
    } catch (error) {
      logger.warn('performance', 'Failed to load cache from disk', { error });
    }
  }

  // Save to disk (placeholder for persistence)
  private saveToDisk(): void {
    if (!this.config.persistToDisk) return;
    
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem('ciara-email-cache', JSON.stringify(data));
    } catch (error) {
      logger.warn('performance', 'Failed to save cache to disk', { error });
    }
  }

  // Validate cache entry
  private isValidEntry(entry: any): boolean {
    return entry && 
           typeof entry.timestamp === 'number' &&
           typeof entry.ttl === 'number' &&
           entry.data !== undefined;
  }

  // Destroy cache
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Singleton cache instance
export const emailTemplateCache = new EmailTemplateCache({
  maxSize: 500,
  defaultTTL: 1800000, // 30 minutes
  enableCompression: true,
  enableMetrics: true,
  persistToDisk: typeof window !== 'undefined', // Only in browser
  compressionThreshold: 2048
});

// Cache-aware template renderer
export class OptimizedTemplateRenderer {
  private cache: EmailTemplateCache;

  constructor(cache: EmailTemplateCache = emailTemplateCache) {
    this.cache = cache;
  }

  async renderTemplate<T>(
    templateType: string,
    lang: string,
    data: Record<string, any>,
    renderer: () => Promise<T>,
    options: {
      ttl?: number;
      variant?: string;
      bypassCache?: boolean;
    } = {}
  ): Promise<T> {
    const startTime = performance.now();

    // Check cache first (unless bypassed)
    if (!options.bypassCache) {
      const cached = await this.cache.get<T>(templateType, lang, data, options.variant);
      if (cached) {
        const duration = performance.now() - startTime;
        logger.logPerformance(`renderTemplate:${templateType}:cached`, duration, true, {
          cacheHit: true,
          lang,
          variant: options.variant
        });
        return cached;
      }
    }

    try {
      // Render template
      const rendered = await renderer();
      
      // Cache the result
      await this.cache.set(templateType, lang, data, rendered, options.ttl, options.variant);
      
      const duration = performance.now() - startTime;
      logger.logPerformance(`renderTemplate:${templateType}:rendered`, duration, true, {
        cacheHit: false,
        lang,
        variant: options.variant
      });

      return rendered;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.logPerformance(`renderTemplate:${templateType}:error`, duration, false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Invalidate templates by type
  invalidateTemplateType(templateType: string): number {
    return this.cache.invalidatePattern(new RegExp(`^${templateType}:`));
  }

  // Get cache statistics
  getCacheStats(): CacheStats {
    return this.cache.getStats();
  }
}

// Export optimized renderer instance
export const optimizedRenderer = new OptimizedTemplateRenderer();

// React hook for template rendering
export const useOptimizedTemplateRenderer = () => {
  return optimizedRenderer;
};