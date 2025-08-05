-- Add missing common UI translations to ui_translations table
INSERT INTO public.ui_translations (key, language, value, category, created_at, updated_at) VALUES
-- Loading translations
('loading', 'fr', 'Chargement...', 'common', now(), now()),
('loading', 'en', 'Loading...', 'common', now(), now()),
('loading', 'de', 'Laden...', 'common', now(), now()),

-- Magic link login translations
('magic_link_login', 'fr', 'Connexion par lien magique', 'auth', now(), now()),
('magic_link_login', 'en', 'Magic link login', 'auth', now(), now()),
('magic_link_login', 'de', 'Magic Link Anmeldung', 'auth', now(), now()),

-- Send magic link translations
('send_magic_link', 'fr', 'Envoyer le lien magique', 'auth', now(), now()),
('send_magic_link', 'en', 'Send magic link', 'auth', now(), now()),
('send_magic_link', 'de', 'Magic Link senden', 'auth', now(), now()),

-- Email sent translations
('email_sent', 'fr', 'Email envoyé', 'common', now(), now()),
('email_sent', 'en', 'Email sent', 'common', now(), now()),
('email_sent', 'de', 'E-Mail gesendet', 'common', now(), now()),

-- Check your email translations
('check_your_email', 'fr', 'Vérifiez votre email', 'auth', now(), now()),
('check_your_email', 'en', 'Check your email', 'auth', now(), now()),
('check_your_email', 'de', 'Überprüfen Sie Ihre E-Mail', 'auth', now(), now())

ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();