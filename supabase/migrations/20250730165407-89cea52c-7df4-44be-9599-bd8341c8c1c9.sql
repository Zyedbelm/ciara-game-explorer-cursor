-- Fonction utilitaire pour convertir le markdown basique en HTML
CREATE OR REPLACE FUNCTION markdown_to_html(markdown_content TEXT)
RETURNS TEXT AS $$
DECLARE
  html_content TEXT;
BEGIN
  html_content := markdown_content;
  
  -- Convertir les titres
  html_content := regexp_replace(html_content, '### (.*?)(\n|$)', '<h3>\1</h3>' || E'\n', 'g');
  html_content := regexp_replace(html_content, '## (.*?)(\n|$)', '<h2>\1</h2>' || E'\n', 'g');
  html_content := regexp_replace(html_content, '# (.*?)(\n|$)', '<h1>\1</h1>' || E'\n', 'g');
  
  -- Convertir le gras et l'italique
  html_content := regexp_replace(html_content, '\*\*(.*?)\*\*', '<strong>\1</strong>', 'g');
  html_content := regexp_replace(html_content, '\*(.*?)\*', '<em>\1</em>', 'g');
  
  -- Convertir les liens
  html_content := regexp_replace(html_content, '\[(.*?)\]\((.*?)\)', '<a href="\2">\1</a>', 'g');
  
  -- Convertir les citations
  html_content := regexp_replace(html_content, '^> (.*?)$', '<blockquote>\1</blockquote>', 'gm');
  
  -- Convertir les paragraphes (remplacer double saut de ligne par paragraphes)
  html_content := regexp_replace(html_content, '([^>])(\n\n+)([^<])', '\1</p>' || E'\n' || '<p>\3', 'g');
  
  -- Ajouter les balises p au début et à la fin si nécessaire
  IF NOT html_content ~ '^<[hp]' THEN
    html_content := '<p>' || html_content;
  END IF;
  
  IF NOT html_content ~ '[>]$' THEN
    html_content := html_content || '</p>';
  END IF;
  
  -- Nettoyer les paragraphes vides
  html_content := regexp_replace(html_content, '<p>\s*</p>', '', 'g');
  
  RETURN html_content;
END;
$$ LANGUAGE plpgsql;

-- Convertir tout le contenu existant de markdown vers HTML
UPDATE articles 
SET 
  content = markdown_to_html(content),
  content_en = CASE WHEN content_en IS NOT NULL THEN markdown_to_html(content_en) ELSE NULL END,
  content_de = CASE WHEN content_de IS NOT NULL THEN markdown_to_html(content_de) ELSE NULL END,
  updated_at = now()
WHERE content IS NOT NULL;

-- Supprimer la fonction utilitaire après utilisation
DROP FUNCTION markdown_to_html(TEXT);