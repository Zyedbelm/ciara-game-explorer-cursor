-- Ajouter les traductions pour "Itinéraires générés par IA"
INSERT INTO ui_translations (key, language, value) VALUES
('ai_generated_routes', 'fr', 'Itinéraires générés par IA'),
('ai_generated_routes', 'en', 'AI Generated Routes'),
('ai_generated_routes', 'de', 'KI-generierte Routen')

ON CONFLICT (key, language) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();