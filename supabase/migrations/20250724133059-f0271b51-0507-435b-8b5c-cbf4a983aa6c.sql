
-- Ajouter une colonne country_id à la table cities et un système de visibilité
ALTER TABLE public.cities 
ADD COLUMN country_id UUID REFERENCES public.countries(id),
ADD COLUMN is_visible_on_homepage BOOLEAN NOT NULL DEFAULT true;

-- Mettre à jour les villes existantes pour les lier aux pays
-- Supposons que les villes actuelles sont suisses par défaut
UPDATE public.cities 
SET country_id = (SELECT id FROM public.countries WHERE code = 'CH')
WHERE country_id IS NULL;

-- Ajouter une contrainte pour s'assurer qu'une ville a toujours un pays
ALTER TABLE public.cities 
ALTER COLUMN country_id SET NOT NULL;

-- Créer un index pour optimiser les requêtes par pays
CREATE INDEX idx_cities_country_id ON public.cities(country_id);
CREATE INDEX idx_cities_visibility ON public.cities(is_visible_on_homepage);

-- Mettre à jour les politiques RLS pour inclure la visibilité
DROP POLICY IF EXISTS "Cities are viewable by everyone" ON public.cities;

CREATE POLICY "Cities are viewable by everyone" 
ON public.cities 
FOR SELECT 
USING (true); -- Les admins peuvent voir toutes les villes, les visiteurs via l'application frontend

-- Politique pour la visibilité sur homepage (sera gérée côté application)
CREATE POLICY "Cities visible on homepage" 
ON public.cities 
FOR SELECT 
USING (is_visible_on_homepage = true OR get_current_user_role() = ANY(ARRAY['super_admin', 'tenant_admin']));
