-- Add translation for "Edit profile to change your password"
INSERT INTO public.ui_translations (key, language, value, category, created_at, updated_at) VALUES
('profile.edit_to_change_password', 'fr', 'Modifier le profil pour changer votre mot de passe', 'profile', now(), now()),
('profile.edit_to_change_password', 'en', 'Edit profile to change your password', 'profile', now(), now()),
('profile.edit_to_change_password', 'de', 'Profil bearbeiten, um Ihr Passwort zu ändern', 'profile', now(), now())

ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();