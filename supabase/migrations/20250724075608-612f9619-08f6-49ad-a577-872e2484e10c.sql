-- Add missing translations for tabs and additional actions
INSERT INTO public.ui_translations (key, language, value) VALUES
-- Tab labels
('rewards.tabs.active', 'fr', 'Actives'),
('rewards.tabs.active', 'en', 'Active'),
('rewards.tabs.active', 'de', 'Aktiv'),

('rewards.tabs.used', 'fr', 'Utilisées'),
('rewards.tabs.used', 'en', 'Used'),
('rewards.tabs.used', 'de', 'Verwendet'),

('rewards.tabs.expired', 'fr', 'Expirées'),
('rewards.tabs.expired', 'en', 'Expired'),
('rewards.tabs.expired', 'de', 'Abgelaufen'),

-- Common actions
('common.retry', 'fr', 'Réessayer'),
('common.retry', 'en', 'Retry'),
('common.retry', 'de', 'Wiederholen'),

('common.refresh', 'fr', 'Actualiser'),
('common.refresh', 'en', 'Refresh'),
('common.refresh', 'de', 'Aktualisieren'),

('common.login_required', 'fr', 'Vous devez être connecté pour accéder à cette page'),
('common.login_required', 'en', 'You must be logged in to access this page'),
('common.login_required', 'de', 'Sie müssen angemeldet sein, um auf diese Seite zuzugreifen'),

-- Error messages
('rewards.error.loading', 'fr', 'Erreur lors du chargement des récompenses'),
('rewards.error.loading', 'en', 'Error loading rewards'),
('rewards.error.loading', 'de', 'Fehler beim Laden der Belohnungen'),

('rewards.error.title', 'fr', 'Erreur'),
('rewards.error.title', 'en', 'Error'),
('rewards.error.title', 'de', 'Fehler')

ON CONFLICT (key, language) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = now();