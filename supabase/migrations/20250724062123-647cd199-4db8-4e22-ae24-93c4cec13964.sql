-- Ajout de champs de géolocalisation pour les partenaires si ils n'existent pas déjà
-- Et création de la table pour la validation des codes de récompenses

-- Vérifier si les colonnes existent déjà pour les partenaires
DO $$ 
BEGIN
    -- Ajouter latitude et longitude si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'latitude') THEN
        ALTER TABLE public.partners ADD COLUMN latitude double precision;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'longitude') THEN
        ALTER TABLE public.partners ADD COLUMN longitude double precision;
    END IF;
END $$;

-- Créer la table pour la validation des codes partenaires si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.partner_validations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    redemption_id UUID NOT NULL REFERENCES public.reward_redemptions(id) ON DELETE CASCADE,
    validation_code TEXT NOT NULL UNIQUE,
    validated_at TIMESTAMP WITH TIME ZONE,
    validated_by TEXT, -- Partner email or identifier
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_partner_validations_code ON public.partner_validations(validation_code);
CREATE INDEX IF NOT EXISTS idx_partner_validations_partner ON public.partner_validations(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_validations_redemption ON public.partner_validations(redemption_id);

-- RLS pour la table des validations partenaires
ALTER TABLE public.partner_validations ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre aux partenaires de voir et valider leurs codes
CREATE POLICY "Partners can view and validate their codes" 
ON public.partner_validations 
FOR ALL 
USING (
  partner_id IN (
    SELECT id FROM public.partners 
    WHERE email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  partner_id IN (
    SELECT id FROM public.partners 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy pour les admins
CREATE POLICY "Admins can view all partner validations" 
ON public.partner_validations 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text]));

-- Trigger pour updated_at
CREATE TRIGGER update_partner_validations_updated_at
  BEFORE UPDATE ON public.partner_validations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();