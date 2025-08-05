-- Créer un bucket pour les images d'articles
INSERT INTO storage.buckets (id, name, public) VALUES ('articles', 'articles', true);

-- Créer des politiques de sécurité pour le bucket articles
CREATE POLICY "Allow authenticated users to upload article images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'articles' 
  AND auth.role() = 'authenticated'
  AND (
    get_current_user_role() = ANY(ARRAY['super_admin', 'tenant_admin', 'content_manager'])
  )
);

CREATE POLICY "Allow authenticated users to view article images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'articles');

CREATE POLICY "Allow content managers to update their article images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'articles' 
  AND auth.role() = 'authenticated'
  AND (
    get_current_user_role() = ANY(ARRAY['super_admin', 'tenant_admin', 'content_manager'])
  )
);

CREATE POLICY "Allow content managers to delete their article images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'articles' 
  AND auth.role() = 'authenticated'
  AND (
    get_current_user_role() = ANY(ARRAY['super_admin', 'tenant_admin', 'content_manager'])
  )
);