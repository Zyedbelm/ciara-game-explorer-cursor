-- Add missing magic link translations to ensure database consistency
INSERT INTO ui_translations (key, language, value) VALUES
  ('magic_link_login', 'fr', 'Connexion avec Magic Link'),
  ('magic_link_login', 'en', 'Magic Link Login'),
  ('magic_link_login', 'de', 'Magic Link Anmeldung'),
  ('magic_link_instruction', 'fr', 'Entrez votre adresse email et nous vous enverrons un lien magique pour vous connecter automatiquement.'),
  ('magic_link_instruction', 'en', 'Enter your email address and we''ll send you a Magic Link to log in automatically.'),
  ('magic_link_instruction', 'de', 'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Magic Link zum automatischen Anmelden.'),
  ('send_magic_link', 'fr', 'Envoyer le lien magique'),
  ('send_magic_link', 'en', 'Send Magic Link'),
  ('send_magic_link', 'de', 'Magic Link senden'),
  ('email_address', 'fr', 'Adresse email'),
  ('email_address', 'en', 'Email address'),
  ('email_address', 'de', 'E-Mail-Adresse')
ON CONFLICT (key, language) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();