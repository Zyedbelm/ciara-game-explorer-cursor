-- Add missing profile and password translations to ui_translations table

-- Profile translations
INSERT INTO ui_translations (key, language, value) VALUES
-- Basic profile keys
('profile.profile_updated', 'fr', 'Profil mis à jour avec succès'),
('profile.profile_updated', 'en', 'Profile updated successfully'),
('profile.profile_updated', 'de', 'Profil erfolgreich aktualisiert'),

('profile.update_error', 'fr', 'Erreur lors de la mise à jour'),
('profile.update_error', 'en', 'Update error'),
('profile.update_error', 'de', 'Aktualisierungsfehler'),

('profile.profile_photo', 'fr', 'Photo de profil'),
('profile.profile_photo', 'en', 'Profile photo'),
('profile.profile_photo', 'de', 'Profilbild'),

('profile.progression', 'fr', 'Progression'),
('profile.progression', 'en', 'Progression'),
('profile.progression', 'de', 'Fortschritt'),

('profile.completed_journeys', 'fr', 'Parcours terminés'),
('profile.completed_journeys', 'en', 'Completed journeys'),
('profile.completed_journeys', 'de', 'Abgeschlossene Reisen'),

('profile.visited_steps', 'fr', 'Étapes visitées'),
('profile.visited_steps', 'en', 'Visited steps'),
('profile.visited_steps', 'de', 'Besuchte Schritte'),

('profile.badges_earned', 'fr', 'Badges gagnés'),
('profile.badges_earned', 'en', 'Badges earned'),
('profile.badges_earned', 'de', 'Errungene Abzeichen'),

('profile.personal_info', 'fr', 'Informations personnelles'),
('profile.personal_info', 'en', 'Personal information'),
('profile.personal_info', 'de', 'Persönliche Informationen'),

('profile.full_name', 'fr', 'Nom complet'),
('profile.full_name', 'en', 'Full name'),
('profile.full_name', 'de', 'Vollständiger Name'),

('profile.confirm_email', 'fr', 'Confirmer'),
('profile.confirm_email', 'en', 'Confirm'),
('profile.confirm_email', 'de', 'Bestätigen'),

('profile.cancel', 'fr', 'Annuler'),
('profile.cancel', 'en', 'Cancel'),
('profile.cancel', 'de', 'Abbrechen'),

('profile.change_password', 'fr', 'Changer le mot de passe'),
('profile.change_password', 'en', 'Change password'),
('profile.change_password', 'de', 'Passwort ändern'),

('profile.hide_password_change', 'fr', 'Masquer le changement de mot de passe'),
('profile.hide_password_change', 'en', 'Hide password change'),
('profile.hide_password_change', 'de', 'Passwort-Änderung ausblenden'),

('profile.preferences', 'fr', 'Préférences'),
('profile.preferences', 'en', 'Preferences'),
('profile.preferences', 'de', 'Einstellungen'),

('profile.fitness_level', 'fr', 'Niveau de forme physique'),
('profile.fitness_level', 'en', 'Fitness level'),
('profile.fitness_level', 'de', 'Fitness-Level'),

('profile.fitness_scale', 'fr', 'Échelle de 1 (débutant) à 5 (expert)'),
('profile.fitness_scale', 'en', 'Scale from 1 (beginner) to 5 (expert)'),
('profile.fitness_scale', 'de', 'Skala von 1 (Anfänger) bis 5 (Experte)'),

('profile.preferred_languages', 'fr', 'Langues préférées'),
('profile.preferred_languages', 'en', 'Preferred languages'),
('profile.preferred_languages', 'de', 'Bevorzugte Sprachen'),

('profile.select_language', 'fr', 'Sélectionner une langue'),
('profile.select_language', 'en', 'Select a language'),
('profile.select_language', 'de', 'Sprache auswählen'),

('profile.interests', 'fr', 'Centres d''intérêt'),
('profile.interests', 'en', 'Interests'),
('profile.interests', 'de', 'Interessen'),

('profile.saving', 'fr', 'Enregistrement...'),
('profile.saving', 'en', 'Saving...'),
('profile.saving', 'de', 'Speichern...'),

('profile.save_changes', 'fr', 'Enregistrer les modifications'),
('profile.save_changes', 'en', 'Save changes'),
('profile.save_changes', 'de', 'Änderungen speichern'),

-- Badge translations
('profile.badges.title', 'fr', 'Badges'),
('profile.badges.title', 'en', 'Badges'),
('profile.badges.title', 'de', 'Abzeichen'),

('profile.badges.next_badge', 'fr', 'Prochain badge à %{points} points'),
('profile.badges.next_badge', 'en', 'Next badge at %{points} points'),
('profile.badges.next_badge', 'de', 'Nächstes Abzeichen bei %{points} Punkten'),

('profile.badges.points', 'fr', 'points'),
('profile.badges.points', 'en', 'points'),
('profile.badges.points', 'de', 'Punkte'),

('profile.badges.all_earned', 'fr', 'Tous les badges gagnés !'),
('profile.badges.all_earned', 'en', 'All badges earned!'),
('profile.badges.all_earned', 'de', 'Alle Abzeichen erhalten!'),

('profile.badges.explorer', 'fr', 'Explorateur'),
('profile.badges.explorer', 'en', 'Explorer'),
('profile.badges.explorer', 'de', 'Entdecker'),

('profile.badges.explorer_desc', 'fr', 'Premiers pas dans l''exploration'),
('profile.badges.explorer_desc', 'en', 'First steps in exploration'),
('profile.badges.explorer_desc', 'de', 'Erste Schritte in der Erkundung'),

('profile.badges.adventurer', 'fr', 'Aventurier'),
('profile.badges.adventurer', 'en', 'Adventurer'),
('profile.badges.adventurer', 'de', 'Abenteurer'),

('profile.badges.adventurer_desc', 'fr', 'Exploration confirmée'),
('profile.badges.adventurer_desc', 'en', 'Confirmed exploration'),
('profile.badges.adventurer_desc', 'de', 'Bestätigte Erkundung'),

('profile.badges.expert', 'fr', 'Expert Local'),
('profile.badges.expert', 'en', 'Local Expert'),
('profile.badges.expert', 'de', 'Lokaler Experte'),

('profile.badges.expert_desc', 'fr', 'Connaissance approfondie'),
('profile.badges.expert_desc', 'en', 'Deep knowledge'),
('profile.badges.expert_desc', 'de', 'Tiefes Wissen'),

('profile.badges.ambassador', 'fr', 'Ambassadeur'),
('profile.badges.ambassador', 'en', 'Ambassador'),
('profile.badges.ambassador', 'de', 'Botschafter'),

('profile.badges.ambassador_desc', 'fr', 'Maître de l''exploration'),
('profile.badges.ambassador_desc', 'en', 'Master of exploration'),
('profile.badges.ambassador_desc', 'de', 'Meister der Erkundung'),

-- Monthly stats
('profile.monthly_stats.title', 'fr', 'Statistiques du mois'),
('profile.monthly_stats.title', 'en', 'Monthly statistics'),
('profile.monthly_stats.title', 'de', 'Monatsstatistiken'),

('profile.monthly_stats.distance_traveled', 'fr', 'Distance parcourue'),
('profile.monthly_stats.distance_traveled', 'en', 'Distance traveled'),
('profile.monthly_stats.distance_traveled', 'de', 'Zurückgelegte Entfernung'),

('profile.monthly_stats.exploration_time', 'fr', 'Temps d''exploration'),
('profile.monthly_stats.exploration_time', 'en', 'Exploration time'),
('profile.monthly_stats.exploration_time', 'de', 'Erkundungszeit'),

('profile.monthly_stats.points_gained', 'fr', 'Points gagnés'),
('profile.monthly_stats.points_gained', 'en', 'Points gained'),
('profile.monthly_stats.points_gained', 'de', 'Punkte erhalten'),

('profile.monthly_stats.steps_completed', 'fr', 'Étapes terminées'),
('profile.monthly_stats.steps_completed', 'en', 'Steps completed'),
('profile.monthly_stats.steps_completed', 'de', 'Schritte abgeschlossen'),

('profile.activity_history', 'fr', 'Historique d''activité'),
('profile.activity_history', 'en', 'Activity history'),
('profile.activity_history', 'de', 'Aktivitätsverlauf'),

-- Password translations
('password.passwords_not_match', 'fr', 'Les mots de passe ne correspondent pas'),
('password.passwords_not_match', 'en', 'Passwords do not match'),
('password.passwords_not_match', 'de', 'Passwörter stimmen nicht überein'),

('password.password_too_short', 'fr', 'Le mot de passe doit contenir au moins 6 caractères'),
('password.password_too_short', 'en', 'Password must be at least 6 characters long'),
('password.password_too_short', 'de', 'Passwort muss mindestens 6 Zeichen lang sein'),

('password.password_updated_successfully', 'fr', 'Mot de passe mis à jour avec succès'),
('password.password_updated_successfully', 'en', 'Password updated successfully'),
('password.password_updated_successfully', 'de', 'Passwort erfolgreich aktualisiert'),

('password.password_update_error', 'fr', 'Erreur lors de la mise à jour du mot de passe'),
('password.password_update_error', 'en', 'Error updating password'),
('password.password_update_error', 'de', 'Fehler beim Aktualisieren des Passworts'),

('password.new_password', 'fr', 'Nouveau mot de passe'),
('password.new_password', 'en', 'New password'),
('password.new_password', 'de', 'Neues Passwort'),

('password.enter_new_password', 'fr', 'Entrez votre nouveau mot de passe'),
('password.enter_new_password', 'en', 'Enter your new password'),
('password.enter_new_password', 'de', 'Geben Sie Ihr neues Passwort ein'),

('password.confirm_new_password', 'fr', 'Confirmez le nouveau mot de passe'),
('password.confirm_new_password', 'en', 'Confirm new password'),
('password.confirm_new_password', 'de', 'Neues Passwort bestätigen'),

('password.updating', 'fr', 'Mise à jour...'),
('password.updating', 'en', 'Updating...'),
('password.updating', 'de', 'Aktualisieren...'),

('password.update_password', 'fr', 'Mettre à jour le mot de passe'),
('password.update_password', 'en', 'Update password'),
('password.update_password', 'de', 'Passwort aktualisieren')

ON CONFLICT (key, language) DO NOTHING;