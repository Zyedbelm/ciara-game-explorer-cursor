-- Ajouter les traductions pour la nouvelle feature "Smart Analytics"
INSERT INTO ui_translations (key, language, value) VALUES
-- Traductions pour "Analyses Intelligentes"
('smart_analytics', 'fr', 'Analyses Intelligentes'),
('smart_analytics', 'en', 'Smart Analytics'),
('smart_analytics', 'de', 'Intelligente Analysen'),

-- Traductions pour "Suivez vos progrès et obtenez des insights personnalisés"
('track_progress_insights', 'fr', 'Suivez vos progrès et obtenez des insights personnalisés'),
('track_progress_insights', 'en', 'Track your progress and get personalized insights'),
('track_progress_insights', 'de', 'Verfolgen Sie Ihren Fortschritt und erhalten Sie personalisierte Einblicke')

ON CONFLICT (key, language) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();