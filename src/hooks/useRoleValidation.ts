import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isValidRole, hasPermission, ValidUserRole } from '@/utils/roleValidation';

/**
 * Hook pour valider le système de rôles après nettoyage
 */
export function useRoleValidation() {
  const { profile } = useAuth();
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    issues: string[];
    role: ValidUserRole | null;
  }>({
    isValid: true,
    issues: [],
    role: null,
  });

  useEffect(() => {
    if (!profile?.role) {
      setValidationStatus({
        isValid: false,
        issues: ['Aucun rôle défini pour l\'utilisateur'],
        role: null,
      });
      return;
    }

    const issues: string[] = [];
    
    // Valider que le rôle existe dans notre système
    if (!isValidRole(profile.role)) {
      issues.push(`Rôle invalide détecté: ${profile.role}`);
    }

    // Valider la cohérence role-ville pour tenant_admin
    if (profile.role === 'tenant_admin' && !profile.city_id) {
      issues.push('tenant_admin doit avoir une ville assignée');
    }

    setValidationStatus({
      isValid: issues.length === 0,
      issues,
      role: isValidRole(profile.role) ? profile.role : null,
    });
  }, [profile]);

  // Fonctions utilitaires pour vérifier les permissions
  const canManageContent = () => {
    return validationStatus.role ? hasPermission(validationStatus.role, 'canManageContent') : false;
  };

  const canViewAnalytics = () => {
    return validationStatus.role ? hasPermission(validationStatus.role, 'canViewAllAnalytics') : false;
  };

  const canManageUsers = () => {
    return validationStatus.role ? hasPermission(validationStatus.role, 'canManageAllUsers') : false;
  };

  const canManageSystem = () => {
    return validationStatus.role ? hasPermission(validationStatus.role, 'canManageSystem') : false;
  };

  return {
    ...validationStatus,
    canManageContent,
    canViewAnalytics,
    canManageUsers,
    canManageSystem,
  };
}