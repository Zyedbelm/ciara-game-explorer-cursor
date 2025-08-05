-- Phase 1: Création de données de test complètes pour CIARA (corrigé)
-- Insertion de villes suisses réelles avec coordonnées précises

-- Supprimer les données existantes pour recommencer proprement
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
DELETE FROM cities WHERE slug != 'lausanne'; -- Garder Lausanne existant

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

-- Création des catégories de parcours pour chaque ville (avec les bons types d'enum)
INSERT INTO public.journey_categories (city_id, name, slug, type, description, difficulty, estimated_duration, icon, color) VALUES
-- Lausanne
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Patrimoine UNESCO', 'patrimoine-unesco-lausanne', 'old_town', 'Découvrez le patrimoine architectural et culturel de Lausanne', 'easy', 90, 'building', '#8B5CF6'),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Vignobles de Lavaux', 'vignobles-lavaux', 'nature', 'Randonnée dans les vignobles en terrasses classés UNESCO', 'medium', 180, 'grape', '#10B981'),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Street Art urbain', 'street-art-lausanne', 'culture', 'Circuit artistique dans les quartiers branchés', 'easy', 120, 'palette', '#F59E0B'),

-- Genève
((SELECT id FROM cities WHERE slug = 'geneve'), 'Genève International', 'geneve-international', 'old_town', 'Sur les traces des organisations internationales', 'medium', 150, 'globe', '#E74C3C'),
((SELECT id FROM cities WHERE slug = 'geneve'), 'Lac et jardins', 'lac-jardins-geneve', 'nature', 'Promenade le long du lac et dans les parcs', 'easy', 120, 'flower', '#3498DB'),
((SELECT id FROM cities WHERE slug = 'geneve'), 'Chocolat et horlogerie', 'chocolat-horlogerie', 'gastronomy', 'L''art de vivre genevois', 'easy', 90, 'clock', '#8B4513'),

-- Zurich
((SELECT id FROM cities WHERE slug = 'zurich'), 'Vieille ville de Zurich', 'vieille-ville-zurich', 'old_town', 'Cœur historique entre églises et guildes', 'easy', 105, 'church', '#2ECC71'),
((SELECT id FROM cities WHERE slug = 'zurich'), 'Zurich moderne', 'zurich-moderne', 'culture', 'Architecture contemporaine et quartiers branchés', 'medium', 135, 'building', '#E67E22'),
((SELECT id FROM cities WHERE slug = 'zurich'), 'Bords du lac', 'bords-lac-zurich', 'nature', 'Détente au bord du lac de Zurich', 'easy', 90, 'waves', '#3498DB'),

-- Berne
((SELECT id FROM cities WHERE slug = 'berne'), 'Centre historique', 'centre-historique-berne', 'old_town', 'Arcades médiévales et fontaines historiques', 'easy', 120, 'castle', '#9B59B6'),
((SELECT id FROM cities WHERE slug = 'berne'), 'Parcs aux ours', 'parcs-ours-berne', 'nature', 'Rencontre avec les ours de Berne', 'easy', 75, 'bear', '#8B4513'),

-- Montreux
((SELECT id FROM cities WHERE slug = 'montreux'), 'Riviera et châteaux', 'riviera-chateaux', 'culture', 'Château de Chillon et promenade lakeside', 'medium', 180, 'castle', '#1ABC9C'),
((SELECT id FROM cities WHERE slug = 'montreux'), 'Vignobles du Lavaux', 'vignobles-lavaux-montreux', 'nature', 'Randonnée dans les vignes en terrasses', 'hard', 240, 'grape', '#27AE60'),

-- Interlaken
((SELECT id FROM cities WHERE slug = 'interlaken'), 'Entre deux lacs', 'entre-deux-lacs', 'nature', 'Découverte des lacs de Thoune et Brienz', 'medium', 150, 'mountain', '#34495E'),
((SELECT id FROM cities WHERE slug = 'interlaken'), 'Sports d''aventure', 'sports-aventure', 'nature', 'Initiation aux sports alpins', 'hard', 300, 'zap', '#F1C40F');

-- Création des étapes (steps) pour chaque ville
INSERT INTO public.steps (city_id, name, description, address, latitude, longitude, type, points_awarded, validation_radius, has_quiz, images) VALUES
-- Lausanne
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Cathédrale Notre-Dame', 'Magnifique cathédrale gothique du XIIIe siècle, symbole de Lausanne', 'Place de la Cathédrale 4, 1005 Lausanne', 46.5239, 6.6356, 'monument', 15, 30, true, ARRAY['https://images.unsplash.com/photo-1551038247-3d9af20df552']),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Musée Olympique', 'Temple du sport olympique avec vue sur le lac', 'Quai d''Ouchy 1, 1006 Lausanne', 46.5089, 6.6344, 'museum', 20, 40, true, ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475']),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Escaliers du Marché', 'Escalier historique couvert du 13e siècle', 'Escaliers du Marché, 1003 Lausanne', 46.5219, 6.6356, 'viewpoint', 10, 25, true, ARRAY['https://images.unsplash.com/photo-1449157291145-7efd050a4d0e']),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Château d''Ouchy', 'Ancien château médiéval transformé en hôtel de luxe', 'Place du Port 2, 1006 Lausanne', 46.5067, 6.6289, 'monument', 15, 35, true, ARRAY['https://images.unsplash.com/photo-1466442929976-97f336a657be']),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Fondation de l''Hermitage', 'Musée d''art dans un cadre exceptionnel', 'Route du Signal 2, 1018 Lausanne', 46.5311, 6.6489, 'museum', 20, 30, true, ARRAY['https://images.unsplash.com/photo-1497604401993-f2e922e5cb0a']),

-- Genève
((SELECT id FROM cities WHERE slug = 'geneve'), 'Jet d''eau', 'Symbole emblématique de Genève depuis 1886', 'Quai Gustave-Ador, 1207 Genève', 46.2067, 6.1556, 'landmark', 15, 50, true, ARRAY['https://images.unsplash.com/photo-1500375592092-40eb2168fd21']),
((SELECT id FROM cities WHERE slug = 'geneve'), 'Palais des Nations', 'Siège européen des Nations Unies', 'Avenue de la Paix 14, 1211 Genève', 46.2267, 6.1367, 'monument', 25, 40, true, ARRAY['https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a']),
((SELECT id FROM cities WHERE slug = 'geneve'), 'Cathédrale Saint-Pierre', 'Cathédrale historique au cœur de la vieille ville', 'Place du Bourg-de-Four 24, 1204 Genève', 46.2000, 6.1489, 'monument', 15, 30, true, ARRAY['https://images.unsplash.com/photo-1473091534298-04dcbce3278c']),
((SELECT id FROM cities WHERE slug = 'geneve'), 'Jardin Botanique', 'Oasis de verdure avec 16 000 espèces', 'Chemin de l''Impératrice 1, 1292 Chambésy', 46.2267, 6.1433, 'nature', 20, 45, true, ARRAY['https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07']),
((SELECT id FROM cities WHERE slug = 'geneve'), 'CERN', 'Centre de recherche nucléaire européen', 'Route de Meyrin 385, 1217 Meyrin', 46.2333, 6.0556, 'museum', 30, 60, true, ARRAY['https://images.unsplash.com/photo-1518005020951-eccb494ad742']),

-- Zurich
((SELECT id FROM cities WHERE slug = 'zurich'), 'Grossmünster', 'Église emblématique de Zurich avec ses tours jumelles', 'Grossmünsterplatz, 8001 Zürich', 47.3700, 8.5444, 'monument', 15, 30, true, ARRAY['https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace']),
((SELECT id FROM cities WHERE slug = 'zurich'), 'Bahnhofstrasse', 'Une des rues commerçantes les plus chères au monde', 'Bahnhofstrasse, 8001 Zürich', 47.3781, 8.5400, 'shopping', 10, 50, true, ARRAY['https://images.unsplash.com/photo-1487958449943-2429e8be8625']),
((SELECT id FROM cities WHERE slug = 'zurich'), 'Lac de Zurich', 'Promenade au bord du lac avec vue sur les Alpes', 'Seepromenade, 8001 Zürich', 47.3656, 8.5489, 'nature', 15, 40, true, ARRAY['https://images.unsplash.com/photo-1506744038136-46273834b3fb']),
((SELECT id FROM cities WHERE slug = 'zurich'), 'Musée national suisse', 'Histoire et culture de la Suisse', 'Museumstrasse 2, 8001 Zürich', 47.3789, 8.5400, 'museum', 20, 35, true, ARRAY['https://images.unsplash.com/photo-1496307653780-42ee777d4833']),

-- Berne
((SELECT id FROM cities WHERE slug = 'berne'), 'Zytglogge', 'Tour de l''horloge astronomique médiévale', 'Bim Zytglogge 1, 3011 Bern', 46.9481, 7.4481, 'monument', 15, 25, true, ARRAY['https://images.unsplash.com/photo-1431576901776-e539bd916ba2']),
((SELECT id FROM cities WHERE slug = 'berne'), 'Fosse aux ours', 'Parc des ours emblématiques de Berne', 'Grosser Muristalden 6, 3006 Bern', 46.9467, 7.4558, 'nature', 20, 40, true, ARRAY['https://images.unsplash.com/photo-1452378174528-3090a4bba7b2']),
((SELECT id FROM cities WHERE slug = 'berne'), 'Cathédrale de Berne', 'Plus haute cathédrale de Suisse', 'Münsterplatz 1, 3000 Bern', 46.9469, 7.4508, 'monument', 15, 30, true, ARRAY['https://images.unsplash.com/photo-1473091534298-04dcbce3278c']),

-- Montreux
((SELECT id FROM cities WHERE slug = 'montreux'), 'Château de Chillon', 'Château médiéval sur le lac Léman', 'Avenue de Chillon 21, 1820 Veytaux', 46.4144, 6.9272, 'monument', 25, 45, true, ARRAY['https://images.unsplash.com/photo-1466442929976-97f336a657be']),
((SELECT id FROM cities WHERE slug = 'montreux'), 'Statue de Freddie Mercury', 'Hommage au chanteur de Queen', 'Place du Marché, 1820 Montreux', 46.4312, 6.9123, 'landmark', 10, 20, true, ARRAY['https://images.unsplash.com/photo-1485833077593-4278bba3f11f']),
((SELECT id FROM cities WHERE slug = 'montreux'), 'Vignobles de Lavaux', 'Terrasses de vignes UNESCO', 'Route de la Corniche, 1071 Chexbres', 46.4789, 6.8333, 'nature', 20, 60, true, ARRAY['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9']),

-- Interlaken
((SELECT id FROM cities WHERE slug = 'interlaken'), 'Harder Kulm', 'Belvédère panoramique sur les Alpes', 'Harder Kulm, 3800 Interlaken', 46.6972, 7.8869, 'viewpoint', 25, 50, true, ARRAY['https://images.unsplash.com/photo-1469474968028-56623f02e42e']),
((SELECT id FROM cities WHERE slug = 'interlaken'), 'Lac de Thoune', 'Lac alpin avec vue sur l''Eiger', 'Seestrasse, 3800 Interlaken', 46.6889, 7.8581, 'nature', 15, 40, true, ARRAY['https://images.unsplash.com/photo-1500673922987-e212871fec22']),
((SELECT id FROM cities WHERE slug = 'interlaken'), 'Jungfraujoch', 'Top of Europe à 3454m d''altitude', 'Jungfraujoch, 3801 Kleine Scheidegg', 46.5475, 7.9856, 'viewpoint', 35, 100, true, ARRAY['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05']);

-- Création des parcours complets
INSERT INTO public.journeys (city_id, category_id, name, description, difficulty, estimated_duration, total_points, distance_km, is_predefined, is_active) VALUES
-- Lausanne
((SELECT id FROM cities WHERE slug = 'lausanne'), (SELECT id FROM journey_categories WHERE slug = 'patrimoine-unesco-lausanne'), 'Circuit Patrimoine Lausanne', 'Découverte du patrimoine architectural et culturel de Lausanne, de la cathédrale au musée olympique', 'easy', 120, 80, 3.5, true, true),
((SELECT id FROM cities WHERE slug = 'lausanne'), (SELECT id FROM journey_categories WHERE slug = 'vignobles-lavaux'), 'Randonnée Lavaux Premium', 'Parcours dans les vignobles en terrasses avec dégustation', 'medium', 180, 120, 8.2, true, true),
((SELECT id FROM cities WHERE slug = 'lausanne'), (SELECT id FROM journey_categories WHERE slug = 'street-art-lausanne'), 'Street Art Tour', 'Circuit artistique urbain dans les quartiers créatifs', 'easy', 90, 60, 2.8, true, true),

-- Genève
((SELECT id FROM cities WHERE slug = 'geneve'), (SELECT id FROM journey_categories WHERE slug = 'geneve-international'), 'Genève Diplomatique', 'Sur les traces des organisations internationales', 'medium', 150, 100, 5.5, true, true),
((SELECT id FROM cities WHERE slug = 'geneve'), (SELECT id FROM journey_categories WHERE slug = 'lac-jardins-geneve'), 'Promenade Lacustre', 'Tour du lac et des parcs genevois', 'easy', 120, 75, 4.2, true, true),

-- Zurich
((SELECT id FROM cities WHERE slug = 'zurich'), (SELECT id FROM journey_categories WHERE slug = 'vieille-ville-zurich'), 'Zurich Historique', 'Cœur historique et monuments emblématiques', 'easy', 105, 70, 3.0, true, true),
((SELECT id FROM cities WHERE slug = 'zurich'), (SELECT id FROM journey_categories WHERE slug = 'zurich-moderne'), 'Zurich Contemporain', 'Architecture moderne et innovation', 'medium', 135, 85, 4.5, true, true),

-- Berne
((SELECT id FROM cities WHERE slug = 'berne'), (SELECT id FROM journey_categories WHERE slug = 'centre-historique-berne'), 'Berne UNESCO', 'Centre historique classé au patrimoine mondial', 'easy', 120, 75, 2.5, true, true),

-- Montreux
((SELECT id FROM cities WHERE slug = 'montreux'), (SELECT id FROM journey_categories WHERE slug = 'riviera-chateaux'), 'Riviera Vaudoise', 'Châteaux et paysages du lac Léman', 'medium', 180, 110, 6.8, true, true),

-- Interlaken
((SELECT id FROM cities WHERE slug = 'interlaken'), (SELECT id FROM journey_categories WHERE slug = 'entre-deux-lacs'), 'Alpine Discovery', 'Découverte des lacs et sommets alpins', 'medium', 150, 95, 7.5, true, true);

-- Association des étapes aux parcours
INSERT INTO public.journey_steps (journey_id, step_id, step_order) VALUES
-- Circuit Patrimoine Lausanne
((SELECT id FROM journeys WHERE name = 'Circuit Patrimoine Lausanne'), (SELECT id FROM steps WHERE name = 'Cathédrale Notre-Dame'), 1),
((SELECT id FROM journeys WHERE name = 'Circuit Patrimoine Lausanne'), (SELECT id FROM steps WHERE name = 'Escaliers du Marché'), 2),
((SELECT id FROM journeys WHERE name = 'Circuit Patrimoine Lausanne'), (SELECT id FROM steps WHERE name = 'Château d''Ouchy'), 3),
((SELECT id FROM journeys WHERE name = 'Circuit Patrimoine Lausanne'), (SELECT id FROM steps WHERE name = 'Musée Olympique'), 4),
((SELECT id FROM journeys WHERE name = 'Circuit Patrimoine Lausanne'), (SELECT id FROM steps WHERE name = 'Fondation de l''Hermitage'), 5),

-- Genève Diplomatique  
((SELECT id FROM journeys WHERE name = 'Genève Diplomatique'), (SELECT id FROM steps WHERE name = 'Palais des Nations'), 1),
((SELECT id FROM journeys WHERE name = 'Genève Diplomatique'), (SELECT id FROM steps WHERE name = 'CERN'), 2),
((SELECT id FROM journeys WHERE name = 'Genève Diplomatique'), (SELECT id FROM steps WHERE name = 'Cathédrale Saint-Pierre'), 3),
((SELECT id FROM journeys WHERE name = 'Genève Diplomatique'), (SELECT id FROM steps WHERE name = 'Jet d''eau'), 4),

-- Promenade Lacustre Genève
((SELECT id FROM journeys WHERE name = 'Promenade Lacustre'), (SELECT id FROM steps WHERE name = 'Jet d''eau'), 1),
((SELECT id FROM journeys WHERE name = 'Promenade Lacustre'), (SELECT id FROM steps WHERE name = 'Jardin Botanique'), 2),
((SELECT id FROM journeys WHERE name = 'Promenade Lacustre'), (SELECT id FROM steps WHERE name = 'Cathédrale Saint-Pierre'), 3),

-- Zurich Historique
((SELECT id FROM journeys WHERE name = 'Zurich Historique'), (SELECT id FROM steps WHERE name = 'Grossmünster'), 1),
((SELECT id FROM journeys WHERE name = 'Zurich Historique'), (SELECT id FROM steps WHERE name = 'Bahnhofstrasse'), 2),
((SELECT id FROM journeys WHERE name = 'Zurich Historique'), (SELECT id FROM steps WHERE name = 'Musée national suisse'), 3),
((SELECT id FROM journeys WHERE name = 'Zurich Historique'), (SELECT id FROM steps WHERE name = 'Lac de Zurich'), 4),

-- Berne UNESCO
((SELECT id FROM journeys WHERE name = 'Berne UNESCO'), (SELECT id FROM steps WHERE name = 'Zytglogge'), 1),
((SELECT id FROM journeys WHERE name = 'Berne UNESCO'), (SELECT id FROM steps WHERE name = 'Cathédrale de Berne'), 2),
((SELECT id FROM journeys WHERE name = 'Berne UNESCO'), (SELECT id FROM steps WHERE name = 'Fosse aux ours'), 3),

-- Riviera Vaudoise
((SELECT id FROM journeys WHERE name = 'Riviera Vaudoise'), (SELECT id FROM steps WHERE name = 'Château de Chillon'), 1),
((SELECT id FROM journeys WHERE name = 'Riviera Vaudoise'), (SELECT id FROM steps WHERE name = 'Vignobles de Lavaux'), 2),
((SELECT id FROM journeys WHERE name = 'Riviera Vaudoise'), (SELECT id FROM steps WHERE name = 'Statue de Freddie Mercury'), 3),

-- Alpine Discovery
((SELECT id FROM journeys WHERE name = 'Alpine Discovery'), (SELECT id FROM steps WHERE name = 'Harder Kulm'), 1),
((SELECT id FROM journeys WHERE name = 'Alpine Discovery'), (SELECT id FROM steps WHERE name = 'Lac de Thoune'), 2),
((SELECT id FROM journeys WHERE name = 'Alpine Discovery'), (SELECT id FROM steps WHERE name = 'Jungfraujoch'), 3);

-- Création des partenaires par ville
INSERT INTO public.partners (city_id, name, category, description, address, latitude, longitude, phone, email, website, logo_url, is_active) VALUES
-- Lausanne
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Restaurant La Table d''Edgard', 'restaurant', 'Cuisine gastronomique suisse contemporaine', 'Avenue des Bergières 1, 1004 Lausanne', 46.5167, 6.6333, '+41 21 613 33 00', 'info@edgard.ch', 'https://edgard.ch', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9', true),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Hôtel des Bergues', 'hotel', 'Hôtel de luxe au cœur de Lausanne', 'Rue du Grand-Pont 9, 1003 Lausanne', 46.5200, 6.6350, '+41 21 331 31 31', 'info@bergues.ch', 'https://bergues-lausanne.ch', 'https://images.unsplash.com/photo-1721322800607-8c38375eef04', true),
((SELECT id FROM cities WHERE slug = 'lausanne'), 'Boutique Chocolats Läderach', 'shop', 'Chocolaterie artisanale suisse premium', 'Place Saint-François 14, 1003 Lausanne', 46.5189, 6.6356, '+41 21 312 45 67', 'lausanne@laderach.com', 'https://laderach.com', 'https://images.unsplash.com/photo-1582562124811-c09040d0a901', true),

-- Genève  
((SELECT id FROM cities WHERE slug = 'geneve'), 'Restaurant Bayview', 'restaurant', 'Restaurant gastronomique avec vue sur le lac', 'Quai du Mont-Blanc 19, 1201 Genève', 46.2089, 6.1467, '+41 22 906 66 66', 'bayview@president-wilson.com', 'https://bayview.ch', 'https://images.unsplash.com/photo-1517022812141-23620dba5c23', true),
((SELECT id FROM cities WHERE slug = 'geneve'), 'Patek Philippe Museum', 'museum', 'Musée de l''horlogerie de prestige', 'Rue des Vieux-Grenadiers 7, 1205 Genève', 46.1956, 6.1378, '+41 22 807 09 10', 'museum@patek.com', 'https://patekmuseum.com', 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9', true),
((SELECT id FROM cities WHERE slug = 'geneve'), 'Manor Genève', 'shop', 'Grand magasin suisse', 'Rue de Cornavin 6, 1201 Genève', 46.2106, 6.1425, '+41 22 909 44 44', 'geneve@manor.ch', 'https://manor.ch', 'https://images.unsplash.com/photo-1527576539890-dfa815648363', true),

-- Zurich
((SELECT id FROM cities WHERE slug = 'zurich'), 'Restaurant Kronenhalle', 'restaurant', 'Institution gastronomique zurichoise depuis 1924', 'Rämistrasse 4, 8001 Zürich', 47.3697, 8.5486, '+41 44 262 99 00', 'info@kronenhalle.com', 'https://kronenhalle.com', 'https://images.unsplash.com/photo-1498936178812-4b2e558d2937', true),
((SELECT id FROM cities WHERE slug = 'zurich'), 'Sprüngli Confiserie', 'shop', 'Confiserie traditionnelle et macarons Luxemburgerli', 'Bahnhofstrasse 21, 8001 Zürich', 47.3758, 8.5403, '+41 44 224 47 47', 'info@spruengli.ch', 'https://spruengli.ch', 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1', true),
((SELECT id FROM cities WHERE slug = 'zurich'), 'Widder Hotel', 'hotel', 'Hôtel boutique dans la vieille ville', 'Rennweg 7, 8001 Zürich', 47.3719, 8.5422, '+41 44 224 25 26', 'info@widderhotel.ch', 'https://widderhotel.ch', 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b', true),

-- Berne
((SELECT id FROM cities WHERE slug = 'berne'), 'Restaurant Meridiano', 'restaurant', 'Cuisine méditerranéenne raffinée', 'Marktgasse 17, 3011 Bern', 46.9481, 7.4475, '+41 31 311 11 42', 'info@meridiano.ch', 'https://meridiano-bern.ch', 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac', true),
((SELECT id FROM cities WHERE slug = 'berne'), 'Hotel Schweizerhof', 'hotel', 'Hôtel historique face à la gare', 'Bahnhofplatz 11, 3001 Bern', 46.9489, 7.4397, '+41 31 326 80 80', 'info@schweizerhof-bern.ch', 'https://schweizerhof-bern.ch', 'https://images.unsplash.com/photo-1441057206919-63d19fac2369', true),

-- Montreux
((SELECT id FROM cities WHERE slug = 'montreux'), 'Restaurant Le Pont de Brent', 'restaurant', 'Restaurant gastronomique étoilé Michelin', 'Route de Blonay 4, 1817 Brent', 46.4556, 6.9444, '+41 21 964 52 30', 'info@lepontdebrent.com', 'https://lepontdebrent.com', 'https://images.unsplash.com/photo-1485833077593-4278bba3f11f', true),
((SELECT id FROM cities WHERE slug = 'montreux'), 'Fairmont Le Montreux Palace', 'hotel', 'Palace historique sur les rives du lac Léman', 'Avenue Claude Nobs 2, 1820 Montreux', 46.4278, 6.9156, '+41 21 962 12 12', 'montreux@fairmont.com', 'https://fairmont.com/montreux', 'https://images.unsplash.com/photo-1469041797191-50ace28483c3', true),

-- Interlaken
((SELECT id FROM cities WHERE slug = 'interlaken'), 'Restaurant Taverne', 'restaurant', 'Spécialités suisses traditionnelles', 'Jungfraustrasse 18, 3800 Interlaken', 46.6847, 7.8639, '+41 33 822 28 28', 'info@taverne-interlaken.ch', 'https://taverne-interlaken.ch', 'https://images.unsplash.com/photo-1452960962994-acf4fd70b632', true),
((SELECT id FROM cities WHERE slug = 'interlaken'), 'Hotel Victoria Jungfrau', 'hotel', 'Grand hôtel avec vue sur les Alpes', 'Höheweg 41, 3800 Interlaken', 46.6856, 7.8672, '+41 33 828 28 28', 'info@victoria-jungfrau.ch', 'https://victoria-jungfrau.ch', 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2', true);

-- Création des récompenses
INSERT INTO public.rewards (partner_id, type, title, description, points_required, value_chf, max_redemptions, terms_conditions, is_active, image_url) VALUES
-- Lausanne
((SELECT id FROM partners WHERE name = 'Restaurant La Table d''Edgard'), 'discount', 'Réduction 15% - Menu découverte', 'Réduction de 15% sur le menu découverte (hors boissons)', 150, 25.00, 50, 'Valable du lundi au jeudi. Réservation obligatoire. Non cumulable.', true, 'https://images.unsplash.com/photo-1517022812141-23620dba5c23'),
((SELECT id FROM partners WHERE name = 'Hôtel des Bergues'), 'upgrade', 'Surclassement chambre gratuit', 'Surclassement gratuit selon disponibilité', 300, 100.00, 20, 'Sous réserve de disponibilité. Valable week-end uniquement.', true, 'https://images.unsplash.com/photo-1721322800607-8c38375eef04'),
((SELECT id FROM partners WHERE name = 'Boutique Chocolats Läderach'), 'gift', 'Boîte de chocolats offerte', 'Boîte de 12 chocolats artisanaux offerte', 100, 15.00, 100, 'Une utilisation par personne. Non remboursable.', true, 'https://images.unsplash.com/photo-1582562124811-c09040d0a901'),

-- Genève
((SELECT id FROM partners WHERE name = 'Restaurant Bayview'), 'discount', 'Menu dégustation -20%', 'Réduction de 20% sur le menu dégustation 7 services', 400, 80.00, 30, 'Réservation 48h à l''avance. Valable soir uniquement.', true, 'https://images.unsplash.com/photo-1517022812141-23620dba5c23'),
((SELECT id FROM partners WHERE name = 'Patek Philippe Museum'), 'gift', 'Visite guidée privée', 'Visite guidée privée avec horloger expert', 250, 50.00, 10, 'Sur rendez-vous uniquement. Durée 1h30.', true, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9'),
((SELECT id FROM partners WHERE name = 'Manor Genève'), 'voucher', 'Bon d''achat 20 CHF', 'Bon d''achat valable dans tous les rayons', 120, 20.00, 200, 'Valable 6 mois. Non fractionnable.', true, 'https://images.unsplash.com/photo-1527576539890-dfa815648363'),

-- Zurich
((SELECT id FROM partners WHERE name = 'Restaurant Kronenhalle'), 'experience', 'Dîner avec visite art', 'Dîner gastronomique + visite collection d''art', 500, 150.00, 15, 'Menu fixe uniquement. Réservation obligatoire.', true, 'https://images.unsplash.com/photo-1498936178812-4b2e558d2937'),
((SELECT id FROM partners WHERE name = 'Sprüngli Confiserie'), 'gift', 'Assortiment Luxemburgerli', 'Boîte de 18 macarons Luxemburgerli', 80, 12.00, 150, 'À consommer dans les 3 jours. Frais uniquement.', true, 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1'),
((SELECT id FROM partners WHERE name = 'Widder Hotel'), 'upgrade', 'Suite avec champagne', 'Surclassement suite + bouteille de champagne', 600, 200.00, 5, 'Week-end uniquement. Séjour minimum 2 nuits.', true, 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b'),

-- Berne
((SELECT id FROM partners WHERE name = 'Restaurant Meridiano'), 'discount', 'Menu méditerranéen -25%', 'Réduction sur le menu dégustation méditerranéen', 200, 40.00, 40, 'Du mardi au jeudi. Boissons en sus.', true, 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac'),
((SELECT id FROM partners WHERE name = 'Hotel Schweizerhof'), 'experience', 'Petit-déjeuner panoramique', 'Petit-déjeuner sur la terrasse avec vue sur les Alpes', 180, 35.00, 25, 'Selon météo. Réservation la veille.', true, 'https://images.unsplash.com/photo-1441057206919-63d19fac2369'),

-- Montreux
((SELECT id FROM partners WHERE name = 'Restaurant Le Pont de Brent'), 'experience', 'Menu dégustation sommelier', 'Menu 9 services avec accords vins du sommelier', 800, 300.00, 8, 'Réservation 1 semaine à l''avance. Soir uniquement.', true, 'https://images.unsplash.com/photo-1485833077593-4278bba3f11f'),
((SELECT id FROM partners WHERE name = 'Fairmont Le Montreux Palace'), 'spa', 'Accès spa + massage', 'Journée spa avec massage relaxant 50min', 450, 180.00, 12, 'Réservation spa obligatoire. Valable semaine.', true, 'https://images.unsplash.com/photo-1469041797191-50ace28483c3'),

-- Interlaken
((SELECT id FROM partners WHERE name = 'Restaurant Taverne'), 'fondue', 'Fondue complète pour 2', 'Fondue traditionnelle avec accompagnements pour 2 personnes', 160, 30.00, 60, 'Soir uniquement. Réservation conseillée.', true, 'https://images.unsplash.com/photo-1452960962994-acf4fd70b632'),
((SELECT id FROM partners WHERE name = 'Hotel Victoria Jungfrau'), 'adventure', 'Package aventure Alpes', 'Nuitée + activité au choix (parapente, rafting)', 700, 250.00, 10, 'Selon conditions météo. Assurance incluse.', true, 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2');