
-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_de TEXT,
  title TEXT NOT NULL,
  title_en TEXT,
  title_de TEXT,
  content TEXT NOT NULL,
  content_en TEXT,
  content_de TEXT,
  company TEXT,
  company_en TEXT,
  company_de TEXT,
  avatar_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  language TEXT NOT NULL DEFAULT 'fr',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  city_id UUID REFERENCES public.cities(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create client_logos table
CREATE TABLE public.client_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_de TEXT,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  description_en TEXT,
  description_de TEXT,
  category TEXT DEFAULT 'partner',
  language TEXT NOT NULL DEFAULT 'fr',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  city_id UUID REFERENCES public.cities(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create storage bucket for testimonial avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonial-avatars', 
  'testimonial-avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for client logos (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-logos', 
  'client-logos', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS policies for testimonials
CREATE POLICY "Testimonials are viewable by everyone" 
ON public.testimonials 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only super admins can manage testimonials" 
ON public.testimonials 
FOR ALL 
USING (get_current_user_role() = 'super_admin')
WITH CHECK (get_current_user_role() = 'super_admin');

-- Enable RLS on client_logos
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_logos
CREATE POLICY "Client logos are viewable by everyone" 
ON public.client_logos 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only super admins can manage client logos" 
ON public.client_logos 
FOR ALL 
USING (get_current_user_role() = 'super_admin')
WITH CHECK (get_current_user_role() = 'super_admin');

-- Storage policies for testimonial avatars
CREATE POLICY "Testimonial avatars are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'testimonial-avatars');

CREATE POLICY "Super admins can manage testimonial avatars" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'testimonial-avatars' 
  AND get_current_user_role() = 'super_admin'
);

-- Storage policies for client logos
CREATE POLICY "Client logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'client-logos');

CREATE POLICY "Super admins can manage client logos" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'client-logos' 
  AND get_current_user_role() = 'super_admin'
);

-- Add triggers for updated_at
CREATE TRIGGER update_testimonials_updated_at 
  BEFORE UPDATE ON public.testimonials 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_client_logos_updated_at 
  BEFORE UPDATE ON public.client_logos 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Insert some sample translations for the Social Proof section
INSERT INTO public.ui_translations (key, language, value, category) VALUES
('social_proof.title', 'fr', 'Ils nous font confiance', 'social_proof'),
('social_proof.title', 'en', 'They trust us', 'social_proof'),
('social_proof.title', 'de', 'Sie vertrauen uns', 'social_proof'),
('social_proof.testimonials_subtitle', 'fr', 'Découvrez ce que nos utilisateurs pensent de CIARA', 'social_proof'),
('social_proof.testimonials_subtitle', 'en', 'Discover what our users think about CIARA', 'social_proof'),
('social_proof.testimonials_subtitle', 'de', 'Entdecken Sie, was unsere Benutzer über CIARA denken', 'social_proof'),
('social_proof.partners_subtitle', 'fr', 'Nos partenaires et clients', 'social_proof'),
('social_proof.partners_subtitle', 'en', 'Our partners and clients', 'social_proof'),
('social_proof.partners_subtitle', 'de', 'Unsere Partner und Kunden', 'social_proof'),
('social_proof.admin.testimonials', 'fr', 'Témoignages', 'admin'),
('social_proof.admin.testimonials', 'en', 'Testimonials', 'admin'),
('social_proof.admin.testimonials', 'de', 'Testimonials', 'admin'),
('social_proof.admin.client_logos', 'fr', 'Logos clients', 'admin'),
('social_proof.admin.client_logos', 'en', 'Client logos', 'admin'),
('social_proof.admin.client_logos', 'de', 'Kundenlogos', 'admin'),
('social_proof.admin.add_testimonial', 'fr', 'Ajouter un témoignage', 'admin'),
('social_proof.admin.add_testimonial', 'en', 'Add testimonial', 'admin'),
('social_proof.admin.add_testimonial', 'de', 'Testimonial hinzufügen', 'admin'),
('social_proof.admin.add_client_logo', 'fr', 'Ajouter un logo client', 'admin'),
('social_proof.admin.add_client_logo', 'en', 'Add client logo', 'admin'),
('social_proof.admin.add_client_logo', 'de', 'Kundenlogo hinzufügen', 'admin')
ON CONFLICT (key, language) DO NOTHING;
