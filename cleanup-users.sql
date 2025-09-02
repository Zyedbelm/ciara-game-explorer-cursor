-- =====================================================
-- NETTOYAGE COMPLET DES UTILISATEURS ET PROFILS
-- CONSERVATION UNIQUEMENT DU SUPER ADMIN
-- =====================================================

-- IMPORTANT : Ce script supprime TOUS les utilisateurs sauf zyed.elmeddeb@gmail.com
-- Exécuter avec précaution et vérifier les résultats

BEGIN;

-- 1. IDENTIFIER LE SUPER ADMIN À CONSERVER
DO $$
DECLARE
    super_admin_id uuid;
    super_admin_profile_id uuid;
BEGIN
    -- Trouver l'ID de l'utilisateur super admin
    SELECT id INTO super_admin_id 
    FROM auth.users 
    WHERE email = 'zyed.elmeddeb@gmail.com';
    
    IF super_admin_id IS NULL THEN
        RAISE EXCEPTION 'Super admin zyed.elmeddeb@gmail.com non trouvé !';
    END IF;
    
    -- Trouver l'ID du profil super admin
    SELECT user_id INTO super_admin_profile_id 
    FROM public.profiles 
    WHERE user_id = super_admin_id;
    
    RAISE NOTICE 'Super admin identifié : % (profil: %)', super_admin_id, super_admin_profile_id;
END $$;

-- 2. SUPPRIMER LES PROFILS (sauf super admin)
DELETE FROM public.profiles 
WHERE user_id NOT IN (
    SELECT id FROM auth.users WHERE email = 'zyed.elmeddeb@gmail.com'
);

-- 3. SUPPRIMER LES UTILISATEURS (sauf super admin)
DELETE FROM auth.users 
WHERE email != 'zyed.elmeddeb@gmail.com';

-- 4. VÉRIFICATION FINALE
DO $$
DECLARE
    remaining_users_count integer;
    remaining_profiles_count integer;
BEGIN
    -- Compter les utilisateurs restants
    SELECT COUNT(*) INTO remaining_users_count FROM auth.users;
    
    -- Compter les profils restants
    SELECT COUNT(*) INTO remaining_profiles_count FROM public.profiles;
    
    RAISE NOTICE 'Nettoyage terminé :';
    RAISE NOTICE '- Utilisateurs restants : %', remaining_users_count;
    RAISE NOTICE '- Profils restants : %', remaining_profiles_count;
    
    -- Vérification que seul le super admin reste
    IF remaining_users_count != 1 THEN
        RAISE EXCEPTION 'Erreur : Nombre d''utilisateurs incorrect après nettoyage';
    END IF;
    
    IF remaining_profiles_count != 1 THEN
        RAISE EXCEPTION 'Erreur : Nombre de profils incorrect après nettoyage';
    END IF;
    
    RAISE NOTICE '✅ Nettoyage réussi : Seul le super admin zyed.elmeddeb@gmail.com reste';
END $$;

COMMIT;

-- =====================================================
-- RÉSULTATS ATTENDUS
-- =====================================================
-- Après exécution, il devrait rester :
-- - 1 utilisateur dans auth.users (zyed.elmeddeb@gmail.com)
-- - 1 profil dans public.profiles (profil du super admin)
-- =====================================================
