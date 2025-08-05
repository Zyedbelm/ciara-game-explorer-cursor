-- Migration pour ajouter des données de test complètes
-- Ajout d'étapes, quiz, documents et contenus riches pour toutes les villes

-- ============================
-- ÉTAPES DE TEST POUR LAUSANNE
-- ============================

INSERT INTO public.steps (id, name, description, type, latitude, longitude, address, points_awarded, validation_radius, has_quiz, images, is_active, city_id)
SELECT 
  gen_random_uuid(),
  step_data.name,
  step_data.description,
  step_data.type,
  step_data.latitude,
  step_data.longitude,
  step_data.address,
  step_data.points_awarded,
  step_data.validation_radius,
  step_data.has_quiz,
  step_data.images::text[],
  true,
  cities.id
FROM public.cities
CROSS JOIN (VALUES
  ('Cathédrale Notre-Dame', 'Magnifique cathédrale gothique du 13ème siècle, symbole de Lausanne. Admirez sa rosace et montez dans la tour pour une vue panoramique sur le lac Léman.', 'monument', 46.5197, 6.6323, 'Place de la Cathédrale 4, 1005 Lausanne', 25, 50, true, ARRAY['https://picsum.photos/800/600?random=1']),
  ('Musée Olympique', 'Le plus grand centre d''archives au monde consacré aux Jeux Olympiques modernes. Découvrez l''histoire du sport et de l''olympisme dans un cadre exceptionnel.', 'museum', 46.5089, 6.6356, 'Quai d''Ouchy 1, 1006 Lausanne', 30, 75, true, ARRAY['https://picsum.photos/800/600?random=2', 'https://picsum.photos/800/600?random=3']),
  ('Palais de Rumine', 'Splendide bâtiment néo-Renaissance abritant plusieurs musées et l''université. Un joyau architectural au cœur de la ville.', 'museum', 46.5225, 6.6356, 'Place de la Riponne 6, 1005 Lausanne', 20, 40, true, ARRAY['https://picsum.photos/800/600?random=4']),
  ('Place de la Palud', 'Cœur historique de Lausanne avec sa fontaine de la Justice et son horloge animée. Marché traditionnel les mercredis et samedis.', 'landmark', 46.5197, 6.6311, 'Place de la Palud, 1003 Lausanne', 15, 30, true, ARRAY['https://picsum.photos/800/600?random=5']),
  ('Ouchy et le Lac Léman', 'Magnifique promenade au bord du lac avec vue sur les Alpes. Port historique et point de départ pour les excursions sur le lac.', 'viewpoint', 46.5089, 6.6267, 'Place de la Navigation, 1006 Lausanne', 20, 100, true, ARRAY['https://picsum.photos/800/600?random=6', 'https://picsum.photos/800/600?random=7']),
  ('Escaliers du Marché', 'Escalier couvert du 13ème siècle reliant la vieille ville au quartier de la cathédrale. Un passage historique unique en Europe.', 'landmark', 46.5208, 6.6331, 'Escaliers du Marché, 1003 Lausanne', 10, 25, false, ARRAY['https://picsum.photos/800/600?random=8']),
  ('Parc de Mon-Repos', 'Magnifique parc avec vue panoramique sur le lac et les Alpes. Lieu de détente idéal avec ses jardins à la française.', 'viewpoint', 46.5267, 6.6400, 'Avenue de Mon-Repos, 1005 Lausanne', 15, 75, false, ARRAY['https://picsum.photos/800/600?random=9']),
  ('Café de Grancy', 'Café traditionnel lausannois dans le quartier bohème de Grancy. Parfait pour découvrir l''ambiance locale et la culture café.', 'restaurant', 46.5156, 6.6289, 'Avenue d''Echallens 1, 1004 Lausanne', 10, 20, true, ARRAY['https://picsum.photos/800/600?random=10'])
) AS step_data(name, description, type, latitude, longitude, address, points_awarded, validation_radius, has_quiz, images)
WHERE cities.slug = 'lausanne'
ON CONFLICT DO NOTHING;

-- ============================
-- ÉTAPES DE TEST POUR SION
-- ============================

INSERT INTO public.steps (id, name, description, type, latitude, longitude, address, points_awarded, validation_radius, has_quiz, images, is_active, city_id)
SELECT 
  gen_random_uuid(),
  step_data.name,
  step_data.description,
  step_data.type,
  step_data.latitude,
  step_data.longitude,
  step_data.address,
  step_data.points_awarded,
  step_data.validation_radius,
  step_data.has_quiz,
  step_data.images::text[],
  true,
  cities.id
FROM public.cities
CROSS JOIN (VALUES
  ('Château de Valère', 'Forteresse médiévale perchée sur une colline, abritant la plus ancienne orgue du monde encore jouable. Vue spectaculaire sur la vallée du Rhône.', 'monument', 46.2311, 7.3622, 'Rue des Châteaux 12, 1950 Sion', 30, 50, true, ARRAY['https://picsum.photos/800/600?random=11']),
  ('Château de Tourbillon', 'Ruines majestueuses d''un château du 13ème siècle. Randonnée facile avec récompense panoramique sur les Alpes valaisannes.', 'monument', 46.2344, 7.3644, 'Sentier de Tourbillon, 1950 Sion', 25, 75, true, ARRAY['https://picsum.photos/800/600?random=12', 'https://picsum.photos/800/600?random=13']),
  ('Cathédrale Notre-Dame du Glarier', 'Cathédrale romane du 15ème siècle au cœur de la vieille ville. Découvrez ses fresques murales et son architecture remarquable.', 'monument', 46.2289, 7.3578, 'Rue de la Cathédrale, 1950 Sion', 20, 40, true, ARRAY['https://picsum.photos/800/600?random=14']),
  ('Vieille Ville de Sion', 'Déambulation dans les ruelles médiévales avec leurs maisons historiques et leurs cafés authentiques. Ambiance valaisanne garantie.', 'landmark', 46.2300, 7.3589, 'Grand-Pont, 1950 Sion', 15, 50, true, ARRAY['https://picsum.photos/800/600?random=15']),
  ('Musée d''Histoire du Valais', 'Découverte de 6000 ans d''histoire valaisanne dans un cadre exceptionnel. Collections archéologiques et ethnographiques remarquables.', 'museum', 46.2317, 7.3617, 'Château de Valère, 1950 Sion', 20, 30, false, ARRAY['https://picsum.photos/800/600?random=16']),
  ('Place du Midi', 'Cœur commerçant et social de Sion. Marché traditionnel et point de rencontre des Sédunois. Architecture typiquement valaisanne.', 'landmark', 46.2289, 7.3567, 'Place du Midi, 1950 Sion', 10, 30, false, ARRAY['https://picsum.photos/800/600?random=17'])
) AS step_data(name, description, type, latitude, longitude, address, points_awarded, validation_radius, has_quiz, images)
WHERE cities.slug = 'sion'
ON CONFLICT DO NOTHING;

-- ============================
-- QUIZ DE TEST
-- ============================

-- Quiz pour les étapes de Lausanne
INSERT INTO public.quiz_questions (id, step_id, question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
SELECT 
  gen_random_uuid(),
  steps.id,
  quiz_data.question,
  quiz_data.question_type,
  quiz_data.correct_answer,
  quiz_data.options::jsonb,
  quiz_data.explanation,
  quiz_data.points_awarded,
  quiz_data.bonus_points
FROM public.steps
CROSS JOIN (VALUES
  ('En quelle année la Cathédrale Notre-Dame de Lausanne a-t-elle été consacrée ?', 'multiple_choice', '1275', '["1275", "1325", "1250", "1300"]', 'La cathédrale de Lausanne a été consacrée en 1275 par le pape Grégoire X en présence de l''empereur Rodolphe de Habsbourg.', 15, 5),
  ('Quel est le style architectural principal de la cathédrale ?', 'multiple_choice', 'Gothique', '["Roman", "Gothique", "Renaissance", "Baroque"]', 'La cathédrale Notre-Dame de Lausanne est un parfait exemple de l''art gothique français en Suisse.', 10, 5),
  ('Combien de marches compte la tour de la cathédrale ?', 'multiple_choice', '232', '["200", "232", "250", "275"]', 'Il faut gravir 232 marches pour atteindre le sommet de la tour et profiter de la vue panoramique.', 10, 5)
) AS quiz_data(question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
WHERE steps.name = 'Cathédrale Notre-Dame'
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_questions (id, step_id, question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
SELECT 
  gen_random_uuid(),
  steps.id,
  quiz_data.question,
  quiz_data.question_type,
  quiz_data.correct_answer,
  quiz_data.options::jsonb,
  quiz_data.explanation,
  quiz_data.points_awarded,
  quiz_data.bonus_points
FROM public.steps
CROSS JOIN (VALUES
  ('En quelle année le Musée Olympique a-t-il ouvert ses portes ?', 'multiple_choice', '1993', '["1990", "1993", "1995", "1988"]', 'Le Musée Olympique a été inauguré en 1993 à l''initiative du CIO basé à Lausanne.', 15, 5),
  ('Combien d''objets olympiques le musée conserve-t-il ?', 'multiple_choice', 'Plus de 10 000', '["5 000", "Plus de 10 000", "15 000", "8 000"]', 'Le Musée Olympique conserve la plus grande collection d''objets olympiques au monde avec plus de 10 000 pièces.', 10, 5)
) AS quiz_data(question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
WHERE steps.name = 'Musée Olympique'
ON CONFLICT DO NOTHING;

-- Quiz pour les étapes de Sion
INSERT INTO public.quiz_questions (id, step_id, question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
SELECT 
  gen_random_uuid(),
  steps.id,
  quiz_data.question,
  quiz_data.question_type,
  quiz_data.correct_answer,
  quiz_data.options::jsonb,
  quiz_data.explanation,
  quiz_data.points_awarded,
  quiz_data.bonus_points
FROM public.steps
CROSS JOIN (VALUES
  ('Quelle est la particularité de l''orgue du Château de Valère ?', 'multiple_choice', 'C''est la plus ancienne orgue jouable du monde', '["C''est la plus grande orgue de Suisse", "C''est la plus ancienne orgue jouable du monde", "Elle a été construite par Mozart", "Elle date du 19ème siècle"]', 'L''orgue de Valère, datant de 1435, est considérée comme la plus ancienne orgue du monde encore en état de marche.', 15, 5),
  ('Que signifie "Valère" en latin ?', 'multiple_choice', 'Être fort', '["Être beau", "Être fort", "Être grand", "Être ancien"]', 'Valère vient du latin "valere" qui signifie "être fort", en référence à la position fortifiée du château.', 10, 5)
) AS quiz_data(question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
WHERE steps.name = 'Château de Valère'
ON CONFLICT DO NOTHING;

-- ============================
-- DOCUMENTS DE TEST
-- ============================

-- Documents pour les étapes de Lausanne
INSERT INTO public.content_documents (id, title, description, content, document_type, language, city_id, step_id, is_active)
SELECT 
  gen_random_uuid(),
  doc_data.title,
  doc_data.description,
  doc_data.content,
  doc_data.document_type,
  'fr',
  cities.id,
  steps.id,
  true
FROM public.cities
JOIN public.steps ON steps.city_id = cities.id
CROSS JOIN (VALUES
  ('Histoire de la Cathédrale Notre-Dame', 'Document historique détaillant la construction de la cathédrale', 'La Cathédrale Notre-Dame de Lausanne est l''un des plus beaux monuments gothiques de Suisse. Sa construction a débuté au 12ème siècle et s''est achevée au 13ème siècle. L''édifice mesure 100 mètres de long et sa tour culmine à 74 mètres de hauteur. La cathédrale abrite de magnifiques vitraux, dont la célèbre rosace de 9 mètres de diamètre. Chaque nuit, un veilleur annonce les heures depuis la tour, perpétuant une tradition vieille de 600 ans.', 'historical_document'),
  ('Guide de visite', 'Guide pratique pour visiter la cathédrale', 'Horaires d''ouverture : 7h-19h en été, 7h-17h30 en hiver. Visite de la tour : 8h30-11h30 et 13h30-17h30 (dernière montée 30 min avant). Tarifs : Gratuit pour la cathédrale, 5 CHF pour la tour. Services : Visites guidées sur demande, audio-guides disponibles en 6 langues. Accessibilité : Cathédrale accessible PMR, tour non accessible. Recommandations : Prévoir des chaussures confortables pour la montée de la tour, respect du silence pendant les offices religieux.', 'guide')
) AS doc_data(title, description, content, document_type)
WHERE cities.slug = 'lausanne' AND steps.name = 'Cathédrale Notre-Dame'
ON CONFLICT DO NOTHING;

INSERT INTO public.content_documents (id, title, description, content, document_type, language, city_id, step_id, is_active)
SELECT 
  gen_random_uuid(),
  doc_data.title,
  doc_data.description,
  doc_data.content,
  doc_data.document_type,
  'fr',
  cities.id,
  steps.id,
  true
FROM public.cities
JOIN public.steps ON steps.city_id = cities.id
CROSS JOIN (VALUES
  ('Collections du Musée Olympique', 'Présentation des collections permanentes', 'Le Musée Olympique présente l''histoire des Jeux Olympiques de l''Antiquité à nos jours à travers trois niveaux thématiques. Niveau 1 : L''Olympisme antique et moderne, avec les objets de Pierre de Coubertin. Niveau 2 : Les Jeux d''été et d''hiver, médailles, torches et équipements sportifs. Niveau 3 : L''esprit olympique, témoignages d''athlètes et innovations technologiques. Le musée propose également des expositions temporaires et des activités interactives pour tous les âges.', 'guide'),
  ('Informations pratiques', 'Horaires, tarifs et services du musée', 'Horaires : Mar-Dim 9h-18h, fermé le lundi. Tarifs : Adultes 18 CHF, Étudiants 12 CHF, Enfants (6-15 ans) 10 CHF, Gratuit moins de 6 ans. Services : Boutique, restaurant avec terrasse, parking payant. Activités : Ateliers pour familles, visites guidées thématiques, parcours multimédia. Accès : Bus 2 et 8, arrêt Musée Olympique. Réservation recommandée pour les groupes et les visites guidées.', 'guide')
) AS doc_data(title, description, content, document_type)
WHERE cities.slug = 'lausanne' AND steps.name = 'Musée Olympique'
ON CONFLICT DO NOTHING;