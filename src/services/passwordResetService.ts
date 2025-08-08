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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl || `${window.location.origin}/reset-password`
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
  static async validateResetLink(accessToken: string, refreshToken: string): Promise<PasswordResetResult> {
    try {
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
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Déconnecter l'utilisateur après la mise à jour
      await supabase.auth.signOut();

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour du mot de passe'
      };
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
    error?: string;
    errorDescription?: string;
  } {
    const urlObj = new URL(url);
    
    // Paramètres de requête
    const accessToken = urlObj.searchParams.get('access_token') || undefined;
    const refreshToken = urlObj.searchParams.get('refresh_token') || undefined;
    const type = urlObj.searchParams.get('type') || undefined;
    
    // Paramètres de hash (fallback)
    const hash = urlObj.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    
    const hashAccessToken = hashParams.get('access_token') || undefined;
    const hashRefreshToken = hashParams.get('refresh_token') || undefined;
    const hashType = hashParams.get('type') || undefined;
    const error = hashParams.get('error') || undefined;
    const errorDescription = hashParams.get('error_description') || undefined;

    return {
      accessToken: accessToken || hashAccessToken,
      refreshToken: refreshToken || hashRefreshToken,
      type: type || hashType,
      error,
      errorDescription
    };
  }

  /**
   * Nettoie l'URL en supprimant les paramètres sensibles
   */
  static cleanUrl(): void {
    window.history.replaceState({}, document.title, '/reset-password');
  }
}
