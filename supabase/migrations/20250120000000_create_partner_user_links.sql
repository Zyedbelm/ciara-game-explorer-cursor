-- Création de la table partner_user_links
CREATE TABLE IF NOT EXISTS public.partner_user_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(partner_id, user_id)
);

-- Ajout de la colonne partner_id à la table profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'partner_id') THEN
        ALTER TABLE public.profiles ADD COLUMN partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Politiques RLS pour partner_user_links
ALTER TABLE public.partner_user_links ENABLE ROW LEVEL SECURITY;

-- Seuls les super_admins peuvent voir tous les liens
CREATE POLICY "Super admins can view all partner user links" ON public.partner_user_links
    FOR SELECT USING (get_current_user_role() = 'super_admin');

-- Seuls les super_admins peuvent créer des liens
CREATE POLICY "Super admins can create partner user links" ON public.partner_user_links
    FOR INSERT WITH CHECK (get_current_user_role() = 'super_admin');

-- Seuls les super_admins peuvent supprimer des liens
CREATE POLICY "Super admins can delete partner user links" ON public.partner_user_links
    FOR DELETE USING (get_current_user_role() = 'super_admin');

-- Politiques RLS pour profiles (partenaire)
-- Les partenaires peuvent voir leur propre profil
CREATE POLICY "Partners can view own profile" ON public.profiles
    FOR SELECT USING (
        (get_current_user_role() = 'partner' AND id = auth.uid()) OR
        get_current_user_role() IN ('super_admin', 'tenant_admin')
    );

-- Seuls les super_admins peuvent modifier le partner_id
CREATE POLICY "Super admins can update partner_id" ON public.profiles
    FOR UPDATE USING (get_current_user_role() = 'super_admin')
    WITH CHECK (get_current_user_role() = 'super_admin');

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_partner_user_links_partner_id ON public.partner_user_links(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_user_links_user_id ON public.partner_user_links(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_partner_id ON public.profiles(partner_id); 