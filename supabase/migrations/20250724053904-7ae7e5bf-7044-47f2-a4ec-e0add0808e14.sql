-- Add reward translations to UI translations
INSERT INTO ui_translations (key, language, value) VALUES
-- Rewards translations
('rewards.my_rewards.title', 'fr', 'Mes Récompenses'),
('rewards.my_rewards.title', 'en', 'My Rewards'),
('rewards.my_rewards.title', 'de', 'Meine Belohnungen'),
('rewards.my_rewards.description', 'fr', 'Gérez vos bons de réduction et récompenses'),
('rewards.my_rewards.description', 'en', 'Manage your vouchers and rewards'),
('rewards.my_rewards.description', 'de', 'Verwalten Sie Ihre Gutscheine und Belohnungen'),

-- Status
('rewards.status.pending', 'fr', 'En attente'),
('rewards.status.pending', 'en', 'Pending'),
('rewards.status.pending', 'de', 'Ausstehend'),
('rewards.status.used', 'fr', 'Utilisé'),
('rewards.status.used', 'en', 'Used'),
('rewards.status.used', 'de', 'Verwendet'),
('rewards.status.expired', 'fr', 'Expiré'),
('rewards.status.expired', 'en', 'Expired'),
('rewards.status.expired', 'de', 'Abgelaufen'),

-- Redeem actions
('rewards.redeem.use_now', 'fr', 'Profiter maintenant'),
('rewards.redeem.use_now', 'en', 'Use now'),
('rewards.redeem.use_now', 'de', 'Jetzt nutzen'),
('rewards.redeem.processing', 'fr', 'Traitement...'),
('rewards.redeem.processing', 'en', 'Processing...'),
('rewards.redeem.processing', 'de', 'Verarbeitung...'),
('rewards.redeem.success_title', 'fr', 'Email envoyé'),
('rewards.redeem.success_title', 'en', 'Email sent'),
('rewards.redeem.success_title', 'de', 'E-Mail gesendet'),
('rewards.redeem.success_description', 'fr', 'Le partenaire a été notifié de votre demande'),
('rewards.redeem.success_description', 'en', 'The partner has been notified of your request'),
('rewards.redeem.success_description', 'de', 'Der Partner wurde über Ihre Anfrage benachrichtigt'),

-- Tabs
('rewards.tabs.active', 'fr', 'Actifs'),
('rewards.tabs.active', 'en', 'Active'),
('rewards.tabs.active', 'de', 'Aktiv'),
('rewards.tabs.used', 'fr', 'Utilisés'),
('rewards.tabs.used', 'en', 'Used'),
('rewards.tabs.used', 'de', 'Verwendet'),
('rewards.tabs.expired', 'fr', 'Expirés'),
('rewards.tabs.expired', 'en', 'Expired'),
('rewards.tabs.expired', 'de', 'Abgelaufen'),

-- Voucher fields
('rewards.voucher.type', 'fr', 'Type'),
('rewards.voucher.type', 'en', 'Type'),
('rewards.voucher.type', 'de', 'Typ'),
('rewards.voucher.points_spent', 'fr', 'Points dépensés'),
('rewards.voucher.points_spent', 'en', 'Points spent'),
('rewards.voucher.points_spent', 'de', 'Punkte ausgegeben'),
('rewards.voucher.value', 'fr', 'Valeur'),
('rewards.voucher.value', 'en', 'Value'),
('rewards.voucher.value', 'de', 'Wert'),
('rewards.voucher.code', 'fr', 'Code'),
('rewards.voucher.code', 'en', 'Code'),
('rewards.voucher.code', 'de', 'Code'),
('rewards.voucher.redeemed_at', 'fr', 'Échangé le'),
('rewards.voucher.redeemed_at', 'en', 'Redeemed on'),
('rewards.voucher.redeemed_at', 'de', 'Eingelöst am'),
('rewards.voucher.used_at', 'fr', 'Utilisé le'),
('rewards.voucher.used_at', 'en', 'Used on'),
('rewards.voucher.used_at', 'de', 'Verwendet am'),

-- Error messages
('rewards.error.title', 'fr', 'Erreur'),
('rewards.error.title', 'en', 'Error'),
('rewards.error.title', 'de', 'Fehler'),
('rewards.error.loading', 'fr', 'Erreur de chargement des récompenses'),
('rewards.error.loading', 'en', 'Error loading rewards'),
('rewards.error.loading', 'de', 'Fehler beim Laden der Belohnungen'),
('rewards.error.no_partner_email', 'fr', 'Email du partenaire non configuré'),
('rewards.error.no_partner_email', 'en', 'Partner email not configured'),
('rewards.error.no_partner_email', 'de', 'Partner-E-Mail nicht konfiguriert'),

-- Stats
('rewards.stats.active_vouchers', 'fr', 'Bons actifs'),
('rewards.stats.active_vouchers', 'en', 'Active vouchers'),
('rewards.stats.active_vouchers', 'de', 'Aktive Gutscheine'),
('rewards.stats.used_vouchers', 'fr', 'Bons utilisés'),
('rewards.stats.used_vouchers', 'en', 'Used vouchers'),
('rewards.stats.used_vouchers', 'de', 'Verwendete Gutscheine'),
('rewards.stats.points_spent', 'fr', 'Points dépensés'),
('rewards.stats.points_spent', 'en', 'Points spent'),
('rewards.stats.points_spent', 'de', 'Punkte ausgegeben'),
('rewards.stats.value_redeemed', 'fr', 'Valeur échangée'),
('rewards.stats.value_redeemed', 'en', 'Value redeemed'),
('rewards.stats.value_redeemed', 'de', 'Wert eingelöst')

ON CONFLICT (key, language) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = now();