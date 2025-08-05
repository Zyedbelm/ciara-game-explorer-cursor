-- Phase 1: Recréation complète des données CIARA avec les bons enums

-- Supprimer toutes les données pour un redémarrage propre
DELETE FROM reward_redemptions;
DELETE FROM step_completions;
DELETE FROM user_journey_progress;
DELETE FROM quiz_questions;
DELETE FROM journey_steps;
DELETE FROM journeys;
DELETE FROM steps;
DELETE FROM journey_categories;
DELETE FROM rewards;
DELETE FROM partners;
DELETE FROM cities WHERE slug != 'lausanne';

-- Insertion des villes suisses principales
INSERT INTO public.cities (name, slug, country, description, latitude, longitude, timezone, default_language, supported_languages, primary_color, secondary_color, subscription_plan) VALUES 
('Genève', 'geneve', 'Switzerland', 'Cité internationale au bord du lac Léman, siège de nombreuses organisations internationales', 46.2044, 6.1432, 'Europe/Zurich', 'fr', ARRAY['fr', 'en', 'de'], '#E74C3C', '#3498DB', 'professional'),
('Zurich', 'zurich', 'Switzerland', 'Capitale économique de la Suisse, ville dynamique entre lac et montagne', 47.3769, 8.5417, 'Europe/Zurich', 'de', ARRAY['de', 'fr', 'en', 'it'], '#2ECC71', '#E67E22', 'enterprise'),
('Berne', 'berne', 'Switzerland', 'Capitale fédérale suisse, cité médiévale classée au patrimoine mondial UNESCO', 46.9481, 7.4474, 'Europe/Zurich', 'de', ARRAY['de', 'fr'], '#9B59B6', '#F39C12', 'starter'),
('Montreux', 'montreux', 'Switzerland', 'Perle de la Riviera suisse, célèbre pour son festival de jazz et ses vignobles', 46.4312, 6.9123, 'Europe/Zurich', 'fr', ARRAY['fr', 'en'], '#1ABC9C', '#E74C3C', 'starter'),
('Interlaken', 'interlaken', 'Switzerland', 'Porte d''entrée des Alpes bernoises, paradis des sports d''aventure', 46.6863, 7.8632, 'Europe/Zurich', 'de', ARRAY['de', 'fr', 'en'], '#34495E', '#F1C40F', 'professional');

-- Mise à jour de Lausanne existant
UPDATE public.cities 
SET description = 'Capitale olympique sur les rives du lac Léman, ville universitaire dynamique entre vignobles et Alpes',
    latitude = 46.5197,
    longitude = 6.6323,
    primary_color = '#8B5CF6',
    secondary_color = '#06B6D4',
    subscription_plan = 'professional'
WHERE slug = 'lausanne';

-- Création des catégories de parcours
INSERT INTO public.journey_categories (city_id, name, slug, type, description, difficulty, estimated_duration, icon, color) VALUES
-- Lausanne
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Patrimoine UNESCO', 'patrimoine-unesco-lausanne', 'old_town', 'Découvrez le patrimoine architectural et culturel de Lausanne', 'easy', 90, 'building', '#8B5CF6'),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Vignobles de Lavaux', 'vignobles-lavaux', 'nature', 'Randonnée dans les vignobles en terrasses classés UNESCO', 'medium', 180, 'grape', '#10B981'),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Street Art urbain', 'street-art-lausanne', 'art_culture', 'Circuit artistique dans les quartiers branchés', 'easy', 120, 'palette', '#F59E0B'),

-- Genève
((SELECT id FROM cities WHERE slug = 'geneve'), 'Genève International', 'geneve-international', 'old_town', 'Sur les traces des organisations internationales', 'medium', 150, 'globe', '#E74C3C'),
((SELECT id FROM cities WHERE slug = 'geneve'), 'Lac et jardins', 'lac-jardins-geneve', 'nature', 'Promenade le long du lac et dans les parcs', 'easy', 120, 'flower', '#3498DB'),
((SELECT id FROM cities WHERE slug = 'geneve'), 'Chocolat et horlogerie', 'chocolat-horlogerie', 'gastronomy', 'L''art de vivre genevois', 'easy', 90, 'clock', '#8B4513'),

-- Zurich
((SELECT id FROM cities WHERE slug = 'zurich'), 'Vieille ville de Zurich', 'vieille-ville-zurich', 'old_town', 'Cœur historique entre églises et guildes', 'easy', 105, 'church', '#2ECC71'),
((SELECT id FROM cities WHERE slug = 'zurich'), 'Zurich moderne', 'zurich-moderne', 'art_culture', 'Architecture contemporaine et quartiers branchés', 'medium', 135, 'building', '#E67E22'),
((SELECT id FROM cities WHERE slug = 'zurich'), 'Bords du lac', 'bords-lac-zurich', 'nature', 'Détente au bord du lac de Zurich', 'easy', 90, 'waves', '#3498DB'),

-- Berne
((SELECT id FROM cities WHERE slug = 'berne'), 'Centre historique', 'centre-historique-berne', 'old_town', 'Arcades médiévales et fontaines historiques', 'easy', 120, 'castle', '#9B59B6'),
((SELECT id FROM cities WHERE slug = 'berne'), 'Parcs aux ours', 'parcs-ours-berne', 'nature', 'Rencontre avec les ours de Berne', 'easy', 75, 'bear', '#8B4513'),

-- Montreux
((SELECT id FROM cities WHERE slug = 'montreux'), 'Riviera et châteaux', 'riviera-chateaux', 'art_culture', 'Château de Chillon et promenade lakeside', 'medium', 180, 'castle', '#1ABC9C'),
((SELECT id FROM cities WHERE slug = 'montreux'), 'Vignobles du Lavaux', 'vignobles-lavaux-montreux', 'nature', 'Randonnée dans les vignes en terrasses', 'hard', 240, 'grape', '#27AE60'),

-- Interlaken
((SELECT id FROM cities WHERE slug = 'interlaken'), 'Entre deux lacs', 'entre-deux-lacs', 'nature', 'Découverte des lacs de Thoune et Brienz', 'medium', 150, 'mountain', '#34495E'),
((SELECT id FROM cities WHERE slug = 'interlaken'), 'Sports d''aventure', 'sports-aventure', 'adventure', 'Initiation aux sports alpins', 'hard', 300, 'zap', '#F1C40F');

-- Création des étapes avec les bons types step_type
INSERT INTO public.steps (city_id, name, description, address, latitude, longitude, type, points_awarded, validation_radius, has_quiz, images) VALUES
-- Lausanne
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Cathédrale Notre-Dame', 'Magnifique cathédrale gothique du XIIIe siècle, symbole de Lausanne', 'Place de la Cathédrale 4, 1005 Lausanne', 46.5239, 6.6356, 'monument', 15, 30, true, ARRAY['https://images.unsplash.com/photo-1551038247-3d9af20df552']),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Musée Olympique', 'Temple du sport olympique avec vue sur le lac', 'Quai d''Ouchy 1, 1006 Lausanne', 46.5089, 6.6344, 'museum', 20, 40, true, ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475']),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Escaliers du Marché', 'Escalier historique couvert du 13e siècle', 'Escaliers du Marché, 1003 Lausanne', 46.5219, 6.6356, 'viewpoint', 10, 25, true, ARRAY['https://images.unsplash.com/photo-1449157291145-7efd050a4d0e']),

-- Genève (échantillon)
((SELECT id FROM cities WHERE slug = 'geneve'), 'Jet d''eau', 'Symbole emblématique de Genève depuis 1886', 'Quai Gustave-Ador, 1207 Genève', 46.2067, 6.1556, 'landmark', 15, 50, true, ARRAY['https://images.unsplash.com/photo-1500375592092-40eb2168fd21']),
((SELECT id FROM cities WHERE slug = 'geneve'), 'Palais des Nations', 'Siège européen des Nations Unies', 'Avenue de la Paix 14, 1211 Genève', 46.2267, 6.1367, 'monument', 25, 40, true, ARRAY['https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a']),

-- Zurich (échantillon)
((SELECT id FROM cities WHERE slug = 'zurich'), 'Grossmünster', 'Église emblématique de Zurich avec ses tours jumelles', 'Grossmünsterplatz, 8001 Zürich', 47.3700, 8.5444, 'monument', 15, 30, true, ARRAY['https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace']),
((SELECT id FROM cities WHERE slug = 'zurich'), 'Bahnhofstrasse', 'Une des rues commerçantes les plus chères au monde', 'Bahnhofstrasse, 8001 Zürich', 47.3781, 8.5400, 'shop', 10, 50, true, ARRAY['https://images.unsplash.com/photo-1487958449943-2429e8be8625']);

-- Création des parcours
INSERT INTO public.journeys (city_id, category_id, name, description, difficulty, estimated_duration, total_points, distance_km, is_predefined, is_active) VALUES
-- Lausanne
((SELECT id FROM cities WHERE slug = 'lausanne'), (SELECT id FROM journey_categories WHERE slug = 'patrimoine-unesco-lausanne'), 'Circuit Patrimoine Lausanne', 'Découverte du patrimoine architectural et culturel de Lausanne', 'easy', 120, 80, 3.5, true, true),

-- Genève
((SELECT id FROM cities WHERE slug = 'geneve'), (SELECT id FROM journey_categories WHERE slug = 'geneve-international'), 'Genève Diplomatique', 'Sur les traces des organisations internationales', 'medium', 150, 100, 5.5, true, true),

-- Zurich
((SELECT id FROM cities WHERE slug = 'zurich'), (SELECT id FROM journey_categories WHERE slug = 'vieille-ville-zurich'), 'Zurich Historique', 'Cœur historique et monuments emblématiques', 'easy', 105, 70, 3.0, true, true);

-- Association des étapes aux parcours
INSERT INTO public.journey_steps (journey_id, step_id, step_order) VALUES
-- Circuit Patrimoine Lausanne
((SELECT id FROM journeys WHERE name = 'Circuit Patrimoine Lausanne'), (SELECT id FROM steps WHERE name = 'Cathédrale Notre-Dame'), 1),
((SELECT id FROM journeys WHERE name = 'Circuit Patrimoine Lausanne'), (SELECT id FROM steps WHERE name = 'Escaliers du Marché'), 2),
((SELECT id FROM journeys WHERE name = 'Circuit Patrimoine Lausanne'), (SELECT id FROM steps WHERE name = 'Musée Olympique'), 3),

-- Genève Diplomatique
((SELECT id FROM journeys WHERE name = 'Genève Diplomatique'), (SELECT id FROM steps WHERE name = 'Palais des Nations'), 1),
((SELECT id FROM journeys WHERE name = 'Genève Diplomatique'), (SELECT id FROM steps WHERE name = 'Jet d''eau'), 2),

-- Zurich Historique
((SELECT id FROM journeys WHERE name = 'Zurich Historique'), (SELECT id FROM steps WHERE name = 'Grossmünster'), 1),
((SELECT id FROM journeys WHERE name = 'Zurich Historique'), (SELECT id FROM steps WHERE name = 'Bahnhofstrasse'), 2);

-- Création des partenaires
INSERT INTO public.partners (city_id, name, category, description, address, latitude, longitude, phone, email, website, logo_url, is_active) VALUES
-- Lausanne
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Restaurant La Table d''Edgard', 'restaurant', 'Cuisine gastronomique suisse contemporaine', 'Avenue des Bergières 1, 1004 Lausanne', 46.5167, 6.6333, '+41 21 613 33 00', 'info@edgard.ch', 'https://edgard.ch', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9', true),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Hôtel des Bergues', 'hotel', 'Hôtel de luxe au cœur de Lausanne', 'Rue du Grand-Pont 9, 1003 Lausanne', 46.5200, 6.6350, '+41 21 331 31 31', 'info@bergues.ch', 'https://bergues-lausanne.ch', 'https://images.unsplash.com/photo-1721322800607-8c38375eef04', true),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Boutique Chocolats Läderach', 'shop', 'Chocolaterie artisanale suisse premium', 'Place Saint-François 14, 1003 Lausanne', 46.5189, 6.6356, '+41 21 312 45 67', 'lausanne@laderach.com', 'https://laderach.com', 'https://images.unsplash.com/photo-1582562124811-c09040d0a901', true),

-- Genève
((SELECT id FROM cities WHERE slug = 'geneve'), 'Restaurant Bayview', 'restaurant', 'Restaurant gastronomique avec vue sur le lac', 'Quai du Mont-Blanc 19, 1201 Genève', 46.2089, 6.1467, '+41 22 906 66 66', 'bayview@president-wilson.com', 'https://bayview.ch', 'https://images.unsplash.com/photo-1517022812141-23620dba5c23', true),
((SELECT id FROM cities WHERE slug = 'geneve'), 'Manor Genève', 'shop', 'Grand magasin suisse', 'Rue de Cornavin 6, 1201 Genève', 46.2106, 6.1425, '+41 22 909 44 44', 'geneve@manor.ch', 'https://manor.ch', 'https://images.unsplash.com/photo-1527576539890-dfa815648363', true),

-- Zurich
((SELECT id FROM cities WHERE slug = 'zurich'), 'Restaurant Kronenhalle', 'restaurant', 'Institution gastronomique zurichoise depuis 1924', 'Rämistrasse 4, 8001 Zürich', 47.3697, 8.5486, '+41 44 262 99 00', 'info@kronenhalle.com', 'https://kronenhalle.com', 'https://images.unsplash.com/photo-1498936178812-4b2e558d2937', true),
((SELECT id FROM cities WHERE slug = 'zurich'), 'Sprüngli Confiserie', 'shop', 'Confiserie traditionnelle et macarons Luxemburgerli', 'Bahnhofstrasse 21, 8001 Zürich', 47.3758, 8.5403, '+41 44 224 47 47', 'info@spruengli.ch', 'https://spruengli.ch', 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1', true);

-- Création des récompenses avec les bons types
INSERT INTO public.rewards (partner_id, type, title, description, points_required, value_chf, max_redemptions, terms_conditions, is_active, image_url) VALUES
-- Lausanne
((SELECT id FROM partners WHERE name = 'Restaurant La Table d''Edgard'), 'discount', 'Réduction 15% - Menu découverte', 'Réduction de 15% sur le menu découverte (hors boissons)', 150, 25.00, 50, 'Valable du lundi au jeudi. Réservation obligatoire. Non cumulable.', true, 'https://images.unsplash.com/photo-1517022812141-23620dba5c23'),
((SELECT id FROM partners WHERE name = 'Hôtel des Bergues'), 'upgrade', 'Surclassement chambre gratuit', 'Surclassement gratuit selon disponibilité', 300, 100.00, 20, 'Sous réserve de disponibilité. Valable week-end uniquement.', true, 'https://images.unsplash.com/photo-1721322800607-8c38375eef04'),
((SELECT id FROM partners WHERE name = 'Boutique Chocolats Läderach'), 'free_item', 'Boîte de chocolats offerte', 'Boîte de 12 chocolats artisanaux offerte', 100, 15.00, 100, 'Une utilisation par personne. Non remboursable.', true, 'https://images.unsplash.com/photo-1582562124811-c09040d0a901'),

-- Genève
((SELECT id FROM partners WHERE name = 'Restaurant Bayview'), 'discount', 'Menu dégustation -20%', 'Réduction de 20% sur le menu dégustation 7 services', 400, 80.00, 30, 'Réservation 48h à l''avance. Valable soir uniquement.', true, 'https://images.unsplash.com/photo-1517022812141-23620dba5c23'),
((SELECT id FROM partners WHERE name = 'Manor Genève'), 'free_item', 'Bon d''achat 20 CHF', 'Bon d''achat valable dans tous les rayons', 120, 20.00, 200, 'Valable 6 mois. Non fractionnable.', true, 'https://images.unsplash.com/photo-1527576539890-dfa815648363'),

-- Zurich
((SELECT id FROM partners WHERE name = 'Restaurant Kronenhalle'), 'experience', 'Dîner avec visite art', 'Dîner gastronomique + visite collection d''art', 500, 150.00, 15, 'Menu fixe uniquement. Réservation obligatoire.', true, 'https://images.unsplash.com/photo-1498936178812-4b2e558d2937'),
((SELECT id FROM partners WHERE name = 'Sprüngli Confiserie'), 'free_item', 'Assortiment Luxemburgerli', 'Boîte de 18 macarons Luxemburgerli', 80, 12.00, 150, 'À consommer dans les 3 jours. Frais uniquement.', true, 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1');