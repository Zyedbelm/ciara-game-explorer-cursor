-- Créer les politiques RLS pour la table steps permettant aux admins de gérer les étapes

-- D'abord, supprimer les anciennes politiques s'il y en a
DROP POLICY IF EXISTS "Public steps are viewable by everyone" ON public.steps;
DROP POLICY IF EXISTS "Steps can be managed by admins" ON public.steps;
DROP POLICY IF EXISTS "Tenant admins can manage city steps" ON public.steps;
DROP POLICY IF EXISTS "Super admins can manage all steps" ON public.steps;

-- Politique pour la lecture - tous peuvent voir les étapes actives
CREATE POLICY "Public steps are viewable by everyone" 
ON public.steps 
FOR SELECT 
USING (is_active = true);

-- Politique pour les super admins - peuvent tout faire
CREATE POLICY "Super admins can manage all steps" 
ON public.steps 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Politique pour les tenant admins - peuvent gérer les étapes de leur ville
CREATE POLICY "Tenant admins can manage city steps" 
ON public.steps 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'tenant_admin' 
    AND city_id = steps.city_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'tenant_admin' 
    AND city_id = steps.city_id
  )
);

-- Vérifier que RLS est activé sur la table steps
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;