-- Créer la table pour stocker les documents de contenu
CREATE TABLE public.content_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
  step_id UUID REFERENCES steps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL DEFAULT 'guide',
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_content_documents_city_id ON public.content_documents(city_id);
CREATE INDEX idx_content_documents_journey_id ON public.content_documents(journey_id);
CREATE INDEX idx_content_documents_step_id ON public.content_documents(step_id);
CREATE INDEX idx_content_documents_type ON public.content_documents(document_type);

-- Trigger pour updated_at
CREATE TRIGGER update_content_documents_updated_at
  BEFORE UPDATE ON public.content_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Politiques RLS
ALTER TABLE public.content_documents ENABLE ROW LEVEL SECURITY;

-- Les documents actifs sont visibles par tous les utilisateurs authentifiés
CREATE POLICY "Active documents are viewable by authenticated users"
  ON public.content_documents
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Les super admins peuvent tout gérer
CREATE POLICY "Super admins can manage all documents"
  ON public.content_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Les tenant admins peuvent gérer les documents de leur ville
CREATE POLICY "Tenant admins can manage city documents"
  ON public.content_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'tenant_admin'
      AND profiles.city_id = content_documents.city_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'tenant_admin'
      AND profiles.city_id = content_documents.city_id
    )
  );

-- Créer le bucket de stockage pour les documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Politiques pour le bucket documents
CREATE POLICY "Authenticated users can view documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Admins can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('super_admin', 'tenant_admin')
    )
  );

CREATE POLICY "Admins can update documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('super_admin', 'tenant_admin')
    )
  );

CREATE POLICY "Admins can delete documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('super_admin', 'tenant_admin')
    )
  );