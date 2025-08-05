-- Add missing translations for AuthRequiredModal and JourneyGeneratorModal

-- French translations
INSERT INTO ui_translations (key, language, value) VALUES
('auth_required', 'fr', 'Connexion requise'),
('login_required_message', 'fr', 'Vous devez être connecté pour utiliser {feature}.'),
('create_account_message', 'fr', 'Créez un compte gratuit ou connectez-vous pour accéder à toutes les fonctionnalités de CIARA.'),
('cancel', 'fr', 'Annuler'),
('login', 'fr', 'Se connecter'),
('ai_journey_generator', 'fr', 'Générateur de Parcours IA'),
('create_ai_journey', 'fr', 'Créer un parcours IA'),
('generating', 'fr', 'Génération en cours...'),
('generate_my_journey', 'fr', 'Générer mon parcours'),
('after_saving', 'fr', 'Après sauvegarde'),
('journey_will_be_accessible', 'fr', 'Votre parcours sera accessible dans "Mes parcours" où vous pourrez le retrouver, le démarrer et suivre votre progression.'),
('generate_another', 'fr', 'Générer un autre'),
('save_journey', 'fr', 'Enregistrer le parcours'),
('ai_journey_generator_feature', 'fr', 'le générateur de parcours IA')
ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();

-- English translations
INSERT INTO ui_translations (key, language, value) VALUES
('auth_required', 'en', 'Login Required'),
('login_required_message', 'en', 'You must be logged in to use {feature}.'),
('create_account_message', 'en', 'Create a free account or log in to access all CIARA features.'),
('cancel', 'en', 'Cancel'),
('login', 'en', 'Log in'),
('ai_journey_generator', 'en', 'AI Journey Generator'),
('create_ai_journey', 'en', 'Create AI Journey'),
('generating', 'en', 'Generating...'),
('generate_my_journey', 'en', 'Generate My Journey'),
('after_saving', 'en', 'After Saving'),
('journey_will_be_accessible', 'en', 'Your journey will be accessible in "My Journeys" where you can find it, start it and track your progress.'),
('generate_another', 'en', 'Generate Another'),
('save_journey', 'en', 'Save Journey'),
('ai_journey_generator_feature', 'en', 'the AI journey generator')
ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();

-- German translations
INSERT INTO ui_translations (key, language, value) VALUES
('auth_required', 'de', 'Anmeldung erforderlich'),
('login_required_message', 'de', 'Sie müssen angemeldet sein, um {feature} zu nutzen.'),
('create_account_message', 'de', 'Erstellen Sie ein kostenloses Konto oder melden Sie sich an, um auf alle CIARA-Funktionen zuzugreifen.'),
('cancel', 'de', 'Abbrechen'),
('login', 'de', 'Anmelden'),
('ai_journey_generator', 'de', 'KI-Reisegenerator'),
('create_ai_journey', 'de', 'KI-Reise erstellen'),
('generating', 'de', 'Generiere...'),
('generate_my_journey', 'de', 'Meine Reise generieren'),
('after_saving', 'de', 'Nach dem Speichern'),
('journey_will_be_accessible', 'de', 'Ihre Reise wird in "Meine Reisen" zugänglich sein, wo Sie sie finden, starten und Ihren Fortschritt verfolgen können.'),
('generate_another', 'de', 'Weitere generieren'),
('save_journey', 'de', 'Reise speichern'),
('ai_journey_generator_feature', 'de', 'den KI-Reisegenerator')
ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();