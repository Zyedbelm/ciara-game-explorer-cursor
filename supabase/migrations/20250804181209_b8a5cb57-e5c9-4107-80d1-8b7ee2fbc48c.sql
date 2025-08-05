-- Add additional translations for password component (using correct keys)
INSERT INTO public.ui_translations (key, language, value) VALUES
-- Password component translations (French)
('passwords_not_match', 'fr', 'Les mots de passe ne correspondent pas'),
('password_updated_successfully', 'fr', 'Mot de passe mis à jour avec succès'),
('password_update_error', 'fr', 'Erreur lors de la mise à jour du mot de passe'),
('enter_new_password', 'fr', 'Entrez votre nouveau mot de passe'),
('confirm_new_password', 'fr', 'Confirmez le nouveau mot de passe'),
('update_password', 'fr', 'Mettre à jour le mot de passe'),
('updating', 'fr', 'Mise à jour en cours...'),

-- Password component translations (English)
('passwords_not_match', 'en', 'Passwords do not match'),
('password_updated_successfully', 'en', 'Password updated successfully'),
('password_update_error', 'en', 'Error updating password'),
('enter_new_password', 'en', 'Enter your new password'),
('confirm_new_password', 'en', 'Confirm new password'),
('update_password', 'en', 'Update Password'),
('updating', 'en', 'Updating...'),

-- Password component translations (German)
('passwords_not_match', 'de', 'Passwörter stimmen nicht überein'),
('password_updated_successfully', 'de', 'Passwort erfolgreich aktualisiert'),
('password_update_error', 'de', 'Fehler beim Aktualisieren des Passworts'),
('enter_new_password', 'de', 'Geben Sie Ihr neues Passwort ein'),
('confirm_new_password', 'de', 'Neues Passwort bestätigen'),
('update_password', 'de', 'Passwort aktualisieren'),
('updating', 'de', 'Wird aktualisiert...')

ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();