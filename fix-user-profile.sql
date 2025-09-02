-- Script de correction du profil utilisateur
-- Assigner une ville à elmeddebfamily@gmail.com

-- 1. Vérifier d'abord le profil actuel
SELECT 
  p.id,
  p.email,
  p.role,
  p.city_id,
  c.name as city_name
FROM profiles p
LEFT JOIN cities c ON p.city_id = c.id
WHERE p.email = 'elmeddebfamily@gmail.com';

-- 2. Assigner une ville (exemple avec Lausanne)
UPDATE profiles 
SET 
  city_id = (SELECT id FROM cities WHERE name = 'Lausanne' AND is_archived = false LIMIT 1),
  updated_at = NOW()
WHERE email = 'elmeddebfamily@gmail.com';

-- 3. Vérifier la mise à jour
SELECT 
  p.id,
  p.email,
  p.role,
  p.city_id,
  c.name as city_name,
  p.updated_at
FROM profiles p
LEFT JOIN cities c ON p.city_id = c.id
WHERE p.email = 'elmeddebfamily@gmail.com';

-- 4. Alternative : Assigner la première ville disponible si Lausanne n'existe pas
-- UPDATE profiles 
-- SET 
--   city_id = (SELECT id FROM cities WHERE is_archived = false AND is_visible_on_homepage = true ORDER BY name LIMIT 1),
--   updated_at = NOW()
-- WHERE email = 'elmeddebfamily@gmail.com' AND city_id IS NULL;
