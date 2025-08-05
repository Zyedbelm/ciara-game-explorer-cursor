-- Ajouter la colonne created_by à la table journeys pour identifier le créateur
ALTER TABLE public.journeys 
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Créer une politique RLS pour permettre aux utilisateurs de créer et gérer leurs propres parcours
CREATE POLICY "Users can manage their own personal journeys" 
ON public.journeys 
FOR ALL 
USING (
  CASE 
    -- Les utilisateurs peuvent gérer leurs propres parcours non-prédéfinis
    WHEN created_by = auth.uid() AND is_predefined = false THEN true
    -- Les admins gardent leurs permissions existantes
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = ANY (ARRAY['tenant_admin', 'content_manager']) AND can_manage_city(city_id) THEN true
    ELSE false
  END
)
WITH CHECK (
  CASE 
    -- Pour la création, permettre aux utilisateurs de créer leurs parcours personnels
    WHEN created_by = auth.uid() AND is_predefined = false THEN true
    -- Les admins gardent leurs permissions existantes
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = ANY (ARRAY['tenant_admin', 'content_manager']) AND can_manage_city(city_id) THEN true
    ELSE false
  END
);