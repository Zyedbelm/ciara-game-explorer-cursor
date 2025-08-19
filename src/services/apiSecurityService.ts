import { supabase } from '@/integrations/supabase/client';
import { validateUrlParams, escapeHtml } from '@/utils/securityUtils';

/**
 * Service de sécurité pour les appels API
 * Protège contre les attaques par injection et valide les paramètres
 */
export class ApiSecurityService {
  private static instance: ApiSecurityService;
  private requestCount: Map<string, number> = new Map();
  private lastRequestTime: Map<string, number> = new Map();
  private readonly RATE_LIMIT = 100; // Requêtes par minute
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute

  static getInstance(): ApiSecurityService {
    if (!ApiSecurityService.instance) {
      ApiSecurityService.instance = new ApiSecurityService();
    }
    return ApiSecurityService.instance;
  }

  /**
   * Valide et nettoie les paramètres d'URL
   */
  validateQueryParams(params: Record<string, string>): { isValid: boolean; errors: string[]; sanitized: Record<string, string> } {
    return validateUrlParams(params);
  }

  /**
   * Valide et nettoie les données de requête
   */
  validateRequestData<T extends Record<string, any>>(data: T, schema: Record<string, 'email' | 'name' | 'text' | 'url'>): { isValid: boolean; errors: Record<string, string>; sanitized: T } {
    const errors: Record<string, string> = {};
    const sanitized: any = {};

    for (const [field, type] of Object.entries(schema)) {
      const value = data[field];
      if (value === undefined || value === null) {
        continue; // Champs optionnels
      }

      if (typeof value !== 'string') {
        errors[field] = `Le champ ${field} doit être une chaîne de caractères`;
        continue;
      }

      // Validation basique selon le type
      switch (type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors[field] = 'Format d\'email invalide';
          } else {
            sanitized[field] = value.toLowerCase().trim();
          }
          break;

        case 'name':
          const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
          if (!nameRegex.test(value)) {
            errors[field] = 'Nom invalide (2-50 caractères, lettres uniquement)';
          } else {
            sanitized[field] = value.trim();
          }
          break;

        case 'url':
          try {
            const url = new URL(value);
            if (!['http:', 'https:'].includes(url.protocol)) {
              errors[field] = 'URL doit utiliser HTTP ou HTTPS';
            } else {
              sanitized[field] = url.toString();
            }
          } catch {
            errors[field] = 'URL invalide';
          }
          break;

        case 'text':
        default:
          // Nettoyer le texte des caractères dangereux
          sanitized[field] = escapeHtml(value.trim()).substring(0, 1000);
          break;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Vérifie le rate limiting pour un utilisateur
   */
  checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = `user_${userId}`;
    
    // Nettoyer les anciennes entrées
    if (this.lastRequestTime.has(key)) {
      const lastTime = this.lastRequestTime.get(key)!;
      if (now - lastTime > this.RATE_LIMIT_WINDOW) {
        this.requestCount.delete(key);
        this.lastRequestTime.delete(key);
      }
    }

    const currentCount = this.requestCount.get(key) || 0;
    const remaining = Math.max(0, this.RATE_LIMIT - currentCount);
    const allowed = currentCount < this.RATE_LIMIT;

    if (allowed) {
      this.requestCount.set(key, currentCount + 1);
      this.lastRequestTime.set(key, now);
    }

    return {
      allowed,
      remaining,
      resetTime: now + this.RATE_LIMIT_WINDOW
    };
  }

  /**
   * Wrapper sécurisé pour les appels Supabase
   */
  async secureSupabaseCall<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    options: {
      userId?: string;
      operation: string;
      validateParams?: boolean;
      params?: Record<string, any>;
    }
  ): Promise<{ data: T | null; error: any; securityInfo?: any }> {
    const { userId, operation: opName, validateParams = false, params } = options;

    // Rate limiting
    if (userId) {
      const rateLimit = this.checkRateLimit(userId);
      if (!rateLimit.allowed) {
        return {
          data: null,
          error: { message: 'Rate limit exceeded', code: 'RATE_LIMIT' },
          securityInfo: { rateLimit }
        };
      }
    }

    // Validation des paramètres
    if (validateParams && params) {
      const validation = this.validateRequestData(params, {
        // Ajouter les champs selon le type d'opération
        ...(opName.includes('email') && { email: 'email' }),
        ...(opName.includes('name') && { name: 'name' }),
        ...(opName.includes('url') && { url: 'url' }),
        ...(opName.includes('text') && { text: 'text' })
      });

      if (!validation.isValid) {
        return {
          data: null,
          error: { message: 'Invalid parameters', details: validation.errors, code: 'VALIDATION_ERROR' },
          securityInfo: { validation }
        };
      }
    }

    try {
      const result = await operation();
      
      // Log de sécurité en développement
      if (import.meta.env.DEV) {
        console.log(`🔒 API Security: ${opName}`, {
          userId,
          timestamp: new Date().toISOString(),
          success: !result.error
        });
      }

      return result;
    } catch (error) {
      // Log d'erreur de sécurité
      if (import.meta.env.DEV) {
        console.error(`❌ API Security Error: ${opName}`, {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }

      return {
        data: null,
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
      };
    }
  }

  /**
   * Valide les paramètres de recherche
   */
  validateSearchParams(searchTerm: string, filters: Record<string, any>): { isValid: boolean; sanitized: { searchTerm: string; filters: Record<string, any> } } {
    // Valider le terme de recherche
    const sanitizedSearchTerm = escapeHtml(searchTerm.trim()).substring(0, 100);
    
    // Valider les filtres
    const sanitizedFilters: Record<string, any> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (typeof value === 'string') {
        sanitizedFilters[key] = escapeHtml(value.trim()).substring(0, 50);
      } else if (typeof value === 'number') {
        sanitizedFilters[key] = value;
      } else if (Array.isArray(value)) {
        sanitizedFilters[key] = value.map(v => 
          typeof v === 'string' ? escapeHtml(v.trim()).substring(0, 50) : v
        );
      }
    }

    return {
      isValid: true,
      sanitized: { searchTerm: sanitizedSearchTerm, filters: sanitizedFilters }
    };
  }

  /**
   * Nettoie les données de réponse sensibles
   */
  sanitizeResponseData<T>(data: T, sensitiveFields: string[] = []): T {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data } as any;
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        if (typeof sanitized[field] === 'string') {
          sanitized[field] = sanitized[field].substring(0, 3) + '***';
        } else if (typeof sanitized[field] === 'object') {
          sanitized[field] = '[REDACTED]';
        }
      }
    }

    return sanitized;
  }
}

// Instance singleton
export const apiSecurity = ApiSecurityService.getInstance();
