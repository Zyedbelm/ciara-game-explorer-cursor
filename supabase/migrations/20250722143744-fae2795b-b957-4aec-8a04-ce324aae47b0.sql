
-- Add missing translations for journey detail components
INSERT INTO ui_translations (key, language, value) VALUES
-- JourneyHeader translations
('journey.progression', 'fr', 'Progression'),
('journey.progression', 'en', 'Progress'),
('journey.progression', 'de', 'Fortschritt'),
('journey.steps', 'fr', 'étapes'),
('journey.steps', 'en', 'steps'),
('journey.steps', 'de', 'Schritte'),

-- CurrentStepCard translations
('journey.step.arrived', 'fr', 'Je suis arrivé !'),
('journey.step.arrived', 'en', 'I arrived!'),
('journey.step.arrived', 'de', 'Ich bin angekommen!'),
('journey.step.activate_location', 'fr', 'Activer la géolocalisation'),
('journey.step.activate_location', 'en', 'Enable geolocation'),
('journey.step.activate_location', 'de', 'Geolokalisierung aktivieren'),
('journey.step.validating', 'fr', 'Validation...'),
('journey.step.validating', 'en', 'Validating...'),
('journey.step.validating', 'de', 'Validierung...'),
('journey.step.complete_route', 'fr', 'Itinéraire complet'),
('journey.step.complete_route', 'en', 'Complete route'),
('journey.step.complete_route', 'de', 'Vollständige Route'),
('journey.step.your_path_to_first', 'fr', 'Votre trajet vers la 1ère étape'),
('journey.step.your_path_to_first', 'en', 'Your path to the first step'),
('journey.step.your_path_to_first', 'de', 'Ihr Weg zur ersten Etappe'),
('journey.step.planned_route', 'fr', 'Itinéraire prévu du parcours'),
('journey.step.planned_route', 'en', 'Planned journey route'),
('journey.step.planned_route', 'de', 'Geplante Reiseroute'),
('journey.step.distance', 'fr', 'Distance'),
('journey.step.distance', 'en', 'Distance'),
('journey.step.distance', 'de', 'Entfernung'),

-- PointsSummary translations
('journey.points.total_earned', 'fr', 'Points gagnés'),
('journey.points.total_earned', 'en', 'Points earned'),
('journey.points.total_earned', 'de', 'Verdiente Punkte'),
('journey.points.congratulations', 'fr', 'Félicitations !'),
('journey.points.congratulations', 'en', 'Congratulations!'),
('journey.points.congratulations', 'de', 'Herzlichen Glückwunsch!'),
('journey.points.journey_completed', 'fr', 'Parcours terminé avec succès'),
('journey.points.journey_completed', 'en', 'Journey completed successfully'),
('journey.points.journey_completed', 'de', 'Reise erfolgreich abgeschlossen'),
('journey.points.return_destination', 'fr', 'Retour à la destination'),
('journey.points.return_destination', 'en', 'Return to destination'),
('journey.points.return_destination', 'de', 'Zurück zum Ziel'),

-- StepsList translations
('journey.steps_list.title', 'fr', 'Étapes du parcours'),
('journey.steps_list.title', 'en', 'Journey steps'),
('journey.steps_list.title', 'de', 'Reiseschritte'),
('journey.steps.completed', 'fr', 'Terminé'),
('journey.steps.completed', 'en', 'Completed'),
('journey.steps.completed', 'de', 'Abgeschlossen'),
('journey.steps.current', 'fr', 'Actuel'),
('journey.steps.current', 'en', 'Current'),
('journey.steps.current', 'de', 'Aktuell'),
('journey.steps.upcoming', 'fr', 'À venir'),
('journey.steps.upcoming', 'en', 'Upcoming'),
('journey.steps.upcoming', 'de', 'Bevorstehend'),

-- Journey detail page translations
('journey.detail.loading', 'fr', 'Chargement du parcours...'),
('journey.detail.loading', 'en', 'Loading journey...'),
('journey.detail.loading', 'de', 'Reise wird geladen...'),
('journey.detail.not_found', 'fr', 'Parcours non trouvé'),
('journey.detail.not_found', 'en', 'Journey not found'),
('journey.detail.not_found', 'de', 'Reise nicht gefunden')
ON CONFLICT (key, language) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = now();
