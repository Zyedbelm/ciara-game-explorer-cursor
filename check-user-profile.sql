-- Script de vérification du profil utilisateur
-- Vérifier le profil de elmeddebfamily@gmail.com

-- 1. Vérifier le profil utilisateur
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.role,
  p.city_id,
  p.first_name,
  p.last_name,
  p.created_at,
  p.updated_at
FROM profiles p
WHERE p.email = 'elmeddebfamily@gmail.com';

-- 2. Vérifier s'il y a des villes disponibles
SELECT 
  id,
  name,
  country_id,
  is_archived,
  is_visible_on_homepage
FROM cities 
WHERE is_archived = false 
  AND is_visible_on_homepage = true
ORDER BY name;

-- 3. Vérifier les récompenses disponibles
SELECT 
  r.id,
  r.title,
  r.points_required,
  r.is_active,
  p.name as partner_name,
  p.city_id,
  c.name as city_name
FROM rewards r
JOIN partners p ON r.partner_id = p.id
JOIN cities c ON p.city_id = c.id
WHERE r.is_active = true
ORDER BY c.name, r.points_required;

-- 4. Vérifier les permissions RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('rewards', 'partners', 'cities')
ORDER BY tablename, policyname;
