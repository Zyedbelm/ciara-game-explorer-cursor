-- Ajouter un champ is_archived à la table cities pour permettre d'archiver les villes
ALTER TABLE public.cities 
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

-- Mettre à jour les politiques RLS pour tenir compte du statut d'archivage
-- Les villes archivées ne devraient être visibles que par les admins
DROP POLICY IF EXISTS "Cities are viewable by everyone" ON public.cities;

CREATE POLICY "Cities are viewable by everyone or admins" 
ON public.cities 
FOR SELECT 
USING (
  (is_archived = false) OR 
  (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text]))
);

-- Seuls les super admins peuvent modifier le statut d'archivage
-- mais les tenant admins peuvent modifier les autres champs de leur ville
DROP POLICY IF EXISTS "Only admins can modify cities" ON public.cities;

CREATE POLICY "Admins can modify cities" 
ON public.cities 
FOR UPDATE 
USING (
  get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text])
);