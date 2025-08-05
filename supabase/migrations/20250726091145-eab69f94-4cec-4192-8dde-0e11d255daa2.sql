-- Créer un bucket pour les images d'articles de blog
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Politique pour permettre la lecture publique des images de blog
CREATE POLICY "Blog images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

-- Politique pour permettre aux admins d'uploader des images de blog
CREATE POLICY "Admins can upload blog images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'blog-images' AND 
  get_current_user_role() = ANY(ARRAY['super_admin', 'tenant_admin'])
);

-- Politique pour permettre aux admins de modifier/supprimer des images de blog
CREATE POLICY "Admins can update blog images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'blog-images' AND 
  get_current_user_role() = ANY(ARRAY['super_admin', 'tenant_admin'])
);

CREATE POLICY "Admins can delete blog images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'blog-images' AND 
  get_current_user_role() = ANY(ARRAY['super_admin', 'tenant_admin'])
);