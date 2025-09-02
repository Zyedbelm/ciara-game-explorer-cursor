-- =====================================================
-- VÉRIFICATION DE L'ÉTAT DES UTILISATEURS ET PROFILS
-- =====================================================

-- 1. COMPTER LES UTILISATEURS ACTUELS
SELECT 
    'auth.users' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN email = 'zyed.elmeddeb@gmail.com' THEN 1 END) as super_admin_count,
    COUNT(CASE WHEN email != 'zyed.elmeddeb@gmail.com' THEN 1 END) as other_users_count
FROM auth.users;

-- 2. COMPTER LES PROFILS ACTUELS
SELECT 
    'public.profiles' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN email = 'zyed.elmeddeb@gmail.com' THEN 1 END) as super_admin_profile_count,
    COUNT(CASE WHEN email != 'zyed.elmeddeb@gmail.com' THEN 1 END) as other_profiles_count
FROM public.profiles;

-- 3. LISTER TOUS LES UTILISATEURS (avec leurs profils)
SELECT 
    u.id as user_id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    p.role,
    p.full_name,
    p.total_points,
    p.current_level
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- 4. VÉRIFIER LES RELATIONS ET CONTRAINTES
SELECT 
    'Vérification des relations' as check_type,
    COUNT(*) as orphaned_profiles
FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL;

-- 5. STATISTIQUES PAR RÔLE
SELECT 
    p.role,
    COUNT(*) as count
FROM public.profiles p
GROUP BY p.role
ORDER BY count DESC;

-- 6. VÉRIFICATION DES DONNÉES SENSIBLES
SELECT 
    'Données sensibles' as check_type,
    COUNT(CASE WHEN u.email LIKE '%test%' THEN 1 END) as test_accounts,
    COUNT(CASE WHEN u.email LIKE '%temp%' THEN 1 END) as temp_accounts,
    COUNT(CASE WHEN u.email LIKE '%example%' THEN 1 END) as example_accounts
FROM auth.users u;
