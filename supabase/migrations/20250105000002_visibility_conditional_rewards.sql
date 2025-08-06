-- Migration pour la visibilité conditionnelle des récompenses
-- Date: 2025-01-05

-- Fonction pour obtenir les récompenses visibles selon les limites
CREATE OR REPLACE FUNCTION public.get_visible_rewards_for_user(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  points_required integer,
  value_chf double precision,
  type text,
  image_url text,
  max_redemptions integer,
  max_redemptions_per_user integer,
  validity_days integer,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  terms_conditions text,
  partner_id uuid,
  language text,
  title_en text,
  title_de text,
  description_en text,
  description_de text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.points_required,
    r.value_chf,
    r.type,
    r.image_url,
    r.max_redemptions,
    r.max_redemptions_per_user,
    r.validity_days,
    r.is_active,
    r.created_at,
    r.updated_at,
    r.terms_conditions,
    r.partner_id,
    r.language,
    r.title_en,
    r.title_de,
    r.description_en,
    r.description_de
  FROM public.rewards r
  WHERE r.is_active = true
    AND (
      -- Si pas de limite globale, toujours visible
      r.max_redemptions IS NULL
      OR
      -- Si limite globale, vérifier qu'elle n'est pas atteinte
      (
        SELECT COUNT(*)
        FROM public.reward_redemptions rr
        WHERE rr.reward_id = r.id 
          AND rr.status IN ('pending', 'used')
      ) < r.max_redemptions
    );
END;
$$;

-- Politique RLS pour utiliser cette fonction
CREATE POLICY "Users can view visible rewards only" 
ON public.rewards FOR SELECT 
USING (
  is_active = true
  AND (
    max_redemptions IS NULL
    OR
    (
      SELECT COUNT(*)
      FROM public.reward_redemptions rr
      WHERE rr.reward_id = id 
        AND rr.status IN ('pending', 'used')
    ) < max_redemptions
  )
);

-- Commentaire explicatif
COMMENT ON FUNCTION public.get_visible_rewards_for_user IS 'Retourne uniquement les récompenses visibles selon les limites globales et par utilisateur'; 