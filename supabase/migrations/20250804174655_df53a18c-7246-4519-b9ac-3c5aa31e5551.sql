-- Add missing translation for forgot_password
INSERT INTO public.ui_translations (key, language, value, category, created_at, updated_at) VALUES
('forgot_password', 'fr', 'Mot de passe oublié ?', 'auth', now(), now()),
('forgot_password', 'en', 'Forgot password?', 'auth', now(), now()),
('forgot_password', 'de', 'Passwort vergessen?', 'auth', now(), now())

ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();