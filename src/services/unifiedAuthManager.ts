/**
 * 🚀 GESTIONNAIRE D'AUTHENTIFICATION UNIFIÉ
 * 
 * Approche innovante qui unifie TOUS les flux d'authentification :
 * - Magic Link
 * - Reset Password  
 * - OAuth (Google)
 * - Sign In/Sign Up classique
 * 
 * PRINCIPE : Un seul point d'entrée, une seule logique, zéro complexité
 */

import { supabase } from '@/integrations/supabase/client';

export interface AuthResult {
  success: boolean;
  error?: string;
  requiresRedirect?: boolean;
  redirectUrl?: string;
  action?: 'signin' | 'signup' | 'reset' | 'magic' | 'oauth';
}

export interface AuthParams {
  // Paramètres d'URL
  access_token?: string;
  refresh_token?: string;
  code?: string;
  type?: string;
  error?: string;
  error_description?: string;
  
  // Paramètres de hash (fallback)
  hashParams?: Record<string, string>;
}

export class UnifiedAuthManager {
  
  /**
   * 🎯 POINT D'ENTRÉE UNIQUE
   * Analyse l'URL et détermine automatiquement l'action à effectuer
   */
  static async handleAuthentication(url?: string): Promise<AuthResult> {
    try {
      const currentUrl = url || window.location.href;
      console.log('🚀 UnifiedAuthManager - URL à traiter:', currentUrl);
      
      // 1. Extraire TOUS les paramètres possibles
      const params = this.extractAllParams(currentUrl);
      console.log('🚀 Paramètres extraits:', params);
      
      // 2. Gérer les erreurs en premier
      if (params.error) {
        return this.handleAuthError(params);
      }
      
      // 3. Déterminer automatiquement le type d'authentification
      const authType = this.detectAuthType(params);
      console.log('🚀 Type d\'auth détecté:', authType);
      
      // 4. Traiter selon le type
      switch (authType) {
        case 'magic_link':
          return await this.handleMagicLink(params);
          
        case 'password_reset':
          return await this.handlePasswordReset(params);
          
        case 'oauth':
          return await this.handleOAuth(params);
          
        case 'pkce_flow':
          return await this.handlePKCEFlow(params);
          
        default:
          return {
            success: false,
            error: 'Type d\'authentification non reconnu'
          };
      }
      
    } catch (error: any) {
      console.error('🚀 Erreur dans UnifiedAuthManager:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'authentification'
      };
    }
  }
  
  /**
   * 🔍 EXTRACTION UNIVERSELLE DES PARAMÈTRES
   * Récupère TOUS les paramètres possibles de l'URL (query + hash)
   */
  private static extractAllParams(url: string): AuthParams {
    const urlObj = new URL(url);
    
    // Paramètres de query
    const queryParams: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    // Paramètres de hash
    const hashParams: Record<string, string> = {};
    if (urlObj.hash) {
      const hashSearch = new URLSearchParams(urlObj.hash.substring(1));
      hashSearch.forEach((value, key) => {
        hashParams[key] = value;
      });
    }
    
    return {
      // Priorité aux paramètres de query, fallback sur hash
      access_token: queryParams.access_token || hashParams.access_token,
      refresh_token: queryParams.refresh_token || hashParams.refresh_token,
      code: queryParams.code || hashParams.code,
      type: queryParams.type || hashParams.type,
      error: queryParams.error || hashParams.error,
      error_description: queryParams.error_description || hashParams.error_description,
      hashParams
    };
  }
  
  /**
   * 🎯 DÉTECTION AUTOMATIQUE DU TYPE D'AUTHENTIFICATION
   */
  private static detectAuthType(params: AuthParams): string {
    // Magic Link : code + aucun token
    if (params.code && !params.access_token && !params.refresh_token) {
      return 'magic_link';
    }
    
    // Password Reset : type=recovery OU présence dans URL reset-password
    if (params.type === 'recovery' || window.location.pathname.includes('reset-password')) {
      return 'password_reset';
    }
    
    // OAuth : access_token + refresh_token + pas de type spécifique
    if (params.access_token && params.refresh_token && params.type !== 'recovery') {
      return 'oauth';
    }
    
    // PKCE Flow : code + access_token/refresh_token
    if (params.code && (params.access_token || params.refresh_token)) {
      return 'pkce_flow';
    }
    
    return 'unknown';
  }
  
  /**
   * 🔗 GESTIONNAIRE MAGIC LINK
   */
  private static async handleMagicLink(params: AuthParams): Promise<AuthResult> {
    console.log('🔗 Traitement Magic Link avec code:', params.code);
    
    if (!params.code) {
      return {
        success: false,
        error: 'Code Magic Link manquant'
      };
    }
    
    try {
      // Échanger le code contre une session
      const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
      
      if (error) {
        console.log('🔗 Erreur échange code Magic Link:', error);
        return {
          success: false,
          error: 'Code Magic Link invalide ou expiré'
        };
      }
      
      if (data.session) {
        console.log('🔗 Magic Link réussi, session établie');
        return {
          success: true,
          action: 'magic',
          requiresRedirect: true,
          redirectUrl: '/profile'
        };
      }
      
      return {
        success: false,
        error: 'Session Magic Link non établie'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur Magic Link'
      };
    }
  }
  
  /**
   * 🔐 GESTIONNAIRE RESET PASSWORD
   */
  private static async handlePasswordReset(params: AuthParams): Promise<AuthResult> {
    console.log('🔐 Traitement Reset Password');
    
    // Si nous avons des tokens complets, établir la session
    if (params.access_token && params.refresh_token) {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token
        });
        
        if (error) {
          return {
            success: false,
            error: 'Tokens de réinitialisation invalides'
          };
        }
        
        if (data.session) {
          return {
            success: true,
            action: 'reset'
          };
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Erreur lors de l\'établissement de la session'
        };
      }
    }
    
    // Si nous avons un code, vérifier la session existante
    if (params.code) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          return {
            success: true,
            action: 'reset'
          };
        }
        
        return {
          success: false,
          error: 'Lien de réinitialisation invalide ou expiré'
        };
      } catch (error: any) {
        return {
          success: false,
          error: 'Erreur lors de la vérification de session'
        };
      }
    }
    
    // Vérifier si l'utilisateur a déjà une session valide
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        return {
          success: true,
          action: 'reset'
        };
      }
      
      return {
        success: false,
        error: 'Aucune session de réinitialisation valide'
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Erreur lors de la vérification de session'
      };
    }
  }
  
  /**
   * 🌐 GESTIONNAIRE OAUTH
   */
  private static async handleOAuth(params: AuthParams): Promise<AuthResult> {
    console.log('🌐 Traitement OAuth');
    
    if (!params.access_token || !params.refresh_token) {
      return {
        success: false,
        error: 'Tokens OAuth manquants'
      };
    }
    
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token
      });
      
      if (error) {
        return {
          success: false,
          error: 'Tokens OAuth invalides'
        };
      }
      
      if (data.session) {
        return {
          success: true,
          action: 'oauth',
          requiresRedirect: true,
          redirectUrl: '/profile'
        };
      }
      
      return {
        success: false,
        error: 'Session OAuth non établie'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur OAuth'
      };
    }
  }
  
  /**
   * 🔄 GESTIONNAIRE PKCE FLOW
   */
  private static async handlePKCEFlow(params: AuthParams): Promise<AuthResult> {
    console.log('🔄 Traitement PKCE Flow');
    
    if (!params.code) {
      return {
        success: false,
        error: 'Code PKCE manquant'
      };
    }
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
      
      if (error) {
        return {
          success: false,
          error: 'Code PKCE invalide ou expiré'
        };
      }
      
      if (data.session) {
        return {
          success: true,
          action: 'signin',
          requiresRedirect: true,
          redirectUrl: '/profile'
        };
      }
      
      return {
        success: false,
        error: 'Session PKCE non établie'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur PKCE'
      };
    }
  }
  
  /**
   * ❌ GESTIONNAIRE D'ERREURS
   */
  private static handleAuthError(params: AuthParams): AuthResult {
    let errorMessage = "Erreur d'authentification";
    
    if (params.error === 'access_denied') {
      if (params.error_description?.includes('expired')) {
        errorMessage = "Le lien a expiré. Veuillez demander un nouveau lien.";
      } else {
        errorMessage = "Accès refusé. Veuillez réessayer.";
      }
    } else if (params.error_description) {
      errorMessage = decodeURIComponent(params.error_description);
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
  
  /**
   * 📧 ENVOI D'EMAIL UNIFIÉ
   */
  static async sendAuthEmail(email: string, type: 'magic' | 'reset'): Promise<AuthResult> {
    try {
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080'
        : 'https://ciara.city';
      
      if (type === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${baseUrl}/auth/unified-callback`
          }
        });
        
        if (error) {
          return {
            success: false,
            error: error.message
          };
        }
        
        return {
          success: true,
          action: 'magic'
        };
      }
      
      if (type === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${baseUrl}/auth/unified-callback`
        });
        
        if (error) {
          return {
            success: false,
            error: error.message
          };
        }
        
        return {
          success: true,
          action: 'reset'
        };
      }
      
      return {
        success: false,
        error: 'Type d\'email non supporté'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi de l\'email'
      };
    }
  }
  
  /**
   * 🔄 NETTOYAGE D'URL
   */
  static cleanUrl(targetPath: string = '/'): void {
    window.history.replaceState({}, document.title, targetPath);
  }
  
  /**
   * ✅ VÉRIFICATION DE SESSION
   */
  static async hasValidSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch {
      return false;
    }
  }
}
