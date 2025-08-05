-- Phase 1: Création complète des données de test CIARA (avec tous les enums corrigés)

-- Création des récompenses avec les bons types reward_type
INSERT INTO public.rewards (partner_id, type, title, description, points_required, value_chf, max_redemptions, terms_conditions, is_active, image_url) VALUES
-- Lausanne
((SELECT id FROM partners WHERE name = 'Restaurant La Table d''Edgard'), 'discount', 'Réduction 15% - Menu découverte', 'Réduction de 15% sur le menu découverte (hors boissons)', 150, 25.00, 50, 'Valable du lundi au jeudi. Réservation obligatoire. Non cumulable.', true, 'https://images.unsplash.com/photo-1517022812141-23620dba5c23'),
((SELECT id FROM partners WHERE name = 'Hôtel des Bergues'), 'upgrade', 'Surclassement chambre gratuit', 'Surclassement gratuit selon disponibilité', 300, 100.00, 20, 'Sous réserve de disponibilité. Valable week-end uniquement.', true, 'https://images.unsplash.com/photo-1721322800607-8c38375eef04'),
((SELECT id FROM partners WHERE name = 'Boutique Chocolats Läderach'), 'free_item', 'Boîte de chocolats offerte', 'Boîte de 12 chocolats artisanaux offerte', 100, 15.00, 100, 'Une utilisation par personne. Non remboursable.', true, 'https://images.unsplash.com/photo-1582562124811-c09040d0a901'),

-- Genève
((SELECT id FROM partners WHERE name = 'Restaurant Bayview'), 'discount', 'Menu dégustation -20%', 'Réduction de 20% sur le menu dégustation 7 services', 400, 80.00, 30, 'Réservation 48h à l''avance. Valable soir uniquement.', true, 'https://images.unsplash.com/photo-1517022812141-23620dba5c23'),
((SELECT id FROM partners WHERE name = 'Patek Philippe Museum'), 'experience', 'Visite guidée privée', 'Visite guidée privée avec horloger expert', 250, 50.00, 10, 'Sur rendez-vous uniquement. Durée 1h30.', true, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9'),
((SELECT id FROM partners WHERE name = 'Manor Genève'), 'free_item', 'Bon d''achat 20 CHF', 'Bon d''achat valable dans tous les rayons', 120, 20.00, 200, 'Valable 6 mois. Non fractionnable.', true, 'https://images.unsplash.com/photo-1527576539890-dfa815648363'),

-- Zurich
((SELECT id FROM partners WHERE name = 'Restaurant Kronenhalle'), 'experience', 'Dîner avec visite art', 'Dîner gastronomique + visite collection d''art', 500, 150.00, 15, 'Menu fixe uniquement. Réservation obligatoire.', true, 'https://images.unsplash.com/photo-1498936178812-4b2e558d2937'),
((SELECT id FROM partners WHERE name = 'Sprüngli Confiserie'), 'free_item', 'Assortiment Luxemburgerli', 'Boîte de 18 macarons Luxemburgerli', 80, 12.00, 150, 'À consommer dans les 3 jours. Frais uniquement.', true, 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1'),
((SELECT id FROM partners WHERE name = 'Widder Hotel'), 'upgrade', 'Suite avec champagne', 'Surclassement suite + bouteille de champagne', 600, 200.00, 5, 'Week-end uniquement. Séjour minimum 2 nuits.', true, 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b'),

-- Berne
((SELECT id FROM partners WHERE name = 'Restaurant Meridiano'), 'discount', 'Menu méditerranéen -25%', 'Réduction sur le menu dégustation méditerranéen', 200, 40.00, 40, 'Du mardi au jeudi. Boissons en sus.', true, 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac'),
((SELECT id FROM partners WHERE name = 'Hotel Schweizerhof'), 'experience', 'Petit-déjeuner panoramique', 'Petit-déjeuner sur la terrasse avec vue sur les Alpes', 180, 35.00, 25, 'Selon météo. Réservation la veille.', true, 'https://images.unsplash.com/photo-1441057206919-63d19fac2369'),

-- Montreux
((SELECT id FROM partners WHERE name = 'Restaurant Le Pont de Brent'), 'experience', 'Menu dégustation sommelier', 'Menu 9 services avec accords vins du sommelier', 800, 300.00, 8, 'Réservation 1 semaine à l''avance. Soir uniquement.', true, 'https://images.unsplash.com/photo-1485833077593-4278bba3f11f'),
((SELECT id FROM partners WHERE name = 'Fairmont Le Montreux Palace'), 'experience', 'Accès spa + massage', 'Journée spa avec massage relaxant 50min', 450, 180.00, 12, 'Réservation spa obligatoire. Valable semaine.', true, 'https://images.unsplash.com/photo-1469041797191-50ace28483c3'),

-- Interlaken
((SELECT id FROM partners WHERE name = 'Restaurant Taverne'), 'free_item', 'Fondue complète pour 2', 'Fondue traditionnelle avec accompagnements pour 2 personnes', 160, 30.00, 60, 'Soir uniquement. Réservation conseillée.', true, 'https://images.unsplash.com/photo-1452960962994-acf4fd70b632'),
((SELECT id FROM partners WHERE name = 'Hotel Victoria Jungfrau'), 'experience', 'Package aventure Alpes', 'Nuitée + activité au choix (parapente, rafting)', 700, 250.00, 10, 'Selon conditions météo. Assurance incluse.', true, 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2');