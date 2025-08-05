-- Ajouter la colonne expires_at à la table reward_redemptions
ALTER TABLE public.reward_redemptions 
ADD COLUMN expires_at timestamp with time zone;