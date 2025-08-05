-- Add missing translations for rewards functionality
INSERT INTO public.ui_translations (key, language, value) VALUES
-- Rewards page translations
('rewards.title', 'fr', 'Récompenses'),
('rewards.title', 'en', 'Rewards'),
('rewards.title', 'de', 'Belohnungen'),

('rewards.subtitle', 'fr', 'Échangez vos points contre des récompenses'),
('rewards.subtitle', 'en', 'Exchange your points for rewards'),
('rewards.subtitle', 'de', 'Tauschen Sie Ihre Punkte gegen Belohnungen'),

('rewards.points_available', 'fr', 'Points disponibles'),
('rewards.points_available', 'en', 'Available points'),
('rewards.points_available', 'de', 'Verfügbare Punkte'),

('rewards.exchange', 'fr', 'Échanger'),
('rewards.exchange', 'en', 'Exchange'),
('rewards.exchange', 'de', 'Tauschen'),

('rewards.exchanging', 'fr', 'Échange en cours...'),
('rewards.exchanging', 'en', 'Exchanging...'),
('rewards.exchanging', 'de', 'Tausche...'),

('rewards.not_available', 'fr', 'Non disponible'),
('rewards.not_available', 'en', 'Not available'),
('rewards.not_available', 'de', 'Nicht verfügbar'),

('rewards.insufficient_points', 'fr', 'Points insuffisants'),
('rewards.insufficient_points', 'en', 'Insufficient points'),
('rewards.insufficient_points', 'de', 'Unzureichende Punkte'),

('rewards.exchanged_success', 'fr', 'Récompense échangée avec succès'),
('rewards.exchanged_success', 'en', 'Reward exchanged successfully'),
('rewards.exchanged_success', 'de', 'Belohnung erfolgreich getauscht'),

('rewards.exchange_error', 'fr', 'Erreur lors de l''échange'),
('rewards.exchange_error', 'en', 'Error during exchange'),
('rewards.exchange_error', 'de', 'Fehler beim Tausch'),

('rewards.my_exchanges', 'fr', 'Mes échanges'),
('rewards.my_exchanges', 'en', 'My exchanges'),
('rewards.my_exchanges', 'de', 'Meine Tauschgeschäfte'),

('rewards.value', 'fr', '{value} CHF'),
('rewards.value', 'en', '{value} CHF'),
('rewards.value', 'de', '{value} CHF'),

('rewards.limit', 'fr', 'Limite: {limit}'),
('rewards.limit', 'en', 'Limit: {limit}'),
('rewards.limit', 'de', 'Limit: {limit}'),

('rewards.code', 'fr', 'Code: {code}'),
('rewards.code', 'en', 'Code: {code}'),
('rewards.code', 'de', 'Code: {code}'),

('rewards.points_spent', 'fr', '{points} points dépensés'),
('rewards.points_spent', 'en', '{points} points spent'),
('rewards.points_spent', 'de', '{points} Punkte ausgegeben'),

('rewards.points_missing', 'fr', '{missing} points manquants'),
('rewards.points_missing', 'en', '{missing} points missing'),
('rewards.points_missing', 'de', '{missing} Punkte fehlen'),

-- Status translations
('rewards.status.pending', 'fr', 'En attente'),
('rewards.status.pending', 'en', 'Pending'),
('rewards.status.pending', 'de', 'Ausstehend'),

('rewards.status.validated', 'fr', 'Validé'),
('rewards.status.validated', 'en', 'Validated'),
('rewards.status.validated', 'de', 'Validiert'),

('rewards.status.expired', 'fr', 'Expiré'),
('rewards.status.expired', 'en', 'Expired'),
('rewards.status.expired', 'de', 'Abgelaufen'),

-- My Rewards page
('rewards.my_rewards.title', 'fr', 'Mes Récompenses'),
('rewards.my_rewards.title', 'en', 'My Rewards'),
('rewards.my_rewards.title', 'de', 'Meine Belohnungen'),

('rewards.my_rewards.subtitle', 'fr', 'Gérez vos bons d''achat et récompenses'),
('rewards.my_rewards.subtitle', 'en', 'Manage your vouchers and rewards'),
('rewards.my_rewards.subtitle', 'de', 'Verwalten Sie Ihre Gutscheine und Belohnungen')

ON CONFLICT (key, language) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = now();