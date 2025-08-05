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
  'medium'::journey_difficulty,
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
  'easy'::journey_difficulty,
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
  'medium'::journey_difficulty,
  150,
  4.2,
  70,
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80',
  true,
  true
FROM cities c 
JOIN journey_categories jc ON c.id = jc.city_id 
WHERE c.slug = 'sion' AND jc.slug = 'randonnees-nature';