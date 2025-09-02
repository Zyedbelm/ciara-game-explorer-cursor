import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PasswordUpdateResult {
  success: boolean;
  error?: string;
  requiresReauth?: boolean;
}

export function usePasswordManagement() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Met à jour le mot de passe de l'utilisateur connecté
   * Gère les erreurs de session et les tokens expirés
   */
  const updatePassword = useCallback(async (newPassword: string): Promise<PasswordUpdateResult> => {
    setLoading(true);
    
    try {
      // 1. Vérifier que l'utilisateur est connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Erreur de session:', userError);
        return {
          success: false,
          error: 'Session utilisateur invalide. Veuillez vous reconnecter.',
          requiresReauth: true
        };
      }

      // 2. Vérifier que la session est valide
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Erreur de session:', sessionError);
        return {
          success: false,
          error: 'Session expirée. Veuillez vous reconnecter.',
          requiresReauth: true
        };
      }

      // 3. Tenter de mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Erreur de mise à jour du mot de passe:', updateError);
        
        // Analyser le type d'erreur
        if (updateError.message.includes('422')) {
          return {
            success: false,
            error: 'Données de mot de passe invalides. Vérifiez les critères de sécurité.',
            requiresReauth: false
          };
        }
        
        if (updateError.message.includes('401') || updateError.message.includes('403')) {
          return {
            success: false,
            error: 'Session expirée. Veuillez vous reconnecter.',
            requiresReauth: true
          };
        }
        
        if (updateError.message.includes('rate_limit')) {
          return {
            success: false,
            error: 'Trop de tentatives. Veuillez attendre avant de réessayer.',
            requiresReauth: false
          };
        }
        
        return {
          success: false,
          error: `Erreur lors de la mise à jour: ${updateError.message}`,
          requiresReauth: false
        };
      }

      // 4. Succès
      return { success: true };
      
    } catch (error: any) {
      console.error('Erreur inattendue lors de la mise à jour du mot de passe:', error);
      
      return {
        success: false,
        error: 'Erreur inattendue. Veuillez réessayer.',
        requiresReauth: false
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Rafraîchit la session utilisateur
   * Utile en cas de token expiré
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erreur lors du rafraîchissement de session:', error);
        return false;
      }
      
      return !!data.session;
    } catch (error) {
      console.error('Erreur inattendue lors du rafraîchissement:', error);
      return false;
    }
  }, []);

  /**
   * Valide un mot de passe selon les critères de sécurité
   */
  const validatePassword = useCallback((password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    if (password.length > 128) {
      errors.push('Le mot de passe ne peut pas dépasser 128 caractères');
    }
    
    // Critères de sécurité optionnels (peuvent être activés selon les besoins)
    // if (!/[A-Z]/.test(password)) {
    //   errors.push('Le mot de passe doit contenir au moins une majuscule');
    // }
    
    // if (!/[a-z]/.test(password)) {
    //   errors.push('Le mot de passe doit contenir au moins une minuscule');
    // }
    
    // if (!/\d/.test(password)) {
    //   errors.push('Le mot de passe doit contenir au moins un chiffre');
    // }
    
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    //   errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    // }
    
    return errors;
  }, []);

  /**
   * Gère la mise à jour du mot de passe avec retry automatique
   */
  const updatePasswordWithRetry = useCallback(async (
    newPassword: string, 
    maxRetries: number = 2
  ): Promise<PasswordUpdateResult> => {
    let lastError: string | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Tentative ${attempt}/${maxRetries} de mise à jour du mot de passe`);
      
      const result = await updatePassword(newPassword);
      
      if (result.success) {
        return result;
      }
      
      lastError = result.error;
      
      // Si l'erreur nécessite une réauthentification, pas de retry
      if (result.requiresReauth) {
        break;
      }
      
      // Attendre avant de réessayer (backoff exponentiel)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
        console.log(`Attente de ${delay}ms avant retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return {
      success: false,
      error: lastError || 'Échec après plusieurs tentatives',
      requiresReauth: false
    };
  }, [updatePassword]);

  return {
    loading,
    updatePassword,
    updatePasswordWithRetry,
    refreshSession,
    validatePassword
  };
}
