-- Corriger les politiques RLS pour toutes les tables liées aux parcours

-- ===== TABLE JOURNEYS =====
DROP POLICY IF EXISTS "Public journeys are viewable by everyone" ON public.journeys;
DROP POLICY IF EXISTS "Super admins can manage all journeys" ON public.journeys;
DROP POLICY IF EXISTS "Tenant admins can manage city journeys" ON public.journeys;

-- Lecture publique des parcours actifs
CREATE POLICY "Public journeys are viewable by everyone" 
ON public.journeys 
FOR SELECT 
USING (is_active = true);

-- Super admins peuvent tout gérer
CREATE POLICY "Super admins can manage all journeys" 
ON public.journeys 
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

-- Tenant admins peuvent gérer les parcours de leur ville
CREATE POLICY "Tenant admins can manage city journeys" 
ON public.journeys 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'tenant_admin' 
    AND city_id = journeys.city_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'tenant_admin' 
    AND city_id = journeys.city_id
  )
);

-- ===== TABLE JOURNEY_CATEGORIES =====
DROP POLICY IF EXISTS "Public content is viewable by everyone" ON public.journey_categories;
DROP POLICY IF EXISTS "Super admins can manage all categories" ON public.journey_categories;
DROP POLICY IF EXISTS "Tenant admins can manage city categories" ON public.journey_categories;

-- Lecture publique des catégories
CREATE POLICY "Public categories are viewable by everyone" 
ON public.journey_categories 
FOR SELECT 
USING (true);

-- Super admins peuvent tout gérer
CREATE POLICY "Super admins can manage all categories" 
ON public.journey_categories 
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

-- Tenant admins peuvent gérer les catégories de leur ville
CREATE POLICY "Tenant admins can manage city categories" 
ON public.journey_categories 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'tenant_admin' 
    AND city_id = journey_categories.city_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'tenant_admin' 
    AND city_id = journey_categories.city_id
  )
);

-- ===== TABLE JOURNEY_STEPS =====
DROP POLICY IF EXISTS "Journey steps are viewable by everyone" ON public.journey_steps;
DROP POLICY IF EXISTS "Super admins can manage all journey steps" ON public.journey_steps;
DROP POLICY IF EXISTS "Tenant admins can manage city journey steps" ON public.journey_steps;

-- Lecture publique des liens journey-steps
CREATE POLICY "Journey steps are viewable by everyone" 
ON public.journey_steps 
FOR SELECT 
USING (true);

-- Super admins peuvent tout gérer
CREATE POLICY "Super admins can manage all journey steps" 
ON public.journey_steps 
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

-- Tenant admins peuvent gérer les journey_steps de leur ville
CREATE POLICY "Tenant admins can manage city journey steps" 
ON public.journey_steps 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.journeys j ON j.id = journey_steps.journey_id
    WHERE p.user_id = auth.uid() 
    AND p.role = 'tenant_admin' 
    AND p.city_id = j.city_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.journeys j ON j.id = journey_steps.journey_id
    WHERE p.user_id = auth.uid() 
    AND p.role = 'tenant_admin' 
    AND p.city_id = j.city_id
  )
);

-- Vérifier que RLS est activé sur toutes les tables
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_steps ENABLE ROW LEVEL SECURITY;