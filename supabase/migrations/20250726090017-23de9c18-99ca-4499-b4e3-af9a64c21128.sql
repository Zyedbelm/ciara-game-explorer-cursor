-- Vérifier et corriger les politiques RLS pour les articles
-- Les articles sans city_id (articles globaux) ne doivent être visibles que par les super admins

-- Supprimer les anciennes politiques d'articles
DROP POLICY IF EXISTS "Articles are viewable by everyone for published articles" ON articles;
DROP POLICY IF EXISTS "Content managers can manage articles in their city" ON articles;
DROP POLICY IF EXISTS "Super admins can manage all articles" ON articles;
DROP POLICY IF EXISTS "Tenant admins can manage articles in their city" ON articles;

-- Créer des nouvelles politiques plus spécifiques

-- 1. Articles publics sont viewables par tous (sauf les articles globaux pour tenant_admin)
CREATE POLICY "Public articles viewable by everyone" 
ON articles FOR SELECT 
USING (
  status = 'published' AND (
    -- Tout le monde peut voir les articles avec city_id
    city_id IS NOT NULL OR 
    -- Seuls les super admins peuvent voir les articles globaux (city_id = null)
    get_current_user_role() = 'super_admin'
  )
);

-- 2. Articles viewables par les administrateurs selon leur niveau
CREATE POLICY "Admins can view articles based on role" 
ON articles FOR SELECT 
USING (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN 
      -- Tenant admin ne peut voir que les articles de leur ville (pas les globaux)
      city_id = get_user_city_id()
    WHEN get_current_user_role() = 'content_manager' THEN 
      -- Content manager ne peut voir que les articles de leur ville (pas les globaux)
      city_id = get_user_city_id()
    ELSE false
  END
);

-- 3. Super admins peuvent tout gérer
CREATE POLICY "Super admins can manage all articles" 
ON articles FOR ALL 
USING (get_current_user_role() = 'super_admin')
WITH CHECK (get_current_user_role() = 'super_admin');

-- 4. Tenant admins peuvent gérer uniquement les articles de leur ville
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

-- 5. Content managers peuvent gérer uniquement les articles de leur ville
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