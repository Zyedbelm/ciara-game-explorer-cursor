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

-- Seul le super admin peut archiver/désarchiver une ville
CREATE POLICY "Only super admins can archive cities" 
ON public.cities 
FOR UPDATE 
USING (
  CASE 
    WHEN OLD.is_archived != NEW.is_archived THEN 
      get_current_user_role() = 'super_admin'::text
    ELSE 
      get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text])
  END
);