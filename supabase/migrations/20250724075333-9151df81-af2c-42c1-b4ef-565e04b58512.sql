-- Add missing translations for My Rewards page
INSERT INTO public.ui_translations (key, language, value) VALUES
-- Empty state translations
('rewards.empty.active_title', 'fr', 'Aucune récompense active'),
('rewards.empty.active_title', 'en', 'No active rewards'),
('rewards.empty.active_title', 'de', 'Keine aktiven Belohnungen'),

('rewards.empty.active_description', 'fr', 'Vous n''avez pas encore échangé de récompenses. Visitez la boutique pour découvrir les offres disponibles !'),
('rewards.empty.active_description', 'en', 'You haven''t redeemed any rewards yet. Visit the store to discover available offers!'),
('rewards.empty.active_description', 'de', 'Sie haben noch keine Belohnungen eingelöst. Besuchen Sie den Shop, um verfügbare Angebote zu entdecken!'),

('rewards.empty.used_title', 'fr', 'Aucune récompense utilisée'),
('rewards.empty.used_title', 'en', 'No used rewards'),
('rewards.empty.used_title', 'de', 'Keine verwendeten Belohnungen'),

('rewards.empty.used_description', 'fr', 'Vos récompenses utilisées apparaîtront ici.'),
('rewards.empty.used_description', 'en', 'Your used rewards will appear here.'),
('rewards.empty.used_description', 'de', 'Ihre verwendeten Belohnungen werden hier angezeigt.'),

('rewards.empty.expired_title', 'fr', 'Aucune récompense expirée'),
('rewards.empty.expired_title', 'en', 'No expired rewards'),
('rewards.empty.expired_title', 'de', 'Keine abgelaufenen Belohnungen'),

('rewards.empty.expired_description', 'fr', 'Vos récompenses expirées apparaîtront ici.'),
('rewards.empty.expired_description', 'en', 'Your expired rewards will appear here.'),
('rewards.empty.expired_description', 'de', 'Ihre abgelaufenen Belohnungen werden hier angezeigt.'),

-- Common actions
('common.discover_rewards', 'fr', 'Découvrir les récompenses'),
('common.discover_rewards', 'en', 'Discover rewards'),
('common.discover_rewards', 'de', 'Belohnungen entdecken'),

('common.my_rewards', 'fr', 'Mes récompenses obtenues'),
('common.my_rewards', 'en', 'My earned rewards'),
('common.my_rewards', 'de', 'Meine erhaltenen Belohnungen'),

('common.back', 'fr', 'Retour'),
('common.back', 'en', 'Back'),
('common.back', 'de', 'Zurück'),

-- Page titles
('rewards.my_rewards.title', 'fr', 'Mes Récompenses'),
('rewards.my_rewards.title', 'en', 'My Rewards'),
('rewards.my_rewards.title', 'de', 'Meine Belohnungen'),

('rewards.my_rewards.subtitle', 'fr', 'Gérez vos récompenses échangées'),
('rewards.my_rewards.subtitle', 'en', 'Manage your redeemed rewards'),
('rewards.my_rewards.subtitle', 'de', 'Verwalten Sie Ihre eingelösten Belohnungen'),

-- Statistics
('rewards.stats.active_vouchers', 'fr', 'Bons actifs'),
('rewards.stats.active_vouchers', 'en', 'Active vouchers'),
('rewards.stats.active_vouchers', 'de', 'Aktive Gutscheine'),

('rewards.stats.used_vouchers', 'fr', 'Bons utilisés'),
('rewards.stats.used_vouchers', 'en', 'Used vouchers'),
('rewards.stats.used_vouchers', 'de', 'Verwendete Gutscheine'),

('rewards.stats.points_spent', 'fr', 'Points dépensés'),
('rewards.stats.points_spent', 'en', 'Points spent'),
('rewards.stats.points_spent', 'de', 'Ausgegebene Punkte'),

('rewards.stats.value_redeemed', 'fr', 'Valeur échangée'),
('rewards.stats.value_redeemed', 'en', 'Value redeemed'),
('rewards.stats.value_redeemed', 'de', 'Eingelöster Wert'),

-- Loading states
('common.loading', 'fr', 'Chargement...'),
('common.loading', 'en', 'Loading...'),
('common.loading', 'de', 'Laden...'),

('rewards.loading.vouchers', 'fr', 'Chargement de vos récompenses...'),
('rewards.loading.vouchers', 'en', 'Loading your rewards...'),
('rewards.loading.vouchers', 'de', 'Laden Ihrer Belohnungen...')

ON CONFLICT (key, language) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = now();