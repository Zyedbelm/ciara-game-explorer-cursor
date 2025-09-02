import { supabase } from '@/integrations/supabase/client';

export interface PasswordResetResult {
  success: boolean;
  error?: string;
}

export class PasswordResetService {
  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  static async sendResetEmail(email: string, redirectUrl?: string): Promise<PasswordResetResult> {
    try {
      // Utiliser une URL absolue pour la réinitialisation
      const resetUrl = redirectUrl || (window.location.hostname === 'localhost' 
        ? 'http://localhost:8080/reset-password'
        : 'https://ciara.city/reset-password');
        
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi de l\'email'
      };
    }
  }

  /**
   * Valide un lien de réinitialisation et établit une session
   */
  static async validateResetLink(accessToken?: string, refreshToken?: string, code?: string): Promise<PasswordResetResult> {
    try {
      // Si nous avons un code, l'utiliser pour échanger contre une session
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          return {
            success: false,
            error: 'Code de récupération invalide ou expiré'
          };
        }
        
        return { success: true };
      }
      
      // Si nous avons des tokens, les utiliser directement
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          return {
            success: false,
            error: 'Session invalide'
          };
        }

        return { success: true };
      }
      
      return {
        success: false,
        error: 'Aucun paramètre de récupération valide'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la validation du lien'
      };
    }
  }

  /**
   * Met à jour le mot de passe de l'utilisateur
   */
  static async updatePassword(password: string): Promise<PasswordResetResult> {
    try {
      // 1. Vérifier que l'utilisateur est connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: 'Session utilisateur invalide. Veuillez utiliser le lien de réinitialisation.'
        };
      }

      // 2. Vérifier que la session est valide
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return {
          success: false,
          error: 'Session expirée. Veuillez utiliser le lien de réinitialisation.'
        };
      }

      // 3. Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Erreur de mise à jour du mot de passe:', updateError);
        
        // Analyser le type d'erreur
        if (updateError.message.includes('422')) {
          return {
            success: false,
            error: 'Données de mot de passe invalides. Vérifiez les critères de sécurité.'
          };
        }
        
        if (updateError.message.includes('401') || updateError.message.includes('403')) {
          return {
            success: false,
            error: 'Session expirée. Veuillez utiliser le lien de réinitialisation.'
          };
        }
        
        return {
          success: false,
          error: `Erreur lors de la mise à jour: ${updateError.message}`
        };
      }

      // 4. Succès - NE PAS déconnecter immédiatement
      // L'utilisateur doit pouvoir confirmer la mise à jour
      return { success: true };
      
    } catch (error: any) {
      console.error('Erreur inattendue lors de la mise à jour du mot de passe:', error);
      
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour du mot de passe'
      };
    }
  }

  /**
   * Déconnecte l'utilisateur après confirmation de la mise à jour
   * À appeler explicitement après confirmation
   */
  static async signOutAfterConfirmation(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  /**
   * Vérifie si l'utilisateur a une session valide
   */
  static async hasValidSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch {
      return false;
    }
  }

  /**
   * Extrait les paramètres de réinitialisation de l'URL
   */
  static extractResetParams(url: string): {
    accessToken?: string;
    refreshToken?: string;
    type?: string;
    code?: string;
    error?: string;
    errorDescription?: string;
  } {
    console.log('🔍 PasswordResetService.extractResetParams - URL:', url);
    
    const urlObj = new URL(url);
    
    // Paramètres de requête
    const accessToken = urlObj.searchParams.get('access_token') || undefined;
    const refreshToken = urlObj.searchParams.get('refresh_token') || undefined;
    const type = urlObj.searchParams.get('type') || undefined;
    const code = urlObj.searchParams.get('code') || undefined;
    
    console.log('🔍 Paramètres de requête:');
    console.log('- access_token:', accessToken);
    console.log('- refresh_token:', refreshToken);
    console.log('- type:', type);
    console.log('- code:', code);
    
    // Paramètres de hash (fallback)
    const hash = urlObj.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    
    const hashAccessToken = hashParams.get('access_token') || undefined;
    const hashRefreshToken = hashParams.get('refresh_token') || undefined;
    const hashType = hashParams.get('type') || undefined;
    const hashCode = hashParams.get('code') || undefined;
    const error = hashParams.get('error') || undefined;
    const errorDescription = hashParams.get('error_description') || undefined;

    console.log('🔍 Paramètres de hash:');
    console.log('- hash access_token:', hashAccessToken);
    console.log('- hash refresh_token:', hashRefreshToken);
    console.log('- hash type:', hashType);
    console.log('- hash code:', hashCode);
    console.log('- hash error:', error);
    console.log('- hash error_description:', errorDescription);

    const result = {
      accessToken: accessToken || hashAccessToken,
      refreshToken: refreshToken || hashRefreshToken,
      type: type || hashType,
      code: code || hashCode,
      error,
      errorDescription
    };
    
    console.log('🔍 Résultat final:', result);
    return result;
  }

  /**
   * Nettoie l'URL en supprimant les paramètres sensibles
   */
  static cleanUrl(): void {
    window.history.replaceState({}, document.title, '/reset-password');
  }
}
