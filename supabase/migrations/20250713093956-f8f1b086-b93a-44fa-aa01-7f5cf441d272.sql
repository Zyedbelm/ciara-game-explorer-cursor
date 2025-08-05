-- Créer des comptes administrateurs de test
-- Super Admin
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  encrypted_password,
  created_at,
  updated_at,
  confirmation_sent_at
) VALUES (
  gen_random_uuid(),
  'admin@ciara.app',
  now(),
  crypt('AdminCiara2024!', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Insérer le profil super admin
INSERT INTO public.profiles (
  user_id,
  email,
  first_name,
  last_name,
  role,
  total_points,
  current_level
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@ciara.app'),
  'admin@ciara.app',
  'Admin',
  'CIARA',
  'super_admin',
  1000,
  4
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  first_name = 'Admin',
  last_name = 'CIARA';

-- Tenant Admin pour Lausanne
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  encrypted_password,
  created_at,
  updated_at,
  confirmation_sent_at
) VALUES (
  gen_random_uuid(),
  'lausanne@ciara.app',
  now(),
  crypt('Lausanne2024!', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Insérer le profil tenant admin Lausanne
INSERT INTO public.profiles (
  user_id,
  email,
  first_name,
  last_name,
  role,
  total_points,
  current_level,
  city_id
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'lausanne@ciara.app'),
  'lausanne@ciara.app',
  'Admin',
  'Lausanne',
  'tenant_admin',
  500,
  3,
  (SELECT id FROM cities WHERE slug = 'lausanne' LIMIT 1)
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'tenant_admin',
  first_name = 'Admin',
  last_name = 'Lausanne';

-- Staff CIARA
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  encrypted_password,
  created_at,
  updated_at,
  confirmation_sent_at
) VALUES (
  gen_random_uuid(),
  'staff@ciara.app',
  now(),
  crypt('Staff2024!', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Insérer le profil staff
INSERT INTO public.profiles (
  user_id,
  email,
  first_name,
  last_name,
  role,
  total_points,
  current_level
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'staff@ciara.app'),
  'staff@ciara.app',
  'Staff',
  'CIARA',
  'ciara_staff',
  750,
  3
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'ciara_staff',
  first_name = 'Staff',
  last_name = 'CIARA';