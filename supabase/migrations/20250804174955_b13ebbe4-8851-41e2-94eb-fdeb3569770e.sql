-- Add missing translations for magic link modal
INSERT INTO public.ui_translations (key, language, value, category, created_at, updated_at) VALUES
('magic_link_login', 'fr', 'Connexion avec Magic Link', 'auth', now(), now()),
('magic_link_login', 'en', 'Magic Link Login', 'auth', now(), now()),
('magic_link_login', 'de', 'Magic Link Anmeldung', 'auth', now(), now()),
('magic_link_instruction', 'fr', 'Entrez votre adresse email et nous vous enverrons un lien magique pour vous connecter automatiquement.', 'auth', now(), now()),
('magic_link_instruction', 'en', 'Enter your email address and we''ll send you a Magic Link to log in automatically.', 'auth', now(), now()),
('magic_link_instruction', 'de', 'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Magic Link zum automatischen Anmelden.', 'auth', now(), now())

ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();