-- Add missing translations for auth and profile components
INSERT INTO public.ui_translations (key, language, value) VALUES
-- Magic link translations (French)
('magic_link_login', 'fr', 'Connexion par lien magique'),
('magic_link_instruction', 'fr', 'Entrez votre email pour recevoir un lien de connexion'),

-- Magic link translations (English)
('magic_link_login', 'en', 'Magic Link Login'),
('magic_link_instruction', 'en', 'Enter your email to receive a login link'),

-- Magic link translations (German)
('magic_link_login', 'de', 'Magic-Link-Anmeldung'),
('magic_link_instruction', 'de', 'Geben Sie Ihre E-Mail ein, um einen Anmelde-Link zu erhalten'),

-- Profile edit password instruction (French)
('profile.edit_to_change_password', 'fr', 'Modifier le profil pour changer votre mot de passe'),

-- Profile edit password instruction (English)
('profile.edit_to_change_password', 'en', 'Edit profile to change your password'),

-- Profile edit password instruction (German)
('profile.edit_to_change_password', 'de', 'Profil bearbeiten, um Ihr Passwort zu ändern'),

-- Password change section translations (French)
('change_password', 'fr', 'Changer le mot de passe'),
('new_password', 'fr', 'Nouveau mot de passe'),
('confirm_password', 'fr', 'Confirmer le mot de passe'),
('password_updated', 'fr', 'Mot de passe mis à jour avec succès'),
('password_mismatch', 'fr', 'Les mots de passe ne correspondent pas'),
('password_too_short', 'fr', 'Le mot de passe doit contenir au moins 6 caractères'),
('updating_password', 'fr', 'Mise à jour...'),

-- Password change section translations (English)
('change_password', 'en', 'Change Password'),
('new_password', 'en', 'New Password'),
('confirm_password', 'en', 'Confirm Password'),
('password_updated', 'en', 'Password updated successfully'),
('password_mismatch', 'en', 'Passwords do not match'),
('password_too_short', 'en', 'Password must be at least 6 characters'),
('updating_password', 'en', 'Updating...'),

-- Password change section translations (German)
('change_password', 'de', 'Passwort ändern'),
('new_password', 'de', 'Neues Passwort'),
('confirm_password', 'de', 'Passwort bestätigen'),
('password_updated', 'de', 'Passwort erfolgreich aktualisiert'),
('password_mismatch', 'de', 'Passwörter stimmen nicht überein'),
('password_too_short', 'de', 'Passwort muss mindestens 6 Zeichen haben'),
('updating_password', 'de', 'Wird aktualisiert...')

ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();