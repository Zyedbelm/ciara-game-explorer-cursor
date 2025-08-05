-- Add ai_content column to content_documents table
ALTER TABLE public.content_documents 
ADD COLUMN ai_content text;

-- Add comment to explain the column purpose
COMMENT ON COLUMN public.content_documents.ai_content IS 'AI-generated content for the document, separate from manual content';