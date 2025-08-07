-- Script pour corriger les politiques RLS de la table partners
-- À exécuter directement dans l'interface Supabase SQL Editor

-- First, drop all existing policies on partners table
DROP POLICY IF EXISTS "Partners are viewable by everyone" ON public.partners;
DROP POLICY IF EXISTS "Only admins can modify partners" ON public.partners;
DROP POLICY IF EXISTS "Active partners are viewable by everyone" ON public.partners;
DROP POLICY IF EXISTS "Partners can view own data" ON public.partners;
DROP POLICY IF EXISTS "Partners can manage own data" ON public.partners;

-- Create new, simplified policies for partners table
-- 1. Everyone can view active partners (for public display)
CREATE POLICY "Partners are viewable by everyone" 
ON public.partners 
FOR SELECT 
USING (is_active = true);

-- 2. Partners can view and update their own data
CREATE POLICY "Partners can manage own data" 
ON public.partners 
FOR ALL 
USING (
  CASE 
    -- Partners can access their own data via email
    WHEN email = auth.jwt() ->> 'email' THEN true
    -- Super admins can access all partners
    WHEN get_current_user_role() = 'super_admin' THEN true
    -- Tenant admins can access partners in their city
    WHEN get_current_user_role() = 'tenant_admin' 
      AND city_id = get_user_city_id() THEN true
    ELSE false
  END
)
WITH CHECK (
  CASE 
    -- Partners can update their own data
    WHEN email = auth.jwt() ->> 'email' THEN true
    -- Super admins can modify all partners
    WHEN get_current_user_role() = 'super_admin' THEN true
    -- Tenant admins can modify partners in their city
    WHEN get_current_user_role() = 'tenant_admin' 
      AND city_id = get_user_city_id() THEN true
    ELSE false
  END
);

-- 3. Only admins can create/delete partners
CREATE POLICY "Only admins can create partners" 
ON public.partners 
FOR INSERT 
WITH CHECK (
  get_current_user_role() IN ('super_admin', 'tenant_admin')
);

CREATE POLICY "Only admins can delete partners" 
ON public.partners 
FOR DELETE 
USING (
  get_current_user_role() IN ('super_admin', 'tenant_admin')
);

-- Add index for better performance on partner lookups
CREATE INDEX IF NOT EXISTS idx_partners_city_id ON public.partners(city_id);
CREATE INDEX IF NOT EXISTS idx_partners_is_active ON public.partners(is_active);
CREATE INDEX IF NOT EXISTS idx_partners_email ON public.partners(email);

-- Ensure the table has RLS enabled
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY; 