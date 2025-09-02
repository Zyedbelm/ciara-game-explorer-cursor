-- =====================================================
-- ROLLBACK DU NETTOYAGE DES UTILISATEURS
-- ATTENTION : Ce script nécessite une sauvegarde préalable
-- =====================================================

-- IMPORTANT : Ce script ne peut restaurer que si vous avez une sauvegarde
-- Il est recommandé de faire une sauvegarde avant d'exécuter le nettoyage

-- 1. VÉRIFIER L'ÉTAT ACTUEL
SELECT 
    'État actuel' as status,
    COUNT(*) as users_count,
    (SELECT COUNT(*) FROM public.profiles) as profiles_count
FROM auth.users;

-- 2. RESTAURATION DEPUIS UNE SAUVEGARDE (si disponible)
-- Si vous avez une sauvegarde, utilisez cette commande :
-- pg_restore --clean --if-exists --no-owner --no-privileges --schema=auth --schema=public backup_file.dump

-- 3. VÉRIFICATION POST-RESTAURATION
SELECT 
    'Post-restauration' as status,
    COUNT(*) as users_count,
    (SELECT COUNT(*) FROM public.profiles) as profiles_count
FROM auth.users;

-- 4. VÉRIFICATION DE L'INTÉGRITÉ
SELECT 
    'Vérification intégrité' as check_type,
    COUNT(*) as orphaned_profiles
FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL;

-- =====================================================
-- ALTERNATIVE : RESTAURATION MANUELLE
-- =====================================================
-- Si vous n'avez pas de sauvegarde, vous devrez :
-- 1. Recréer manuellement les utilisateurs
-- 2. Recréer leurs profils
-- 3. Réinitialiser leurs mots de passe
-- 4. Vérifier les permissions et rôles

-- =====================================================
-- RECOMMANDATIONS
-- =====================================================
-- AVANT d'exécuter le nettoyage :
-- 1. Faire une sauvegarde complète de la base
-- 2. Tester sur un environnement de développement
-- 3. Vérifier les dépendances et contraintes
-- 4. Planifier une fenêtre de maintenance
