-- Ajouter les traductions manquantes pour le bouton Abandonner
INSERT INTO ui_translations (key, language, value) VALUES
-- Traductions pour "Abandonner"
('abandon_journey', 'fr', 'Abandonner'),
('abandon_journey', 'en', 'Abandon'),
('abandon_journey', 'de', 'Aufgeben'),

-- Traductions pour titre de confirmation
('abandon_journey_confirm_title', 'fr', 'Abandonner le parcours ?'),
('abandon_journey_confirm_title', 'en', 'Abandon journey?'),
('abandon_journey_confirm_title', 'de', 'Reise aufgeben?'),

-- Traductions pour description de confirmation
('abandon_journey_confirm_desc', 'fr', 'Êtes-vous sûr de vouloir abandonner ce parcours ? Votre progression sera conservée mais le parcours ne sera plus dans vos actifs.'),
('abandon_journey_confirm_desc', 'en', 'Are you sure you want to abandon this journey? Your progress will be saved but the journey will no longer be in your active list.'),
('abandon_journey_confirm_desc', 'de', 'Sind Sie sicher, dass Sie diese Reise aufgeben möchten? Ihr Fortschritt wird gespeichert, aber die Reise wird nicht mehr in Ihrer aktiven Liste stehen.'),

-- Traductions pour messages de succès
('journey_abandoned_success', 'fr', 'Parcours abandonné'),
('journey_abandoned_success', 'en', 'Journey abandoned'),
('journey_abandoned_success', 'de', 'Reise aufgegeben'),

('journey_abandoned_desc', 'fr', 'a été retiré de vos parcours en cours.'),
('journey_abandoned_desc', 'en', 'has been removed from your active journeys.'),
('journey_abandoned_desc', 'de', 'wurde aus Ihren aktiven Reisen entfernt.'),

-- Traductions pour message d''erreur
('abandon_journey_error', 'fr', 'Impossible d''abandonner le parcours. Réessayez plus tard.'),
('abandon_journey_error', 'en', 'Unable to abandon journey. Please try again later.'),
('abandon_journey_error', 'de', 'Die Reise kann nicht aufgegeben werden. Bitte versuchen Sie es später erneut.')

ON CONFLICT (key, language) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();