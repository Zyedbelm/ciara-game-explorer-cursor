-- Comprehensive Test Data for CIARA Game Explorer
-- This file contains realistic test data for all entities in the database
-- It includes cities, journeys, steps, partners, rewards, and supporting data

-- ============================
-- 1. CITIES (Tourist Destinations)
-- ============================

-- Clear existing test data to avoid conflicts
DELETE FROM public.reward_redemptions;
DELETE FROM public.step_completions;
DELETE FROM public.user_journey_progress;
DELETE FROM public.rewards;
DELETE FROM public.partners;
DELETE FROM public.quiz_questions;
DELETE FROM public.journey_steps;
DELETE FROM public.journeys;
DELETE FROM public.journey_categories;
DELETE FROM public.steps;
DELETE FROM public.content_documents WHERE step_id IS NOT NULL;
DELETE FROM public.cities WHERE slug != 'sion'; -- Keep Sion as it might be used elsewhere

-- Add comprehensive cities data
INSERT INTO public.cities (name, slug, description, country, latitude, longitude, timezone, logo_url, primary_color, secondary_color, supported_languages, default_language, subscription_plan, subscription_active) VALUES
('Lausanne', 'lausanne', 'Capitale olympique nichée entre lac et vignobles, Lausanne séduit par son patrimoine gothique et ses quartiers animés', 'Switzerland', 46.5197, 6.6323, 'Europe/Zurich', 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=200', '#C41E3A', '#FFD700', ARRAY['fr', 'en', 'de'], 'fr', 'premium', true),
('Montreux', 'montreux', 'Perle de la Riviera suisse, célèbre pour son festival de jazz et son château de Chillon', 'Switzerland', 46.4312, 6.9123, 'Europe/Zurich', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', '#1E3A8A', '#F59E0B', ARRAY['fr', 'en', 'de'], 'fr', 'premium', true),
('Gruyères', 'gruyeres', 'Village médiéval authentique au cœur des Préalpes, berceau du célèbre fromage', 'Switzerland', 46.5833, 7.0833, 'Europe/Zurich', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200', '#059669', '#DC2626', ARRAY['fr', 'en', 'de'], 'fr', 'standard', true),
('Zermatt', 'zermatt', 'Station alpine mythique dominée par le Cervin, paradis des randonneurs et skieurs', 'Switzerland', 46.0207, 7.7491, 'Europe/Zurich', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', '#7C3AED', '#F97316', ARRAY['fr', 'en', 'de'], 'fr', 'premium', true),
('Lucerne', 'lucerne', 'Ville pittoresque au bord du lac des Quatre-Cantons, avec ses ponts couverts historiques', 'Switzerland', 47.0502, 8.3093, 'Europe/Zurich', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', '#0EA5E9', '#EF4444', ARRAY['fr', 'en', 'de'], 'fr', 'premium', true);

-- ============================
-- 2. JOURNEY CATEGORIES
-- ============================

-- Create journey categories for each city
INSERT INTO public.journey_categories (city_id, name, slug, description, icon, color, type, difficulty, estimated_duration) 
SELECT 
  c.id,
  cat.name,
  cat.slug,
  cat.description,
  cat.icon,
  cat.color,
  cat.type::journey_type,
  cat.difficulty::journey_difficulty,
  cat.estimated_duration
FROM public.cities c
CROSS JOIN (VALUES
  ('Patrimoine Historique', 'patrimoine-historique', 'Découvrez les monuments et sites historiques incontournables', 'Castle', '#8B5CF6', 'museums', 'medium', 180),
  ('Gastronomie Locale', 'gastronomie-locale', 'Savourez les spécialités culinaires et produits du terroir', 'UtensilsCrossed', '#F59E0B', 'gastronomy', 'easy', 120),
  ('Nature et Paysages', 'nature-paysages', 'Explorez les beautés naturelles et panoramas exceptionnels', 'Trees', '#10B981', 'nature', 'medium', 150),
  ('Art et Culture', 'art-culture', 'Immergez-vous dans l\'art local et les traditions culturelles', 'Palette', '#EC4899', 'art_culture', 'easy', 90),
  ('Aventure Active', 'aventure-active', 'Activités sportives et défis pour les aventuriers', 'Mountain', '#EF4444', 'adventure', 'hard', 240)
) AS cat(name, slug, description, icon, color, type, difficulty, estimated_duration)
WHERE c.slug != 'sion'; -- Skip Sion as it may already have categories

-- ============================
-- 3. STEPS (Points of Interest)
-- ============================

-- Steps for Lausanne
INSERT INTO public.steps (city_id, name, description, latitude, longitude, address, type, images, points_awarded, has_quiz, is_active) 
SELECT 
  c.id,
  step.name,
  step.description,
  step.latitude,
  step.longitude,
  step.address,
  step.type::step_type,
  step.images::text[],
  step.points_awarded,
  step.has_quiz,
  true
FROM public.cities c
CROSS JOIN (VALUES
  ('Cathédrale Notre-Dame', 'Chef-d\'œuvre gothique du 13e siècle, l\'une des plus belles cathédrales de Suisse', 46.5220, 6.6356, 'Place de la Cathédrale, 1005 Lausanne', 'monument', ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600'], 25, true),
  ('Château Saint-Maire', 'Château médiéval du 14e siècle, siège du gouvernement vaudois', 46.5210, 6.6350, 'Place du Château, 1014 Lausanne', 'monument', ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'], 20, true),
  ('Musée Olympique', 'Temple du sport mondial avec collections uniques sur l\'histoire olympique', 46.5088, 6.6356, 'Quai d\'Ouchy 1, 1006 Lausanne', 'museum', ARRAY['https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600'], 30, true),
  ('Port d\'Ouchy', 'Port historique sur le Lac Léman avec vue sur les Alpes', 46.5088, 6.6270, 'Place de la Navigation, 1006 Lausanne', 'viewpoint', ARRAY['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600'], 15, true),
  ('Palais de Rumine', 'Palais néo-Renaissance abritant plusieurs musées', 46.5197, 6.6323, 'Place de la Riponne 6, 1014 Lausanne', 'museum', ARRAY['https://images.unsplash.com/photo-1562813733-b31f71025d54?w=600'], 20, true),
  ('Place de la Palud', 'Place historique avec fontaine de la Justice et marché hebdomadaire', 46.5197, 6.6323, 'Place de la Palud, 1003 Lausanne', 'landmark', ARRAY['https://images.unsplash.com/photo-1555993539-1732b0258235?w=600'], 15, true),
  ('Escaliers du Marché', 'Escalier couvert du 13e siècle reliant la ville basse à la cathédrale', 46.5210, 6.6340, 'Escaliers du Marché, 1003 Lausanne', 'landmark', ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'], 10, true),
  ('Tour de Sauvabelin', 'Tour d\'observation en bois offrant une vue panoramique', 46.5315, 6.6415, 'Av. de Sauvabelin, 1018 Lausanne', 'viewpoint', ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'], 20, true)
) AS step(name, description, latitude, longitude, address, type, images, points_awarded, has_quiz)
WHERE c.slug = 'lausanne';

-- Steps for Montreux
INSERT INTO public.steps (city_id, name, description, latitude, longitude, address, type, images, points_awarded, has_quiz, is_active) 
SELECT 
  c.id,
  step.name,
  step.description,
  step.latitude,
  step.longitude,
  step.address,
  step.type::step_type,
  step.images::text[],
  step.points_awarded,
  step.has_quiz,
  true
FROM public.cities c
CROSS JOIN (VALUES
  ('Château de Chillon', 'Forteresse médiévale sur un îlot rocheux du Lac Léman', 46.4143, 6.9270, 'Avenue de Chillon 21, 1820 Veytaux', 'monument', ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600'], 35, true),
  ('Marché de Montreux', 'Marché traditionnel avec produits locaux et artisanat', 46.4312, 6.9123, 'Place du Marché, 1820 Montreux', 'activity', ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600'], 15, true),
  ('Promenade des Anglais', 'Promenade bordée de palmiers le long du lac', 46.4312, 6.9100, 'Quai du Léman, 1820 Montreux', 'viewpoint', ARRAY['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600'], 10, true),
  ('Auditorium Stravinski', 'Salle de concert mythique du Montreux Jazz Festival', 46.4280, 6.9140, 'Rue du Théâtre 9, 1820 Montreux', 'landmark', ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600'], 20, true),
  ('Statue de Freddie Mercury', 'Monument dédié au célèbre chanteur de Queen', 46.4312, 6.9110, 'Place du Marché, 1820 Montreux', 'landmark', ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600'], 15, true),
  ('Rochers-de-Naye', 'Sommet accessible par train à crémaillère avec vue panoramique', 46.4312, 6.9800, 'Gare de Montreux, 1820 Montreux', 'viewpoint', ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'], 30, true)
) AS step(name, description, latitude, longitude, address, type, images, points_awarded, has_quiz)
WHERE c.slug = 'montreux';

-- Steps for Gruyères
INSERT INTO public.steps (city_id, name, description, latitude, longitude, address, type, images, points_awarded, has_quiz, is_active) 
SELECT 
  c.id,
  step.name,
  step.description,
  step.latitude,
  step.longitude,
  step.address,
  step.type::step_type,
  step.images::text[],
  step.points_awarded,
  step.has_quiz,
  true
FROM public.cities c
CROSS JOIN (VALUES
  ('Château de Gruyères', 'Château médiéval avec collections d\'art et histoire', 46.5833, 7.0833, 'Rue du Château 8, 1663 Gruyères', 'monument', ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'], 30, true),
  ('Maison du Gruyère', 'Fromagerie artisanale où naît le célèbre fromage', 46.5860, 7.0840, 'Place de la Gare 3, 1663 Gruyères', 'activity', ARRAY['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600'], 25, true),
  ('Rue du Bourg', 'Rue pavée médiévale bordée de maisons historiques', 46.5833, 7.0830, 'Rue du Bourg, 1663 Gruyères', 'landmark', ARRAY['https://images.unsplash.com/photo-1555993539-1732b0258235?w=600'], 15, true),
  ('Église Saint-Théodule', 'Église gothique du 13e siècle avec vitraux remarquables', 46.5835, 7.0835, 'Place de l\'Église, 1663 Gruyères', 'monument', ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'], 20, true),
  ('Musée HR Giger', 'Musée dédié à l\'artiste suisse créateur d\'Alien', 46.5833, 7.0833, 'Château St-Germain, 1663 Gruyères', 'museum', ARRAY['https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600'], 25, true)
) AS step(name, description, latitude, longitude, address, type, images, points_awarded, has_quiz)
WHERE c.slug = 'gruyeres';

-- Steps for Zermatt
INSERT INTO public.steps (city_id, name, description, latitude, longitude, address, type, images, points_awarded, has_quiz, is_active) 
SELECT 
  c.id,
  step.name,
  step.description,
  step.latitude,
  step.longitude,
  step.address,
  step.type::step_type,
  step.images::text[],
  step.points_awarded,
  step.has_quiz,
  true
FROM public.cities c
CROSS JOIN (VALUES
  ('Matterhorn Museum', 'Musée retraçant l\'histoire de l\'alpinisme et du Cervin', 46.0207, 7.7491, 'Kirchplatz 11, 3920 Zermatt', 'museum', ARRAY['https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600'], 25, true),
  ('Bahnhofstrasse', 'Rue principale piétonne avec boutiques et restaurants', 46.0207, 7.7491, 'Bahnhofstrasse, 3920 Zermatt', 'landmark', ARRAY['https://images.unsplash.com/photo-1555993539-1732b0258235?w=600'], 10, true),
  ('Gornergrat', 'Sommet accessible par train avec vue sur le Cervin', 46.0207, 7.7800, 'Gornergrat, 3920 Zermatt', 'viewpoint', ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'], 40, true),
  ('Sunnegga', 'Terrasse panoramique accessible par funiculaire', 46.0300, 7.7500, 'Sunnegga, 3920 Zermatt', 'viewpoint', ARRAY['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600'], 30, true),
  ('Église anglaise', 'Église historique du 19e siècle', 46.0207, 7.7491, 'Kirchweg 2, 3920 Zermatt', 'monument', ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'], 15, true)
) AS step(name, description, latitude, longitude, address, type, images, points_awarded, has_quiz)
WHERE c.slug = 'zermatt';

-- Steps for Lucerne
INSERT INTO public.steps (city_id, name, description, latitude, longitude, address, type, images, points_awarded, has_quiz, is_active) 
SELECT 
  c.id,
  step.name,
  step.description,
  step.latitude,
  step.longitude,
  step.address,
  step.type::step_type,
  step.images::text[],
  step.points_awarded,
  step.has_quiz,
  true
FROM public.cities c
CROSS JOIN (VALUES
  ('Pont de la Chapelle', 'Pont couvert en bois du 14e siècle avec peintures historiques', 47.0502, 8.3093, 'Kapellbrücke, 6004 Lucerne', 'monument', ARRAY['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600'], 25, true),
  ('Tour de l\'Eau', 'Tour octogonale du 13e siècle, symbole de Lucerne', 47.0500, 8.3095, 'Kapellbrücke, 6004 Lucerne', 'monument', ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'], 20, true),
  ('Lion de Lucerne', 'Monument taillé dans la roche en mémoire des Gardes suisses', 47.0570, 8.3090, 'Denkmalstrasse 4, 6006 Lucerne', 'monument', ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'], 30, true),
  ('Vieille Ville', 'Centre historique avec maisons à fresques colorées', 47.0502, 8.3093, 'Altstadt, 6004 Lucerne', 'landmark', ARRAY['https://images.unsplash.com/photo-1555993539-1732b0258235?w=600'], 15, true),
  ('Mont Pilatus', 'Sommet accessible par le train à crémaillère le plus raide du monde', 47.0502, 8.2500, 'Pilatus, 6010 Kriens', 'viewpoint', ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'], 40, true)
) AS step(name, description, latitude, longitude, address, type, images, points_awarded, has_quiz)
WHERE c.slug = 'lucerne';

-- ============================
-- 4. JOURNEYS
-- ============================

-- Create journeys for each city and category combination
INSERT INTO public.journeys (city_id, category_id, name, description, difficulty, estimated_duration, distance_km, total_points, is_active, is_predefined, image_url)
SELECT 
  jc.city_id,
  jc.id,
  journey_templates.name,
  journey_templates.description,
  jc.difficulty,
  jc.estimated_duration,
  journey_templates.distance_km,
  journey_templates.total_points,
  true,
  true,
  journey_templates.image_url
FROM public.journey_categories jc
CROSS JOIN (VALUES
  ('Découverte Essentielle', 'Parcours complet des incontournables pour une première visite', 3.5, 150, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'),
  ('Exploration Approfondie', 'Parcours détaillé pour les curieux souhaitant tout connaître', 5.2, 220, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800')
) AS journey_templates(name, description, distance_km, total_points, image_url)
WHERE jc.city_id IN (SELECT id FROM public.cities WHERE slug != 'sion');

-- ============================
-- 5. JOURNEY STEPS (Link journeys to steps)
-- ============================

-- Create journey-step relationships
WITH journey_step_mapping AS (
  SELECT 
    j.id as journey_id,
    s.id as step_id,
    ROW_NUMBER() OVER (PARTITION BY j.id ORDER BY s.points_awarded DESC, s.name) as step_order
  FROM public.journeys j
  JOIN public.steps s ON j.city_id = s.city_id
  WHERE j.city_id IN (SELECT id FROM public.cities WHERE slug != 'sion')
)
INSERT INTO public.journey_steps (journey_id, step_id, step_order)
SELECT journey_id, step_id, step_order
FROM journey_step_mapping
WHERE step_order <= 6; -- Limit to 6 steps per journey

-- ============================
-- 6. PARTNERS
-- ============================

-- Create partners for each city
INSERT INTO public.partners (city_id, name, category, description, address, phone, email, website, latitude, longitude, is_active, logo_url, images)
SELECT 
  c.id,
  partner_data.name,
  partner_data.category,
  partner_data.description,
  partner_data.address,
  partner_data.phone,
  partner_data.email,
  partner_data.website,
  c.latitude + partner_data.lat_offset,
  c.longitude + partner_data.lng_offset,
  true,
  partner_data.logo_url,
  partner_data.images::text[]
FROM public.cities c
CROSS JOIN (VALUES
  ('Hôtel Beau Séjour', 'hotel', 'Hôtel de charme avec vue panoramique et service personnalisé', 'Place de la Gare 12', '+41 21 555 0123', 'info@beausejourhotel.ch', 'www.beausejourhotel.ch', 0.0010, 0.0015, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600']),
  ('Restaurant du Terroir', 'restaurant', 'Cuisine traditionnelle avec produits locaux et spécialités régionales', 'Rue de la Poste 25', '+41 21 555 0456', 'bonjour@terroir-restaurant.ch', 'www.terroir-restaurant.ch', -0.0015, 0.0010, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600']),
  ('Boutique Artisanale', 'commerce', 'Produits artisanaux locaux, souvenirs authentiques et créations uniques', 'Avenue Central 8', '+41 21 555 0789', 'contact@boutique-artisanale.ch', 'www.boutique-artisanale.ch', 0.0020, -0.0005, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600']),
  ('Café des Amis', 'restaurant', 'Café convivial avec terrasse ensoleillée et pâtisseries maison', 'Place du Marché 3', '+41 21 555 0321', 'hello@cafedesamis.ch', 'www.cafedesamis.ch', -0.0008, 0.0012, 'https://images.unsplash.com/photo-1501747315-3aa946dd12d6?w=400', ARRAY['https://images.unsplash.com/photo-1501747315-3aa946dd12d6?w=600', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600']),
  ('Spa Bien-être', 'wellness', 'Centre de bien-être avec soins relaxants et massages thérapeutiques', 'Chemin de la Sérénité 15', '+41 21 555 0654', 'info@spa-bienetre.ch', 'www.spa-bienetre.ch', 0.0012, -0.0018, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', ARRAY['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600']),
  ('Activités Aventure', 'loisir', 'Activités outdoor : randonnées guidées, sports d\'aventure et excursions', 'Rue de l\'Aventure 7', '+41 21 555 0987', 'aventure@activites-outdoor.ch', 'www.activites-outdoor.ch', 0.0025, 0.0008, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400', ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'])
) AS partner_data(name, category, description, address, phone, email, website, lat_offset, lng_offset, logo_url, images)
WHERE c.slug != 'sion';

-- ============================
-- 7. REWARDS
-- ============================

-- Create rewards for each partner
INSERT INTO public.rewards (partner_id, title, description, type, value_chf, points_required, terms_conditions, is_active, image_url, max_redemptions)
SELECT 
  p.id,
  reward_data.title,
  reward_data.description,
  reward_data.type::reward_type,
  reward_data.value_chf,
  reward_data.points_required,
  reward_data.terms_conditions,
  true,
  reward_data.image_url,
  reward_data.max_redemptions
FROM public.partners p
CROSS JOIN (VALUES
  ('Réduction 15%', 'Bénéficiez de 15% de réduction sur votre facture totale', 'discount', 25.0, 150, 'Valable 60 jours à partir de la date d\'activation. Non cumulable avec d\'autres offres.', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', 200),
  ('Cadeau de Bienvenue', 'Recevez un petit cadeau surprise lors de votre première visite', 'free_item', 8.0, 100, 'Un cadeau par personne, valable pour les nouveaux clients uniquement.', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400', 100),
  ('Surclassement Gratuit', 'Profitez d\'un surclassement gratuit selon disponibilité', 'upgrade', 50.0, 300, 'Sous réserve de disponibilité. Valable uniquement sur réservation directe.', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', 50),
  ('Expérience Exclusive', 'Vivez une expérience unique réservée aux visiteurs fidèles', 'experience', 75.0, 500, 'Activité spéciale d\'une durée de 2 heures. Réservation obligatoire 48h à l\'avance.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 25)
) AS reward_data(title, description, type, value_chf, points_required, terms_conditions, image_url, max_redemptions)
WHERE p.city_id IN (SELECT id FROM public.cities WHERE slug != 'sion');

-- ============================
-- 8. QUIZ QUESTIONS
-- ============================

-- Create quiz questions for all steps
INSERT INTO public.quiz_questions (step_id, question, question_type, options, correct_answer, explanation, points_awarded, bonus_points)
SELECT 
  s.id,
  quiz_data.question,
  quiz_data.question_type,
  quiz_data.options::jsonb,
  quiz_data.correct_answer,
  quiz_data.explanation,
  quiz_data.points_awarded,
  quiz_data.bonus_points
FROM public.steps s
CROSS JOIN (VALUES
  ('Quelle est la principale caractéristique architecturale de ce monument ?', 'multiple_choice', '["Style gothique", "Style roman", "Style baroque", "Style renaissance"]', 'Style gothique', 'La plupart des monuments historiques suisses présentent des éléments gothiques caractéristiques du Moyen Âge.', 15, 10),
  ('En quelle période ce lieu a-t-il été construit ?', 'multiple_choice', '["13e-14e siècle", "15e-16e siècle", "17e-18e siècle", "19e-20e siècle"]', '13e-14e siècle', 'La majorité des monuments historiques suisses datent du Moyen Âge tardif.', 10, 5),
  ('Vrai ou Faux : Ce lieu est classé monument historique ?', 'true_false', '["Vrai", "Faux"]', 'Vrai', 'Ce site fait partie du patrimoine historique protégé de la région.', 10, 5)
) AS quiz_data(question, question_type, options, correct_answer, explanation, points_awarded, bonus_points)
WHERE s.city_id IN (SELECT id FROM public.cities WHERE slug != 'sion')
AND s.has_quiz = true;

-- ============================
-- 9. CONTENT DOCUMENTS
-- ============================

-- Create content documents for all steps to feed the AI chat
INSERT INTO public.content_documents (step_id, city_id, title, content, document_type, language)
SELECT 
  s.id,
  s.city_id,
  'Guide Historique - ' || s.name,
  CASE 
    WHEN s.type = 'monument' THEN 
      'HISTOIRE ET ARCHITECTURE

Ce monument historique représente un témoignage exceptionnel de l''architecture médiévale suisse. Construit entre le 13e et le 14e siècle, il illustre parfaitement les techniques de construction de l''époque.

CARACTÉRISTIQUES ARCHITECTURALES
- Style gothique avec influences locales
- Matériaux : pierre calcaire locale et bois de chêne
- Éléments décoratifs typiques de la région
- Conservation remarquable des éléments d''origine

IMPORTANCE CULTURELLE
Ce site a joué un rôle central dans l''histoire locale et continue d''être un lieu de mémoire important pour la communauté. Il témoigne de la richesse culturelle et historique de la région.

CONSEILS DE VISITE
- Meilleure période : toute l''année
- Durée recommandée : 30-45 minutes
- Accessibilité : partiellement accessible
- Photographie autorisée dans certaines zones'

    WHEN s.type = 'museum' THEN 
      'COLLECTIONS ET EXPOSITIONS

Ce musée abrite des collections uniques qui retracent l''histoire et la culture locale. Les expositions permanentes et temporaires offrent un regard approfondi sur le patrimoine régional.

POINTS FORTS
- Collections d''art local et régional
- Expositions interactives et multimédias
- Documents historiques authentiques
- Objets d''artisanat traditionnel

PARCOURS DE VISITE
Le parcours muséographique est conçu pour offrir une expérience immersive et éducative. Des audio-guides sont disponibles en plusieurs langues.

INFORMATIONS PRATIQUES
- Durée de visite : 1-2 heures
- Boutique du musée avec produits locaux
- Accès handicapés
- Parking à proximité'

    WHEN s.type = 'viewpoint' THEN 
      'PANORAMA ET PAYSAGES

Ce point de vue offre une perspective unique sur la région et ses paysages exceptionnels. C''est un lieu privilégié pour comprendre la géographie et l''histoire naturelle locale.

VUES PANORAMIQUES
- Aperçu complet de la ville et ses environs
- Paysages alpins et lacustres
- Points de repère historiques visibles
- Changements saisonniers spectaculaires

GÉOLOGIE ET NATURE
La formation géologique de ce site raconte des millions d''années d''histoire naturelle. La flore locale s''adapte aux conditions particulières de l''altitude et de l''exposition.

CONSEILS PHOTO
- Meilleure lumière : lever et coucher du soleil
- Matériel recommandé : objectif grand angle
- Conditions météo idéales : ciel dégagé
- Respecter l''environnement naturel'

    ELSE 
      'DÉCOUVERTE CULTURELLE

Ce lieu emblématique fait partie intégrante du patrimoine local et mérite une visite attentive. Il représente un aspect important de l''identité culturelle régionale.

CARACTÉRISTIQUES UNIQUES
- Éléments architecturaux remarquables
- Histoire locale fascinante
- Traditions culturelles vivantes
- Importance dans la vie communautaire

CONTEXTE HISTORIQUE
L''histoire de ce site est intimement liée à l''évolution de la région. Il a traversé les époques en conservant son caractère authentique et son importance culturelle.

EXPÉRIENCE VISITEUR
La visite permet de découvrir les traditions locales et de comprendre l''évolution historique de la région. C''est une étape enrichissante pour tout visiteur curieux.'
  END,
  'historical_info',
  'fr'
FROM public.steps s
WHERE s.city_id IN (SELECT id FROM public.cities WHERE slug != 'sion');

-- ============================
-- FINAL UPDATES
-- ============================

-- Update journey total points based on linked steps
UPDATE public.journeys 
SET total_points = (
  SELECT COALESCE(SUM(s.points_awarded), 0)
  FROM public.journey_steps js
  JOIN public.steps s ON js.step_id = s.id
  WHERE js.journey_id = journeys.id
)
WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion');

-- Ensure all steps have quiz questions
UPDATE public.steps SET has_quiz = true 
WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_data_city_steps ON public.steps(city_id) WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion');
CREATE INDEX IF NOT EXISTS idx_test_data_city_partners ON public.partners(city_id) WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion');
CREATE INDEX IF NOT EXISTS idx_test_data_journey_steps ON public.journey_steps(journey_id, step_order);