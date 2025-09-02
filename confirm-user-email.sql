-- 🚀 CONFIRMATION MANUELLE DE L'EMAIL
-- Exécutez ce script dans Supabase Dashboard → SQL Editor

-- 1. Vérifier l'état de l'utilisateur
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at
FROM auth.users 
WHERE email = 'baptiste.meddeb@genieculturel.ch';

-- 2. Confirmer l'email manuellement
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'baptiste.meddeb@genieculturel.ch';

-- 3. Vérifier la confirmation
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at
FROM auth.users 
WHERE email = 'baptiste.meddeb@genieculturel.ch';

-- 4. Vérifier que le profil existe
SELECT 
  user_id,
  email,
  role,
  first_name,
  last_name,
  created_at
FROM profiles 
WHERE email = 'baptiste.meddeb@genieculturel.ch';

-- 5. Instructions après confirmation
-- L'utilisateur peut maintenant se connecter avec :
-- Email: baptiste.meddeb@genieculturel.ch
-- Mot de passe: [celui utilisé lors de l'inscription]
