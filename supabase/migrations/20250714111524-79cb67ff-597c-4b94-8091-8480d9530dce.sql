-- Create test admin accounts
-- Note: These will be created in the profiles table, actual auth users need to be created via Supabase Auth

-- Create test super admin profile (email will be used to create auth user)
INSERT INTO public.profiles (
  user_id, 
  email, 
  first_name, 
  last_name, 
  role, 
  total_points, 
  current_level
) VALUES (
  'b5a1e2d0-4c6f-4f8a-9e1b-3d7c8f2a9e1b',
  'admin@ciara.app',
  'Admin',
  'Super',
  'super_admin',
  0,
  1
) ON CONFLICT (user_id) DO NOTHING;

-- Create test tenant admin profile
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
  'a4f3e2d1-5c6f-4f8a-9e1b-3d7c8f2a9e1c',
  'tenant@ciara.app',
  'Tenant',
  'Admin',
  'tenant_admin',
  0,
  1,
  (SELECT id FROM cities LIMIT 1)
) ON CONFLICT (user_id) DO NOTHING;