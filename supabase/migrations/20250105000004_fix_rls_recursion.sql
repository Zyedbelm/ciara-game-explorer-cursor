-- Migration pour corriger la récursion infinie dans les politiques RLS
-- Date: 2025-01-05

-- Corriger la récursion infinie dans les politiques RLS
-- Supprimer les politiques problématiques
DROP POLICY IF EXISTS "Rewards viewable by role and city" ON public.rewards;
DROP POLICY IF EXISTS "Rewards manageable by role and city" ON public.rewards;
DROP POLICY IF EXISTS "Reward redemptions viewable by role and city" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Reward redemptions manageable by role and city" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Users can create own reward redemptions" ON public.reward_redemptions;

-- Créer des politiques simplifiées sans récursion
CREATE POLICY "Rewards viewable by role and city simple" 
ON public.rewards FOR SELECT 
USING (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN 
      -- Tenant admin ne voit que les récompenses de sa ville
      EXISTS (
        SELECT 1 FROM public.partners p
        WHERE p.id = rewards.partner_id 
        AND p.city_id = get_user_city_id()
      )
    WHEN get_current_user_role() = 'partner' THEN 
      -- Partner ne voit que ses propres récompenses
      partner_id = auth.uid()
    ELSE 
      -- Visiteurs voient les récompenses actives (sans vérification de limites pour éviter la récursion)
      is_active = true
  END
);

-- Politique pour la modification des récompenses
CREATE POLICY "Rewards manageable by role and city simple" 
ON public.rewards FOR ALL 
USING (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN 
      -- Tenant admin ne peut modifier que les récompenses de sa ville
      EXISTS (
        SELECT 1 FROM public.partners p
        WHERE p.id = rewards.partner_id 
        AND p.city_id = get_user_city_id()
      )
    WHEN get_current_user_role() = 'partner' THEN 
      -- Partner ne peut modifier que ses propres récompenses
      partner_id = auth.uid()
    ELSE false
  END
)
WITH CHECK (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN 
      -- Tenant admin ne peut modifier que les récompenses de sa ville
      EXISTS (
        SELECT 1 FROM public.partners p
        WHERE p.id = rewards.partner_id 
        AND p.city_id = get_user_city_id()
      )
    WHEN get_current_user_role() = 'partner' THEN 
      -- Partner ne peut modifier que ses propres récompenses
      partner_id = auth.uid()
    ELSE false
  END
);

-- Politique simplifiée pour les échanges de récompenses
CREATE POLICY "Reward redemptions viewable by role and city simple" 
ON public.reward_redemptions FOR SELECT 
USING (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN 
      -- Tenant admin ne voit que les échanges de sa ville
      EXISTS (
        SELECT 1 FROM public.rewards r
        JOIN public.partners p ON p.id = r.partner_id
        WHERE r.id = reward_redemptions.reward_id 
        AND p.city_id = get_user_city_id()
      )
    WHEN get_current_user_role() = 'partner' THEN 
      -- Partner ne voit que les échanges de ses récompenses
      EXISTS (
        SELECT 1 FROM public.rewards r
        WHERE r.id = reward_redemptions.reward_id 
        AND r.partner_id = auth.uid()
      )
    ELSE 
      -- Utilisateurs normaux ne voient que leurs propres échanges
      user_id = auth.uid()
  END
);

-- Politique pour la création d'échanges
CREATE POLICY "Users can create own reward redemptions" 
ON public.reward_redemptions FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Politique pour la modification d'échanges
CREATE POLICY "Reward redemptions manageable by role and city simple" 
ON public.reward_redemptions FOR UPDATE 
USING (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN 
      -- Tenant admin ne peut modifier que les échanges de sa ville
      EXISTS (
        SELECT 1 FROM public.rewards r
        JOIN public.partners p ON p.id = r.partner_id
        WHERE r.id = reward_redemptions.reward_id 
        AND p.city_id = get_user_city_id()
      )
    WHEN get_current_user_role() = 'partner' THEN 
      -- Partner ne peut modifier que les échanges de ses récompenses
      EXISTS (
        SELECT 1 FROM public.rewards r
        WHERE r.id = reward_redemptions.reward_id 
        AND r.partner_id = auth.uid()
      )
    ELSE 
      -- Utilisateurs normaux ne peuvent modifier que leurs propres échanges
      user_id = auth.uid()
  END
);

-- Commentaire explicatif
COMMENT ON POLICY "Rewards viewable by role and city simple" ON public.rewards IS 'Politique RLS simplifiée pour éviter la récursion infinie';
COMMENT ON POLICY "Reward redemptions viewable by role and city simple" ON public.reward_redemptions IS 'Politique RLS simplifiée pour éviter la récursion infinie'; 