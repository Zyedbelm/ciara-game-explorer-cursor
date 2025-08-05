-- Réinsérer les traductions manquantes pour les boutons de parcours
INSERT INTO ui_translations (key, language, value) VALUES
-- Traductions pour "Commencer"
('start_journey', 'fr', 'Commencer'),
('start_journey', 'en', 'Start'),
('start_journey', 'de', 'Starten'),

-- Traductions pour "Continuer"
('continue_journey', 'fr', 'Continuer'),
('continue_journey', 'en', 'Continue'),
('continue_journey', 'de', 'Fortsetzen'),

-- Traductions pour "Reprendre"
('resume_journey', 'fr', 'Reprendre'),
('resume_journey', 'en', 'Resume'),
('resume_journey', 'de', 'Fortsetzen'),

-- Traductions pour "Refaire"
('replay_journey', 'fr', 'Refaire'),
('replay_journey', 'en', 'Replay'),
('replay_journey', 'de', 'Wiederholen')

ON CONFLICT (key, language) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();