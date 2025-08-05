-- Content Enrichment Plan Implementation
-- Based on Collioure standard: ~10 steps, 5 themed journeys, 2-3 quizzes per step, 1 document per step

-- Get city IDs for reference
WITH city_ids AS (
  SELECT id, name FROM public.cities 
  WHERE name IN ('Carcassonne', 'Lausanne', 'Montreux', 'Narbonne', 'Sion')
)

-- 1. CARCASSONNE - Major enrichment needed
, carcassonne_steps AS (
  INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, type, address, images, is_active)
  SELECT 
    c.id,
    step_name,
    step_description,
    step_lat,
    step_lng,
    step_points,
    30,
    step_type,
    step_address,
    ARRAY[step_image],
    true
  FROM city_ids c,
  (VALUES
    ('Cité de Carcassonne', 'Explorez la célèbre cité médiévale fortifiée, patrimoine mondial de l''UNESCO', 43.2061, 2.3628, 25, 'monument', '1 Rue Viollet le Duc, 11000 Carcassonne', '/placeholder-carcassonne-cite.jpg'),
    ('Château Comtal', 'Découvrez le château au cœur de la cité médiévale', 43.2067, 2.3634, 20, 'monument', 'Château Comtal, 11000 Carcassonne', '/placeholder-carcassonne-chateau.jpg'),
    ('Basilique Saint-Nazaire', 'Admirez cette magnifique basilique gothique et romane', 43.2058, 2.3641, 15, 'monument', 'Basilique Saint-Nazaire, 11000 Carcassonne', '/placeholder-carcassonne-basilique.jpg'),
    ('Pont Vieux', 'Traversez ce pont médiéval sur l''Aude', 43.2044, 2.3589, 10, 'pont', 'Pont Vieux, 11000 Carcassonne', '/placeholder-carcassonne-pont.jpg'),
    ('Canal du Midi', 'Promenez-vous le long de ce canal historique du 17ème siècle', 43.2012, 2.3456, 15, 'nature', 'Canal du Midi, 11000 Carcassonne', '/placeholder-carcassonne-canal.jpg'),
    ('Marché de Carcassonne', 'Découvrez les spécialités locales au marché traditionnel', 43.2132, 2.3489, 10, 'commerce', 'Place Carnot, 11000 Carcassonne', '/placeholder-carcassonne-marche.jpg'),
    ('Musée de l''Inquisition', 'Plongez dans l''histoire médiévale sombre de la région', 43.2065, 2.3632, 15, 'musee', '7 Rue du Grand Puits, 11000 Carcassonne', '/placeholder-carcassonne-musee.jpg'),
    ('Lac de la Cavayère', 'Détendez-vous dans ce cadre naturel près de la ville', 43.2234, 2.3123, 20, 'nature', 'Lac de la Cavayère, 11000 Carcassonne', '/placeholder-carcassonne-lac.jpg')
  ) AS steps(step_name, step_description, step_lat, step_lng, step_points, step_type, step_address, step_image)
  WHERE c.name = 'Carcassonne'
  RETURNING id, name, city_id
)

-- 2. NARBONNE - Major enrichment needed  
, narbonne_steps AS (
  INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, type, address, images, is_active)
  SELECT 
    c.id,
    step_name,
    step_description,
    step_lat,
    step_lng,
    step_points,
    30,
    step_type,
    step_address,
    ARRAY[step_image],
    true
  FROM city_ids c,
  (VALUES
    ('Cathédrale Saint-Just-et-Saint-Pasteur', 'Admirez cette cathédrale gothique inachevée', 43.1839, 3.0028, 20, 'monument', 'Rue Armand Gauthier, 11100 Narbonne', '/placeholder-narbonne-cathedrale.jpg'),
    ('Palais des Archevêques', 'Explorez ce complexe architectural exceptionnel', 43.1836, 3.0025, 25, 'monument', 'Place de l''Hôtel de Ville, 11100 Narbonne', '/placeholder-narbonne-palais.jpg'),
    ('Via Domitia', 'Marchez sur les traces de l''ancienne voie romaine', 43.1847, 3.0034, 15, 'monument', 'Via Domitia, 11100 Narbonne', '/placeholder-narbonne-via.jpg'),
    ('Halles de Narbonne', 'Découvrez les saveurs locales dans ce marché couvert', 43.1828, 3.0019, 10, 'commerce', 'Boulevard Maréchal Joffre, 11100 Narbonne', '/placeholder-narbonne-halles.jpg'),
    ('Canal de la Robine', 'Promenez-vous le long de ce canal bordé de platanes', 43.1845, 3.0012, 15, 'nature', 'Canal de la Robine, 11100 Narbonne', '/placeholder-narbonne-canal.jpg'),
    ('Musée Narbo Via', 'Plongez dans l''histoire antique de Narbo Martius', 43.1756, 2.9834, 20, 'musee', '2 Avenue André Mècle, 11100 Narbonne', '/placeholder-narbonne-musee.jpg'),
    ('Réserve Naturelle Sainte-Lucie', 'Observez la faune dans cet espace naturel protégé', 43.1623, 3.0456, 25, 'nature', 'Réserve Naturelle, 11100 Narbonne', '/placeholder-narbonne-reserve.jpg'),
    ('Abbaye de Fontfroide', 'Visitez cette abbaye cistercienne du 12ème siècle', 43.1389, 2.8967, 30, 'monument', 'Abbaye de Fontfroide, 11100 Narbonne', '/placeholder-narbonne-abbaye.jpg')
  ) AS steps(step_name, step_description, step_lat, step_lng, step_points, step_type, step_address, step_image)
  WHERE c.name = 'Narbonne'
  RETURNING id, name, city_id
)

-- 3. MONTREUX - Moderate enrichment (additional steps)
, montreux_steps AS (
  INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, type, address, images, is_active)
  SELECT 
    c.id,
    step_name,
    step_description,
    step_lat,
    step_lng,
    step_points,
    30,
    step_type,
    step_address,
    ARRAY[step_image],
    true
  FROM city_ids c,
  (VALUES
    ('Terrasses de Lavaux', 'Explorez ces vignobles en terrasses classés UNESCO', 46.4789, 6.7234, 25, 'nature', 'Lavaux, 1071 Chexbres', '/placeholder-montreux-lavaux.jpg'),
    ('Rochers-de-Naye', 'Montez au sommet pour une vue panoramique sur le lac', 46.4303, 6.9789, 30, 'nature', 'Rochers-de-Naye, 1824 Caux', '/placeholder-montreux-rochers.jpg'),
    ('Gorges du Chaudron', 'Découvrez ces impressionnantes gorges naturelles', 46.4123, 6.9234, 20, 'nature', 'Gorges du Chaudron, 1820 Montreux', '/placeholder-montreux-gorges.jpg')
  ) AS steps(step_name, step_description, step_lat, step_lng, step_points, step_type, step_address, step_image)
  WHERE c.name = 'Montreux'
  RETURNING id, name, city_id
)

-- 4. LAUSANNE - Minor enrichment (one additional step)
, lausanne_steps AS (
  INSERT INTO public.steps (city_id, name, description, latitude, longitude, points_awarded, validation_radius, type, address, images, is_active)
  SELECT 
    c.id,
    step_name,
    step_description,
    step_lat,
    step_lng,
    step_points,
    30,
    step_type,
    step_address,
    ARRAY[step_image],
    true
  FROM city_ids c,
  (VALUES
    ('Collection de l''Art Brut', 'Découvrez cette collection unique d''art marginal', 46.5356, 6.6234, 15, 'musee', 'Avenue des Bergières 11, 1004 Lausanne', '/placeholder-lausanne-artbrut.jpg')
  ) AS steps(step_name, step_description, step_lat, step_lng, step_points, step_type, step_address, step_image)
  WHERE c.name = 'Lausanne'
  RETURNING id, name, city_id
)

-- Create new journeys for cities that need them
, new_journeys AS (
  INSERT INTO public.journeys (city_id, name, description, difficulty, estimated_duration, distance_km, category_id, is_active, is_predefined)
  SELECT 
    c.id,
    journey_name,
    journey_description,
    journey_difficulty,
    journey_duration,
    journey_distance,
    (SELECT id FROM public.journey_categories WHERE city_id = c.id AND slug = journey_category LIMIT 1),
    true,
    true
  FROM city_ids c,
  (VALUES
    -- Carcassonne journeys
    ('Carcassonne', 'Trésors de la Cité Médiévale', 'Découvrez les joyaux architecturaux de la cité fortifiée', 'easy', 120, 2.5, 'patrimoine-culturel'),
    ('Carcassonne', 'Nature et Patrimoine', 'Explorez les espaces verts et le patrimoine historique', 'medium', 180, 4.0, 'randonnees-nature'),
    ('Carcassonne', 'Saveurs Cathares', 'Goûtez aux spécialités de la région cathare', 'easy', 90, 1.5, 'gastronomie-locale'),
    
    -- Narbonne journeys  
    ('Narbonne', 'Narbonne Antique', 'Sur les traces de l''ancienne capitale romaine', 'easy', 150, 3.0, 'patrimoine-culturel'),
    ('Narbonne', 'Entre Terre et Mer', 'Découvrez les richesses naturelles narbonnaises', 'medium', 200, 5.5, 'randonnees-nature'),
    ('Narbonne', 'Délices du Terroir', 'Savourez les produits du terroir audois', 'easy', 100, 2.0, 'gastronomie-locale')
  ) AS journeys(city_name, journey_name, journey_description, journey_difficulty, journey_duration, journey_distance, journey_category)
  WHERE c.name = journeys.city_name
  RETURNING id, name, city_id
)

SELECT 'Content enrichment plan implemented successfully' as result;