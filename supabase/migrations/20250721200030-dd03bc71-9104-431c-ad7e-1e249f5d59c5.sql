-- Add missing translations for UserStatsCard and CategoryFilter components

-- French translations
INSERT INTO ui_translations (key, language, value) VALUES
('your_progress', 'fr', 'Votre progression'),
('login_to_see_progress', 'fr', 'Connectez-vous pour voir votre progression'),
('explorer', 'fr', 'Explorateur'),
('level', 'fr', 'Niveau'),
('level_progression', 'fr', 'Progression du niveau'),
('journey_types', 'fr', 'Types de parcours'),
('all', 'fr', 'Tous'),
('journeys', 'fr', 'parcours')
ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();

-- English translations
INSERT INTO ui_translations (key, language, value) VALUES
('your_progress', 'en', 'Your Progress'),
('login_to_see_progress', 'en', 'Log in to see your progress'),
('explorer', 'en', 'Explorer'),
('level', 'en', 'Level'),
('level_progression', 'en', 'Level progression'),
('journey_types', 'en', 'Journey Types'),
('all', 'en', 'All'),
('journeys', 'en', 'journeys')
ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();

-- German translations
INSERT INTO ui_translations (key, language, value) VALUES
('your_progress', 'de', 'Ihr Fortschritt'),
('login_to_see_progress', 'de', 'Melden Sie sich an, um Ihren Fortschritt zu sehen'),
('explorer', 'de', 'Entdecker'),
('level', 'de', 'Stufe'),
('level_progression', 'de', 'Stufenfortschritt'),
('journey_types', 'de', 'Reisearten'),
('all', 'de', 'Alle'),
('journeys', 'de', 'Reisen')
ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();