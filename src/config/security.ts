/**
 * Configuration de sécurité pour l'application CIARA
 * Permet d'activer/désactiver les fonctionnalités de sécurité
 */

export const SECURITY_CONFIG = {
  SANITIZATION_DRY_RUN: import.meta.env.VITE_SECURITY_DRY_RUN === 'true',
  ENABLE_HTML_SANITIZATION: import.meta.env.VITE_ENABLE_HTML_SANITIZATION !== 'false',
  ENABLE_STRICT_VALIDATION: import.meta.env.VITE_ENABLE_STRICT_VALIDATION === 'true',
  ENABLE_SECURE_SESSIONS: import.meta.env.VITE_ENABLE_SECURE_SESSIONS !== 'false',
  ENABLE_CACHE_ENCRYPTION: import.meta.env.VITE_ENABLE_CACHE_ENCRYPTION === 'true',
  ENABLE_RATE_LIMITING: import.meta.env.VITE_ENABLE_RATE_LIMITING !== 'false',
  ENABLE_API_SECURITY: import.meta.env.VITE_ENABLE_API_SECURITY !== 'false',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  RATE_LIMIT_PER_MINUTE: parseInt(import.meta.env.VITE_RATE_LIMIT_PER_MINUTE || '100'),
  MAX_INPUT_LENGTH: parseInt(import.meta.env.VITE_MAX_INPUT_LENGTH || '1000'),
  SESSION_TIMEOUT_MINUTES: parseInt(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES || '30'),
};

/**
 * Messages d'erreur sécurisés pour la production
 */
export const SECURE_ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
    EMAIL_NOT_CONFIRMED: 'Veuillez confirmer votre email avant de vous connecter.',
    TOO_MANY_REQUESTS: 'Trop de tentatives. Veuillez attendre avant de réessayer.',
    ACCOUNT_EXISTS: 'Un compte avec cet email existe déjà.',
    WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 6 caractères.',
    INVALID_EMAIL: 'Adresse email invalide.',
    GENERIC_ERROR: 'Une erreur d\'authentification est survenue.',
  },
  VALIDATION: {
    INVALID_INPUT: 'Données d\'entrée invalides.',
    TOO_LONG: 'Le texte est trop long.',
    INVALID_FORMAT: 'Format invalide.',
    REQUIRED_FIELD: 'Ce champ est requis.',
    INVALID_CHARACTERS: 'Caractères non autorisés détectés.',
  },
  API: {
    RATE_LIMIT_EXCEEDED: 'Trop de requêtes. Veuillez attendre.',
    INVALID_PARAMETERS: 'Paramètres de requête invalides.',
    INTERNAL_ERROR: 'Une erreur interne est survenue.',
    UNAUTHORIZED: 'Accès non autorisé.',
    FORBIDDEN: 'Accès interdit.',
  },
  GENERAL: {
    NETWORK_ERROR: 'Erreur de connexion réseau.',
    TIMEOUT_ERROR: 'Délai d\'attente dépassé.',
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
  }
};

/**
 * Configuration DOMPurify pour la sanitisation HTML
 */
export const SANITIZATION_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote',
    'a', 'img', 'div', 'span',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'pre', 'code', 'hr'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'src', 'alt', 'title',
    'class', 'id', 'style', 'width', 'height',
    'data-*'
  ],
  ALLOW_DATA_ATTR: true,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false
};

export const VALIDATION_SCHEMAS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^[\+]?[0-9\s\-\(\)]{10,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

/**
 * Fonction utilitaire pour obtenir un message d'erreur sécurisé
 */
export const getSecureErrorMessage = (error: unknown, context: keyof typeof SECURE_ERROR_MESSAGES, fallback?: string): string => {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    // Messages d'authentification
    if (context === 'AUTH') {
      if (errorMessage.includes('invalid login credentials')) {
        return SECURE_ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
      }
      if (errorMessage.includes('email not confirmed')) {
        return SECURE_ERROR_MESSAGES.AUTH.EMAIL_NOT_CONFIRMED;
      }
      if (errorMessage.includes('too many requests')) {
        return SECURE_ERROR_MESSAGES.AUTH.TOO_MANY_REQUESTS;
      }
      if (errorMessage.includes('user already registered')) {
        return SECURE_ERROR_MESSAGES.AUTH.ACCOUNT_EXISTS;
      }
      if (errorMessage.includes('password should be at least')) {
        return SECURE_ERROR_MESSAGES.AUTH.WEAK_PASSWORD;
      }
      if (errorMessage.includes('invalid email')) {
        return SECURE_ERROR_MESSAGES.AUTH.INVALID_EMAIL;
      }
    }
    
    // Messages de validation
    if (context === 'VALIDATION') {
      if (errorMessage.includes('too long')) {
        return SECURE_ERROR_MESSAGES.VALIDATION.TOO_LONG;
      }
      if (errorMessage.includes('invalid format')) {
        return SECURE_ERROR_MESSAGES.VALIDATION.INVALID_FORMAT;
      }
      if (errorMessage.includes('required')) {
        return SECURE_ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
      }
      if (errorMessage.includes('invalid characters')) {
        return SECURE_ERROR_MESSAGES.VALIDATION.INVALID_CHARACTERS;
      }
    }
    
    // Messages API
    if (context === 'API') {
      if (errorMessage.includes('rate limit')) {
        return SECURE_ERROR_MESSAGES.API.RATE_LIMIT_EXCEEDED;
      }
      if (errorMessage.includes('invalid parameters')) {
        return SECURE_ERROR_MESSAGES.API.INVALID_PARAMETERS;
      }
      if (errorMessage.includes('unauthorized')) {
        return SECURE_ERROR_MESSAGES.API.UNAUTHORIZED;
      }
      if (errorMessage.includes('forbidden')) {
        return SECURE_ERROR_MESSAGES.API.FORBIDDEN;
      }
    }
  }
  
  // En développement, retourner le message d'erreur original
  if (SECURITY_CONFIG.IS_DEVELOPMENT) {
    return error instanceof Error ? error.message : String(error);
  }
  
  // En production, retourner le message de fallback ou un message générique
  return fallback || SECURE_ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
};

// Configuration des en-têtes de sécurité
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://maps.googleapis.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Configuration des cookies sécurisés
export const SECURE_COOKIE_CONFIG = {
  httpOnly: true,
  secure: SECURITY_CONFIG.IS_PRODUCTION,
  sameSite: 'strict' as const,
  maxAge: SECURITY_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000,
  path: '/',
};
