-- Add missing translation for magic link error message
INSERT INTO public.ui_translations (key, language, value, category, created_at, updated_at) VALUES
('magic_link_error', 'fr', 'Impossible d''envoyer le lien magique. Veuillez réessayer.', 'auth', now(), now()),
('magic_link_error', 'en', 'Unable to send magic link. Please try again.', 'auth', now(), now()),
('magic_link_error', 'de', 'Magic Link konnte nicht gesendet werden. Bitte versuchen Sie es erneut.', 'auth', now(), now())

ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();