-- Phase 1: Clean up existing articles data
-- Fix published articles that have published_at = null
UPDATE articles 
SET published_at = COALESCE(published_at, created_at)
WHERE status = 'published' AND published_at IS NULL;

-- Standardize categories (remove inconsistencies)
UPDATE articles SET category = 'randonnee' WHERE category = 'randonnée';
UPDATE articles SET category = 'general' WHERE category = 'général';
UPDATE articles SET category = 'decouverte' WHERE category = 'découverte';

-- Add a validation trigger to ensure published articles have published_at
CREATE OR REPLACE FUNCTION validate_article_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If article is being set to published, ensure published_at is set
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  
  -- If article is being set to draft or archived, clear published_at
  IF NEW.status IN ('draft', 'archived') THEN
    NEW.published_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_article_published_at_trigger ON articles;
CREATE TRIGGER validate_article_published_at_trigger
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION validate_article_published_at();