import DOMPurify from 'dompurify';

// Configuration DOMPurify permissive mais sécurisée
const SANITIZATION_CONFIG = {
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
    'dir', 'lang', 'xml:lang',
    'data-*' // Permettre les attributs data-* pour compatibilité
  ],
  ALLOW_DATA_ATTR: true,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false
};

/**
 * Sanitise le HTML de manière sécurisée tout en préservant le contenu valide
 * @param html - Le HTML à sanitiser
 * @param dryRun - Mode test sans modification
 * @returns HTML sanitizé
 */
export const sanitizeHTML = (html: string, dryRun = false): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Mode test - log sans modification
  if (dryRun) {
    console.log('🔍 SANITISATION DRY-RUN:', {
      originalLength: html.length,
      content: html.substring(0, 200) + (html.length > 200 ? '...' : '')
    });
    return html;
  }

  try {
    const originalLength = html.length;
    const sanitized = DOMPurify.sanitize(html, SANITIZATION_CONFIG);
    const sanitizedLength = sanitized.length;

    // Log si du contenu a été supprimé
    if (originalLength !== sanitizedLength) {
      console.warn('⚠️ CONTENU SANITISÉ:', {
        originalLength,
        sanitizedLength,
        removed: originalLength - sanitizedLength,
        removedPercentage: ((originalLength - sanitizedLength) / originalLength * 100).toFixed(2) + '%'
      });
    }

    return sanitized;
  } catch (error) {
    console.error('❌ ERREUR SANITISATION:', error);
    // En cas d'erreur, retourner le HTML original mais log l'erreur
    return html;
  }
};

/**
 * Sanitise le HTML pour l'éditeur en préservant la direction du texte
 * @param html - Le HTML à sanitiser
 * @param dryRun - Mode test sans modification
 * @returns HTML sanitizé avec direction préservée
 */
export const sanitizeHTMLForEditor = (html: string, dryRun = false): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Mode test - log sans modification
  if (dryRun) {
    console.log('🔍 SANITISATION ÉDITEUR DRY-RUN:', {
      originalLength: html.length,
      content: html.substring(0, 200) + (html.length > 200 ? '...' : '')
    });
    return html;
  }

  try {
    const originalLength = html.length;
    let sanitized = DOMPurify.sanitize(html, SANITIZATION_CONFIG);
    const sanitizedLength = sanitized.length;

    // S'assurer que la direction est préservée
    if (sanitized && !sanitized.includes('dir=')) {
      // Ajouter dir="ltr" aux éléments de base si pas présent
      sanitized = sanitized.replace(/<p>/g, '<p dir="ltr">');
      sanitized = sanitized.replace(/<div>/g, '<div dir="ltr">');
      sanitized = sanitized.replace(/<h1>/g, '<h1 dir="ltr">');
      sanitized = sanitized.replace(/<h2>/g, '<h2 dir="ltr">');
      sanitized = sanitized.replace(/<h3>/g, '<h3 dir="ltr">');
    }

    // Log si du contenu a été supprimé
    if (originalLength !== sanitizedLength) {
      console.warn('⚠️ CONTENU ÉDITEUR SANITISÉ:', {
        originalLength,
        sanitizedLength,
        removed: originalLength - sanitizedLength,
        removedPercentage: ((originalLength - sanitizedLength) / originalLength * 100).toFixed(2) + '%'
      });
    }

    return sanitized;
  } catch (error) {
    console.error('❌ ERREUR SANITISATION ÉDITEUR:', error);
    // En cas d'erreur, retourner le HTML original mais log l'erreur
    return html;
  }
};

/**
 * Vérifie si le HTML contient du contenu potentiellement dangereux
 * @param html - Le HTML à vérifier
 * @returns true si du contenu dangereux est détecté
 */
export const hasDangerousContent = (html: string): boolean => {
  if (!html || typeof html !== 'string') {
    return false;
  }

  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi
  ];

  return dangerousPatterns.some(pattern => pattern.test(html));
};

/**
 * Valide et nettoie les données d'entrée utilisateur
 * @param data - Les données à valider
 * @returns Données nettoyées
 */
export const sanitizeUserInput = (data: any): any => {
  if (typeof data === 'string') {
    return data.trim().replace(/[<>]/g, '');
  }
  if (typeof data === 'object' && data !== null) {
    const cleaned: any = Array.isArray(data) ? [] : {};
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = sanitizeUserInput(value);
    }
    return cleaned;
  }
  return data;
};

// Validation et nettoyage des entrées utilisateur
export const validateAndSanitizeInput = (input: string, type: 'email' | 'name' | 'text' | 'url'): { isValid: boolean; sanitized: string; error?: string } => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '', error: 'Entrée invalide' };
  }

  const trimmed = input.trim();
  
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return { isValid: false, sanitized: '', error: 'Format d\'email invalide' };
      }
      return { isValid: true, sanitized: trimmed.toLowerCase() };
      
    case 'name':
      const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
      if (!nameRegex.test(trimmed)) {
        return { isValid: false, sanitized: '', error: 'Nom invalide (2-50 caractères, lettres uniquement)' };
      }
      return { isValid: true, sanitized: trimmed };
      
    case 'url':
      try {
        const url = new URL(trimmed);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return { isValid: false, sanitized: '', error: 'URL doit utiliser HTTP ou HTTPS' };
        }
        return { isValid: true, sanitized: url.toString() };
      } catch {
        return { isValid: false, sanitized: '', error: 'URL invalide' };
      }
      
    case 'text':
    default:
      // Nettoyer le texte des caractères dangereux
      const sanitized = trimmed
        .replace(/[<>]/g, '') // Supprimer < et >
        .replace(/javascript:/gi, '') // Supprimer javascript:
        .replace(/on\w+\s*=/gi, '') // Supprimer les gestionnaires d'événements
        .substring(0, 1000); // Limiter la longueur
      
      return { isValid: true, sanitized };
  }
};

// Validation des données de formulaire
export const validateFormData = (data: Record<string, any>, schema: Record<string, 'email' | 'name' | 'text' | 'url'>): { isValid: boolean; errors: Record<string, string>; sanitized: Record<string, any> } => {
  const errors: Record<string, string> = {};
  const sanitized: Record<string, any> = {};

  for (const [field, type] of Object.entries(schema)) {
    const value = data[field];
    const validation = validateAndSanitizeInput(value, type);
    
    if (!validation.isValid) {
      errors[field] = validation.error || 'Champ invalide';
    } else {
      sanitized[field] = validation.sanitized;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};

// Protection contre les attaques par injection
export const escapeHtml = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validation des paramètres d'URL
export const validateUrlParams = (params: Record<string, string>): { isValid: boolean; errors: string[]; sanitized: Record<string, string> } => {
  const errors: string[] = [];
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (!value || typeof value !== 'string') {
      errors.push(`Paramètre ${key} invalide`);
      continue;
    }

    // Vérifier la longueur
    if (value.length > 100) {
      errors.push(`Paramètre ${key} trop long`);
      continue;
    }

    // Vérifier les caractères dangereux
    if (/[<>'"]/.test(value)) {
      errors.push(`Paramètre ${key} contient des caractères dangereux`);
      continue;
    }

    sanitized[key] = value.trim();
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};
