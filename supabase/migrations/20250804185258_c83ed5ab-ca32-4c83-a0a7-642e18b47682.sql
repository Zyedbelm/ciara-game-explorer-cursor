-- Update magic link instruction translations with additional text about password change
UPDATE ui_translations 
SET value = 'Entrez votre adresse email et nous vous enverrons un lien magique pour vous connecter automatiquement. Vous pourrez ensuite changer votre mot de passe dans l''espace de votre Profile.',
    updated_at = now()
WHERE key = 'magic_link_instruction' AND language = 'fr';

UPDATE ui_translations 
SET value = 'Enter your email address and we''ll send you a Magic Link to log in automatically. You can then change your password in your Profile area.',
    updated_at = now()
WHERE key = 'magic_link_instruction' AND language = 'en';

UPDATE ui_translations 
SET value = 'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Magic Link zum automatischen Anmelden. Sie können dann Ihr Passwort in Ihrem Profil-Bereich ändern.',
    updated_at = now()
WHERE key = 'magic_link_instruction' AND language = 'de';