-- Migration pour corriger le filtrage par ville pour les tenant_admin
-- Date: 2025-01-05

-- 1. Corriger les politiques RLS pour les récompenses
-- Supprimer les anciennes politiques trop permissives
DROP POLICY IF EXISTS "Rewards are viewable by everyone" ON public.rewards;
DROP POLICY IF EXISTS "Only admins can modify rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users can view visible rewards only" ON public.rewards;

-- Créer des nouvelles politiques avec filtrage par ville pour tenant_admin
CREATE POLICY "Rewards viewable by role and city" 
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
      -- Visiteurs voient les récompenses actives selon les limites
      is_active = true
      AND (
        max_redemptions IS NULL
        OR
        (
          SELECT COUNT(*)
          FROM public.reward_redemptions rr
          WHERE rr.reward_id = rewards.id 
            AND rr.status IN ('pending', 'used')
        ) < max_redemptions
      )
  END
);

-- Politique pour la modification des récompenses
CREATE POLICY "Rewards manageable by role and city" 
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

-- 2. Corriger les politiques RLS pour les échanges de récompenses
-- Supprimer les anciennes politiques trop permissives
DROP POLICY IF EXISTS "Users can view own reward redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Users can create own reward redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Users can update own reward redemptions" ON public.reward_redemptions;

-- Créer des nouvelles politiques avec filtrage par ville pour tenant_admin
CREATE POLICY "Reward redemptions viewable by role and city" 
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
CREATE POLICY "Reward redemptions manageable by role and city" 
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

-- 3. Corriger les politiques RLS pour les partenaires
-- Supprimer les anciennes politiques trop permissives
DROP POLICY IF EXISTS "Partners are viewable by everyone" ON public.partners;
DROP POLICY IF EXISTS "Only admins can modify partners" ON public.partners;

-- Créer des nouvelles politiques avec filtrage par ville pour tenant_admin
CREATE POLICY "Partners viewable by role and city" 
ON public.partners FOR SELECT 
USING (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN 
      -- Tenant admin ne voit que les partenaires de sa ville
      city_id = get_user_city_id()
    WHEN get_current_user_role() = 'partner' THEN 
      -- Partner ne voit que son propre profil
      id = auth.uid()
    ELSE true -- Visiteurs peuvent voir tous les partenaires
  END
);

-- Politique pour la modification des partenaires
CREATE POLICY "Partners manageable by role and city" 
ON public.partners FOR ALL 
USING (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN 
      -- Tenant admin ne peut modifier que les partenaires de sa ville
      city_id = get_user_city_id()
    WHEN get_current_user_role() = 'partner' THEN 
      -- Partner ne peut modifier que son propre profil
      id = auth.uid()
    ELSE false
  END
)
WITH CHECK (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN 
      -- Tenant admin ne peut modifier que les partenaires de sa ville
      city_id = get_user_city_id()
    WHEN get_current_user_role() = 'partner' THEN 
      -- Partner ne peut modifier que son propre profil
      id = auth.uid()
    ELSE false
  END
);

-- Commentaire explicatif
COMMENT ON POLICY "Rewards viewable by role and city" ON public.rewards IS 'Filtrage des récompenses par rôle et ville pour les tenant_admin';
COMMENT ON POLICY "Reward redemptions viewable by role and city" ON public.reward_redemptions IS 'Filtrage des échanges de récompenses par rôle et ville pour les tenant_admin';
COMMENT ON POLICY "Partners viewable by role and city" ON public.partners IS 'Filtrage des partenaires par rôle et ville pour les tenant_admin'; 