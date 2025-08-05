-- Ajouter les traductions manquantes pour les messages d'erreur et de validation
INSERT INTO ui_translations (key, language, value) VALUES
-- Traductions pour messages d'erreur d'authentification
('toast.error.authentication_required', 'fr', 'Connexion requise pour continuer'),
('toast.error.authentication_required', 'en', 'Authentication required to continue'),
('toast.error.authentication_required', 'de', 'Anmeldung erforderlich, um fortzufahren'),

-- Traductions pour erreur de ville invalide
('toast.error.invalid_city', 'fr', 'Impossible de déterminer la destination'),
('toast.error.invalid_city', 'en', 'Unable to determine destination'),
('toast.error.invalid_city', 'de', 'Ziel kann nicht bestimmt werden'),

-- Traductions pour erreur de démarrage de parcours
('toast.error.journey_start_failed', 'fr', 'Impossible de démarrer le parcours'),
('toast.error.journey_start_failed', 'en', 'Unable to start journey'),
('toast.error.journey_start_failed', 'de', 'Reise kann nicht gestartet werden'),

-- Traductions pour "Annuler"
('common.cancel', 'fr', 'Annuler'),
('common.cancel', 'en', 'Cancel'),
('common.cancel', 'de', 'Abbrechen')

ON CONFLICT (key, language) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();