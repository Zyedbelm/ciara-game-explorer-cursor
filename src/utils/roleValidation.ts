/**
 * Validation des rôles utilisateur - Phase 1 du nettoyage
 * 
 * Ce fichier contient les utilitaires pour valider que le système de rôles
 * fonctionne correctement avec les quatre rôles autorisés :
 * - super_admin
 * - tenant_admin 
 * - visitor
 * - partner
 */

export type ValidUserRole = 'super_admin' | 'tenant_admin' | 'visitor' | 'partner';

/**
 * Valide qu'un rôle est autorisé dans le système
 */
export function isValidRole(role: string): role is ValidUserRole {
  return ['super_admin', 'tenant_admin', 'visitor', 'partner'].includes(role);
}

/**
 * Matrice des permissions pour chaque rôle
 */
export const ROLE_PERMISSIONS = {
  super_admin: {
    canManageAllCities: true,
    canManageAllUsers: true,
    canViewAllAnalytics: true,
    canManageContent: true,
    canManagePackages: true,
    canManageSystem: true,
  },
  tenant_admin: {
    canManageAllCities: false,
    canManageAllUsers: false, // Seulement les utilisateurs de leur ville
    canViewAllAnalytics: false, // Seulement leur ville
    canManageContent: true, // Pour leur ville
    canManagePackages: false, // Lecture seule de leur package
    canManageSystem: false,
  },
  visitor: {
    canManageAllCities: false,
    canManageAllUsers: false,
    canViewAllAnalytics: false,
    canManageContent: false,
    canManagePackages: false,
    canManageSystem: false,
  },
  partner: {
    canManageAllCities: false,
    canManageAllUsers: false,
    canViewAllAnalytics: true, // Peut voir ses propres analytics
    canManageContent: false,
    canManagePackages: false,
    canManageSystem: false,
  },
} as const;

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(
  userRole: ValidUserRole, 
  permission: keyof typeof ROLE_PERMISSIONS.super_admin
): boolean {
  return ROLE_PERMISSIONS[userRole][permission];
}

/**
 * Retourne la liste des rôles qui ont une permission donnée
 */
export function getRolesWithPermission(
  permission: keyof typeof ROLE_PERMISSIONS.super_admin
): ValidUserRole[] {
  return (Object.keys(ROLE_PERMISSIONS) as ValidUserRole[]).filter(
    role => ROLE_PERMISSIONS[role][permission]
  );
}

/**
 * Validation que tous les rôles fantômes ont été supprimés
 */
export function validateNoGhostRoles(roles: string[]): { valid: boolean; ghostRoles: string[] } {
  const ghostRoles = roles.filter(role => !isValidRole(role));
  return {
    valid: ghostRoles.length === 0,
    ghostRoles
  };
}

/**
 * Documentation des changements de mapping des rôles
 */
export const ROLE_MIGRATION_MAP = {
  'content_manager': 'tenant_admin',
  'analytics_viewer': 'tenant_admin', 
  'ciara_staff': 'super_admin',
  'partner_admin': 'tenant_admin',
  'partner_viewer': 'visitor',
} as const;

/**
 * Fonction utilitaire pour migrer les anciens rôles
 */
export function migrateRole(oldRole: string): ValidUserRole {
  if (isValidRole(oldRole)) {
    return oldRole;
  }
  
  const mapped = ROLE_MIGRATION_MAP[oldRole as keyof typeof ROLE_MIGRATION_MAP];
  if (mapped) {
    return mapped;
  }
  
  // Par défaut, assigner visitor pour les rôles inconnus
  console.warn(`Rôle inconnu rencontré: ${oldRole}, assigné comme visitor`);
  return 'visitor';
}