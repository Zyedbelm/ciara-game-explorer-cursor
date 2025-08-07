-- Correction des politiques RLS pour les articles
-- Objectif : Lecture publique pour tous, modifications restreintes par rôle

-- Supprimer les anciennes politiques d'articles
DROP POLICY IF EXISTS "Public articles viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Admins can view articles based on role" ON articles;
DROP POLICY IF EXISTS "Super admins can manage all articles" ON articles;
DROP POLICY IF EXISTS "Tenant admins can manage city articles" ON articles;
DROP POLICY IF EXISTS "Content managers can manage city articles" ON articles;

-- 1. POLITIQUE DE LECTURE : Tout le monde peut lire les articles publiés
CREATE POLICY "Published articles viewable by everyone" 
ON articles FOR SELECT 
USING (status = 'published');

-- 2. POLITIQUE DE MODIFICATION : Super admin peut tout faire
CREATE POLICY "Super admins can manage all articles" 
ON articles FOR ALL 
USING (get_current_user_role() = 'super_admin')
WITH CHECK (get_current_user_role() = 'super_admin');

-- 3. POLITIQUE DE MODIFICATION : Tenant admin peut gérer uniquement les articles de sa ville
CREATE POLICY "Tenant admins can manage city articles" 
ON articles FOR ALL 
USING (
  get_current_user_role() = 'tenant_admin' AND 
  city_id = get_user_city_id() AND 
  city_id IS NOT NULL
)
WITH CHECK (
  get_current_user_role() = 'tenant_admin' AND 
  city_id = get_user_city_id() AND 
  city_id IS NOT NULL
);

-- 4. POLITIQUE DE MODIFICATION : Content manager peut gérer uniquement les articles de sa ville
CREATE POLICY "Content managers can manage city articles" 
ON articles FOR ALL 
USING (
  get_current_user_role() = 'content_manager' AND 
  city_id = get_user_city_id() AND 
  city_id IS NOT NULL
)
WITH CHECK (
  get_current_user_role() = 'content_manager' AND 
  city_id = get_user_city_id() AND 
  city_id IS NOT NULL
);

-- Vérification : Afficher les politiques créées
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
WHERE tablename = 'articles'
ORDER BY policyname;
