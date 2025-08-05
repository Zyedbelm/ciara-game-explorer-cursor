-- Mettre à jour les traductions avec des versions plus courtes
UPDATE ui_translations 
SET value = CASE 
  WHEN language = 'fr' THEN 'IA Générés'
  WHEN language = 'en' THEN 'AI Generated'
  WHEN language = 'de' THEN 'KI-Routen'
END,
updated_at = now()
WHERE key = 'ai_generated_routes';