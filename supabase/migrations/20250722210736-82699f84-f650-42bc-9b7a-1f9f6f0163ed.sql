
-- Ajouter les traductions manquantes pour la gestion des parcours
INSERT INTO ui_translations (key, language, value) VALUES
-- Traductions pour "Commencer" (action pour parcours sauvegardés)
('start_journey', 'fr', 'Commencer'),
('start_journey', 'en', 'Start'),
('start_journey', 'de', 'Starten'),

-- Traductions pour "Continuer" (action pour parcours en cours)
('continue_journey', 'fr', 'Continuer'),
('continue_journey', 'en', 'Continue'),
('continue_journey', 'de', 'Fortsetzen'),

-- Traductions pour "Reprendre" (action pour parcours sauvegardés repris)
('resume_journey', 'fr', 'Reprendre'),
('resume_journey', 'en', 'Resume'),
('resume_journey', 'de', 'Fortsetzen'),

-- Traductions pour "Refaire" (action pour parcours terminés)
('replay_journey', 'fr', 'Refaire'),
('replay_journey', 'en', 'Replay'),
('replay_journey', 'de', 'Wiederholen'),

-- Traductions pour "Abandonner"
('abandon_journey', 'fr', 'Abandonner'),
('abandon_journey', 'en', 'Abandon'),
('abandon_journey', 'de', 'Aufgeben'),

-- Messages de confirmation pour abandon
('abandon_journey_confirm_title', 'fr', 'Abandonner le parcours ?'),
('abandon_journey_confirm_title', 'en', 'Abandon journey?'),
('abandon_journey_confirm_title', 'de', 'Reise aufgeben?'),

('abandon_journey_confirm_desc', 'fr', 'Êtes-vous sûr de vouloir abandonner ce parcours ? Votre progression sera conservée mais le parcours ne sera plus dans vos actifs.'),
('abandon_journey_confirm_desc', 'en', 'Are you sure you want to abandon this journey? Your progress will be saved but the journey will no longer be in your active list.'),
('abandon_journey_confirm_desc', 'de', 'Sind Sie sicher, dass Sie diese Reise aufgeben möchten? Ihr Fortschritt wird gespeichert, aber die Reise wird nicht mehr in Ihrer aktiven Liste stehen.'),

-- Messages de succès pour abandon
('journey_abandoned_success', 'fr', 'Parcours abandonné'),
('journey_abandoned_success', 'en', 'Journey abandoned'),
('journey_abandoned_success', 'de', 'Reise aufgegeben'),

('journey_abandoned_desc', 'fr', 'a été retiré de vos parcours en cours.'),
('journey_abandoned_desc', 'en', 'has been removed from your active journeys.'),
('journey_abandoned_desc', 'de', 'wurde aus Ihren aktiven Reisen entfernt.'),

-- Messages d'erreur pour abandon
('abandon_journey_error', 'fr', 'Impossible d\'abandonner le parcours. Réessayez plus tard.'),
('abandon_journey_error', 'en', 'Unable to abandon journey. Please try again later.'),
('abandon_journey_error', 'de', 'Die Reise kann nicht aufgegeben werden. Bitte versuchen Sie es später erneut.'),

-- Traductions pour messages informatifs
('no_saved_journeys', 'fr', 'Aucun parcours sauvegardé'),
('no_saved_journeys', 'en', 'No saved journeys'),
('no_saved_journeys', 'de', 'Keine gespeicherten Reisen'),

('create_first_ai_journey', 'fr', 'Créez votre premier parcours avec l\'IA pour commencer votre aventure !'),
('create_first_ai_journey', 'en', 'Create your first AI journey to start your adventure!'),
('create_first_ai_journey', 'de', 'Erstellen Sie Ihre erste KI-Reise, um Ihr Abenteuer zu beginnen!'),

('discover_destinations', 'fr', 'Découvrir les destinations'),
('discover_destinations', 'en', 'Discover destinations'),
('discover_destinations', 'de', 'Ziele entdecken')

ON CONFLICT (key, language) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();
