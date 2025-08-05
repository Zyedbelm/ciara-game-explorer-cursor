-- Add missing translations for MyJourneysPage

-- French translations
INSERT INTO ui_translations (key, language, value) VALUES
('no_saved_journeys', 'fr', 'Aucun parcours sauvegardé'),
('create_first_ai_journey', 'fr', 'Créez votre premier parcours personnalisé avec notre générateur IA !'),
('discover_destinations', 'fr', 'Découvrir les destinations')
ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();

-- English translations
INSERT INTO ui_translations (key, language, value) VALUES
('no_saved_journeys', 'en', 'No saved journeys'),
('create_first_ai_journey', 'en', 'Create your first personalized journey with our AI generator!'),
('discover_destinations', 'en', 'Discover destinations')
ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();

-- German translations
INSERT INTO ui_translations (key, language, value) VALUES
('no_saved_journeys', 'de', 'Keine gespeicherten Reisen'),
('create_first_ai_journey', 'de', 'Erstellen Sie Ihre erste personalisierte Reise mit unserem KI-Generator!'),
('discover_destinations', 'de', 'Reiseziele entdecken')
ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();