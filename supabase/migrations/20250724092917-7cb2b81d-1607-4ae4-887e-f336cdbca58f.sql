-- Mise à jour des récompenses existantes avec des limites par défaut
UPDATE public.rewards 
SET 
  max_redemptions = CASE 
    WHEN max_redemptions IS NULL THEN 100 
    ELSE max_redemptions 
  END,
  max_redemptions_per_user = CASE 
    WHEN max_redemptions_per_user IS NULL THEN 5 
    ELSE max_redemptions_per_user 
  END
WHERE max_redemptions IS NULL OR max_redemptions_per_user IS NULL;

-- Ajouter des contraintes par défaut pour les nouvelles récompenses
ALTER TABLE public.rewards 
ALTER COLUMN max_redemptions SET DEFAULT 100;

ALTER TABLE public.rewards 
ALTER COLUMN max_redemptions_per_user SET DEFAULT 5;