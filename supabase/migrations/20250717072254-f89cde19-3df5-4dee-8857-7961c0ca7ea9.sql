-- Create documents table for file uploads (separate from content_documents which is for text content)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT DEFAULT 'guide',
  file_name TEXT,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  city_id UUID,
  step_id UUID,
  journey_id UUID,
  is_active BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'fr',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Add missing is_active column to steps table
ALTER TABLE public.steps 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to content_documents if needed for compatibility
ALTER TABLE public.content_documents 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS journey_id UUID,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents table
CREATE POLICY "Documents are viewable by everyone" 
ON public.documents 
FOR SELECT 
USING (true);

CREATE POLICY "Only content managers can modify documents" 
ON public.documents 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text]));

-- Create trigger for updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();