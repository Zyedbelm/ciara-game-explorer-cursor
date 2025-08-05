-- Phase 1: Enrichissement du contenu avec plus d'étapes et de parcours réalistes

-- Ajouter plus d'étapes pour Sion
INSERT INTO public.steps (city_id, name, description, latitude, longitude, type, points_awarded, has_quiz, images, address, validation_radius)
SELECT 
  c.id,
  'Château de Tourbillon',
  'Dominant la ville de Sion, ce château médiéval offre une vue imprenable sur la vallée du Rhône. Construit au 13ème siècle, il témoigne de l''importance stratégique de Sion à travers les âges.',
  46.2322,
  7.3567,
  'monument',
  25,
  true,
  ARRAY['https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80'],
  'Rue des Châteaux, 1950 Sion',
  75
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Cathédrale Notre-Dame du Glarier',
  'Magnifique cathédrale gothique du 15ème siècle, cœur spirituel de Sion. Admirez ses fresques médiévales et son architecture remarquable.',
  46.2311,
  7.3589,
  'monument',
  20,
  true,
  ARRAY['https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&q=80'],
  'Place de la Cathédrale, 1950 Sion',
  50
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Musée d''Histoire du Valais',
  'Plongez dans l''histoire fascinante du Valais, de la préhistoire à nos jours. Collections exceptionnelles et expositions interactives.',
  46.2298,
  7.3601,
  'museum',
  15,
  true,
  ARRAY['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80'],
  'Château de Valère, 1950 Sion',
  40
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Vignobles de Fendant',
  'Découvrez les vignobles emblématiques du Valais et dégustez le célèbre Fendant. Vue panoramique sur les Alpes valaisannes.',
  46.2156,
  7.3423,
  'viewpoint',
  20,
  true,
  ARRAY['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'],
  'Route des Vignobles, 1950 Sion',
  60
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Marché du Samedi',
  'Marché traditionnel valaisan avec produits locaux, fromages d''alpage et spécialités régionales. Ambiance authentique garantie.',
  46.2304,
  7.3578,
  'activity',
  10,
  false,
  ARRAY['https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=800&q=80'],
  'Place du Midi, 1950 Sion',
  30
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Restaurant La Sitterie',
  'Restaurant traditionnel valaisan proposant des spécialités locales dans un cadre chaleureux. Parfait pour découvrir la gastronomie régionale.',
  46.2289,
  7.3545,
  'restaurant',
  15,
  false,
  ARRAY['https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&q=80'],
  'Rue du Grand-Pont 12, 1950 Sion',
  25
FROM cities c WHERE c.slug = 'sion';

-- Ajouter des questions de quiz pour les nouvelles étapes
INSERT INTO public.quiz_questions (step_id, question, correct_answer, options, explanation, points_awarded, bonus_points)
SELECT 
  s.id,
  'En quelle année le Château de Tourbillon a-t-il été construit ?',
  '13ème siècle',
  '["12ème siècle", "13ème siècle", "14ème siècle", "15ème siècle"]'::jsonb,
  'Le Château de Tourbillon fut construit au 13ème siècle par les évêques de Sion pour défendre la ville.',
  10,
  5
FROM steps s 
JOIN cities c ON s.city_id = c.id 
WHERE c.slug = 'sion' AND s.name = 'Château de Tourbillon'

UNION ALL

SELECT 
  s.id,
  'Quel style architectural caractérise la Cathédrale Notre-Dame du Glarier ?',
  'Gothique',
  '["Roman", "Gothique", "Baroque", "Renaissance"]'::jsonb,
  'La cathédrale est un remarquable exemple d''architecture gothique du 15ème siècle.',
  10,
  5
FROM steps s 
JOIN cities c ON s.city_id = c.id 
WHERE c.slug = 'sion' AND s.name = 'Cathédrale Notre-Dame du Glarier'

UNION ALL

SELECT 
  s.id,
  'Quel est le cépage emblématique du Valais ?',
  'Fendant',
  '["Pinot Noir", "Fendant", "Gamay", "Syrah"]'::jsonb,
  'Le Fendant (Chasselas) est le cépage blanc emblématique du Valais, parfaitement adapté au climat alpin.',
  10,
  5
FROM steps s 
JOIN cities c ON s.city_id = c.id 
WHERE c.slug = 'sion' AND s.name = 'Vignobles de Fendant';

-- Créer des parcours plus détaillés avec les nouvelles étapes
INSERT INTO public.journeys (city_id, category_id, name, description, difficulty, estimated_duration, distance_km, total_points, image_url, is_active, is_predefined)
SELECT 
  c.id,
  jc.id,
  'Sion Historique Complet',
  'Parcours complet à travers l''histoire de Sion, de ses châteaux médiévaux à sa cathédrale gothique. Découvrez les trésors architecturaux et culturels de la capitale valaisanne à travers un voyage dans le temps fascinant.',
  'medium',
  180,
  3.5,
  85,
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1200&q=80',
  true,
  true
FROM cities c 
JOIN journey_categories jc ON c.id = jc.city_id 
WHERE c.slug = 'sion' AND jc.slug = 'patrimoine-culturel'

UNION ALL

SELECT 
  c.id,
  jc.id,
  'Terroir et Vignobles',
  'Immersion dans l''univers viticole valaisan avec dégustation de vins locaux et découverte des traditions agricoles. Un parcours gourmand qui révèle les secrets du terroir alpin unique du Valais.',
  'easy',
  120,
  2.8,
  60,
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
  true,
  true
FROM cities c 
JOIN journey_categories jc ON c.id = jc.city_id 
WHERE c.slug = 'sion' AND jc.slug = 'gastronomie-locale'

UNION ALL

SELECT 
  c.id,
  jc.id,
  'Panoramas Alpins',
  'Randonnée accessible offrant des vues spectaculaires sur les Alpes valaisannes et la vallée du Rhône. Points de vue exceptionnels et photographies mémorables garantis.',
  'medium',
  150,
  4.2,
  70,
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80',
  true,
  true
FROM cities c 
JOIN journey_categories jc ON c.id = jc.city_id 
WHERE c.slug = 'sion' AND jc.slug = 'randonnees-nature';

-- Lier les étapes aux parcours
INSERT INTO public.journey_steps (journey_id, step_id, step_order)
SELECT 
  j.id,
  s.id,
  CASE s.name
    WHEN 'Cathédrale Notre-Dame du Glarier' THEN 1
    WHEN 'Musée d''Histoire du Valais' THEN 2
    WHEN 'Château de Tourbillon' THEN 3
  END as step_order
FROM journeys j
JOIN cities c ON j.city_id = c.id
JOIN steps s ON s.city_id = c.id
WHERE c.slug = 'sion' 
  AND j.name = 'Sion Historique Complet'
  AND s.name IN ('Cathédrale Notre-Dame du Glarier', 'Musée d''Histoire du Valais', 'Château de Tourbillon')

UNION ALL

SELECT 
  j.id,
  s.id,
  CASE s.name
    WHEN 'Vignobles de Fendant' THEN 1
    WHEN 'Marché du Samedi' THEN 2
    WHEN 'Restaurant La Sitterie' THEN 3
  END as step_order
FROM journeys j
JOIN cities c ON j.city_id = c.id
JOIN steps s ON s.city_id = c.id
WHERE c.slug = 'sion' 
  AND j.name = 'Terroir et Vignobles'
  AND s.name IN ('Vignobles de Fendant', 'Marché du Samedi', 'Restaurant La Sitterie')

UNION ALL

SELECT 
  j.id,
  s.id,
  CASE s.name
    WHEN 'Château de Tourbillon' THEN 1
    WHEN 'Vignobles de Fendant' THEN 2
  END as step_order
FROM journeys j
JOIN cities c ON j.city_id = c.id
JOIN steps s ON s.city_id = c.id
WHERE c.slug = 'sion' 
  AND j.name = 'Panoramas Alpins'
  AND s.name IN ('Château de Tourbillon', 'Vignobles de Fendant');

-- Ajouter plus de partenaires réalistes
INSERT INTO public.partners (city_id, name, category, description, address, phone, email, website, latitude, longitude, logo_url, is_active)
SELECT 
  c.id,
  'Hôtel du Rhône',
  'hébergement',
  'Hôtel 4 étoiles au cœur de Sion, alliant tradition et modernité. Chambres confortables avec vue sur les châteaux.',
  'Rue du Scex 10, 1950 Sion',
  '+41 27 322 82 91',
  'info@hoteldurhone.ch',
  'https://hoteldurhone.ch',
  46.2301,
  7.3587,
  'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&q=80',
  true
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Cave du Château',
  'gastronomie',
  'Cave à vins et restaurant spécialisé dans les crus valaisans. Dégustation et vente de vins locaux.',
  'Avenue de la Gare 5, 1950 Sion',
  '+41 27 323 15 67',
  'contact@caveduchateau.ch',
  'https://caveduchateau.ch',
  46.2289,
  7.3567,
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
  true
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Bike Station Sion',
  'sport',
  'Location de vélos électriques et VTT pour explorer la région. Matériel professionnel et conseils d''experts.',
  'Place de la Gare 2, 1950 Sion',
  '+41 27 398 45 23',
  'info@bikestation-sion.ch',
  'https://bikestation-sion.ch',
  46.2298,
  7.3601,
  'https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=400&q=80',
  true
FROM cities c WHERE c.slug = 'sion';

-- Ajouter des récompenses attractives
INSERT INTO public.rewards (partner_id, title, description, type, points_required, value_chf, terms_conditions, is_active, max_redemptions)
SELECT 
  p.id,
  'Nuit gratuite week-end',
  'Une nuit gratuite pour deux personnes en chambre double, petit-déjeuner inclus (valable uniquement le week-end).',
  'free_item',
  800,
  180.00,
  'Valable uniquement les vendredis et samedis soir. Réservation obligatoire 48h à l''avance. Sous réserve de disponibilité.',
  true,
  10
FROM partners p WHERE p.name = 'Hôtel du Rhône'

UNION ALL

SELECT 
  p.id,
  'Dégustation premium',
  'Dégustation de 5 vins valaisans d''exception avec accompagnement de fromages locaux.',
  'experience',
  300,
  45.00,
  'Séance de dégustation d''1h30 avec sommelier. Sur réservation du mardi au samedi.',
  true,
  25
FROM partners p WHERE p.name = 'Cave du Château'

UNION ALL

SELECT 
  p.id,
  '30% de réduction location vélo',
  'Réduction de 30% sur la location d''un vélo électrique pour une journée complète.',
  'discount',
  150,
  25.00,
  'Valable sur les tarifs journée. Non cumulable avec autres promotions. Présentation du code obligatoire.',
  true,
  50
FROM partners p WHERE p.name = 'Bike Station Sion';