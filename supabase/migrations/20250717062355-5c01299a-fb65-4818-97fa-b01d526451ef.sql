-- Insertion de données de test complètes pour CIARA

-- 1. Ajouter des villes supplémentaires pour tester le multi-tenant
INSERT INTO public.cities (name, slug, country, description, timezone, default_language, supported_languages, latitude, longitude, primary_color, secondary_color, subscription_plan) VALUES
('Lausanne', 'lausanne', 'Suisse', 'Capitale olympique au bord du lac Léman', 'Europe/Zurich', 'fr', ARRAY['fr', 'en', 'de'], 46.5197, 6.6323, '#2563eb', '#7c3aed', 'professional'),
('Genève', 'geneve', 'Suisse', 'Ville internationale des organisations', 'Europe/Zurich', 'fr', ARRAY['fr', 'en'], 46.2044, 6.1432, '#059669', '#dc2626', 'enterprise'),
('Montreux', 'montreux', 'Suisse', 'Perle de la Riviera suisse', 'Europe/Zurich', 'fr', ARRAY['fr', 'en'], 46.4312, 6.9107, '#7c2d12', '#ea580c', 'starter')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  subscription_plan = EXCLUDED.subscription_plan;

-- 2. Ajouter plus de catégories de parcours pour chaque ville
WITH city_data AS (
  SELECT id, name FROM public.cities WHERE slug IN ('sion', 'lausanne', 'geneve', 'montreux')
)
INSERT INTO public.journey_categories (city_id, name, slug, description, type, difficulty, estimated_duration, icon, color) 
SELECT 
  cd.id,
  category_data.name,
  category_data.slug,
  category_data.description,
  category_data.type::journey_type,
  category_data.difficulty::journey_difficulty,
  category_data.estimated_duration,
  category_data.icon,
  category_data.color
FROM city_data cd
CROSS JOIN (VALUES
  ('Patrimoine historique', 'patrimoine', 'Découvrez l''histoire fascinante de la région', 'cultural', 'easy', 120, 'castle', '#8B5CF6'),
  ('Nature et randonnées', 'nature', 'Explorez les sentiers et paysages naturels', 'outdoor', 'medium', 180, 'mountain', '#10B981'),
  ('Gastronomie locale', 'gastronomie', 'Savourez les spécialités culinaires', 'cultural', 'easy', 90, 'utensils', '#F59E0B'),
  ('Art et culture', 'art-culture', 'Immergez-vous dans l''art et la culture', 'cultural', 'easy', 100, 'palette', '#EF4444'),
  ('Shopping et artisanat', 'shopping', 'Découvrez les commerces et artisans locaux', 'urban', 'easy', 75, 'shopping-bag', '#6366F1'),
  ('Vie nocturne', 'nightlife', 'Explorez la vie nocturne animée', 'urban', 'easy', 150, 'moon', '#8B5CF6')
) AS category_data(name, slug, description, type, difficulty, estimated_duration, icon, color)
ON CONFLICT (city_id, slug) DO NOTHING;

-- 3. Créer plus d'étapes diversifiées pour chaque ville
WITH city_steps AS (
  SELECT 
    c.id as city_id,
    c.name as city_name,
    c.latitude as city_lat,
    c.longitude as city_lng
  FROM public.cities c
  WHERE c.slug IN ('sion', 'lausanne', 'geneve', 'montreux')
)
INSERT INTO public.steps (city_id, name, description, type, latitude, longitude, address, points_awarded, validation_radius, has_quiz, images) 
SELECT 
  cs.city_id,
  step_data.name || ' - ' || cs.city_name,
  step_data.description,
  step_data.type::step_type,
  cs.city_lat + step_data.lat_offset,
  cs.city_lng + step_data.lng_offset,
  step_data.address || ', ' || cs.city_name,
  step_data.points_awarded,
  step_data.validation_radius,
  step_data.has_quiz,
  step_data.images
FROM city_steps cs
CROSS JOIN (VALUES
  ('Cathédrale Notre-Dame', 'Magnifique cathédrale gothique au cœur de la ville', 'monument', 0.002, 0.001, 'Place de la Cathédrale', 25, 30, true, ARRAY['https://images.unsplash.com/photo-1519204588530-0cde67d4c763?w=800']),
  ('Musée d''histoire', 'Plongez dans l''histoire locale à travers des expositions captivantes', 'museum', 0.001, 0.002, 'Rue du Musée 12', 30, 25, true, ARRAY['https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800']),
  ('Marché traditionnel', 'Découvrez les produits locaux et l''ambiance du marché', 'market', -0.001, 0.001, 'Place du Marché', 20, 40, false, ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800']),
  ('Parc municipal', 'Espace vert parfait pour une pause relaxante', 'park', 0.003, -0.002, 'Avenue du Parc', 15, 50, false, ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800']),
  ('Restaurant typique', 'Savourez la cuisine locale dans ce restaurant authentique', 'restaurant', -0.002, 0.003, 'Rue Gastronomique 8', 35, 20, true, ARRAY['https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800']),
  ('Atelier artisan', 'Rencontrez un artisan local et découvrez son savoir-faire', 'shop', 0.001, -0.001, 'Rue de l''Artisanat 15', 40, 15, true, ARRAY['https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800']),
  ('Point de vue panoramique', 'Vue spectaculaire sur la ville et les montagnes', 'viewpoint', 0.004, 0.002, 'Colline du Belvédère', 50, 35, false, ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']),
  ('Galerie d''art contemporain', 'Exposition d''œuvres d''artistes locaux et internationaux', 'monument', -0.001, -0.002, 'Avenue de l''Art 22', 25, 25, true, ARRAY['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800']),
  ('Fontaine historique', 'Fontaine emblématique datant du 18ème siècle', 'monument', 0.002, -0.001, 'Place de la Fontaine', 15, 20, false, ARRAY['https://images.unsplash.com/photo-1554213352-5ffe6534af08?w=800']),
  ('Café traditionnel', 'Dégustez un café dans l''ambiance authentique d''un établissement centenaire', 'restaurant', -0.003, 0.001, 'Rue du Café 5', 20, 15, false, ARRAY['https://images.unsplash.com/photo-1501747315-3aa946dd12d6?w=800'])
) AS step_data(name, description, type, lat_offset, lng_offset, address, points_awarded, validation_radius, has_quiz, images);

-- 4. Créer des parcours pour chaque catégorie et ville
WITH category_journey_data AS (
  SELECT 
    jc.id as category_id,
    jc.city_id,
    jc.name as category_name,
    jc.difficulty,
    jc.estimated_duration,
    ROW_NUMBER() OVER (PARTITION BY jc.city_id, jc.slug ORDER BY jc.created_at) as journey_num
  FROM public.journey_categories jc
)
INSERT INTO public.journeys (city_id, category_id, name, description, difficulty, estimated_duration, distance_km, total_points, is_active, is_predefined, image_url)
SELECT 
  cjd.city_id,
  cjd.category_id,
  journey_data.name || ' - ' || cjd.category_name,
  journey_data.description,
  cjd.difficulty,
  cjd.estimated_duration + journey_data.duration_modifier,
  journey_data.distance_km,
  journey_data.total_points,
  true,
  true,
  journey_data.image_url
FROM category_journey_data cjd
CROSS JOIN (VALUES
  ('Découverte essentielle', 'Le parcours incontournable pour une première visite', 0, 2.5, 150, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'),
  ('Exploration approfondie', 'Pour ceux qui veulent tout voir en détail', 30, 4.2, 280, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'),
  ('Circuit express', 'L''essentiel en un temps record', -30, 1.8, 100, 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800')
) AS journey_data(name, description, duration_modifier, distance_km, total_points, image_url);

-- 5. Associer des étapes aux parcours de manière logique
WITH journey_steps_data AS (
  SELECT 
    j.id as journey_id,
    s.id as step_id,
    ROW_NUMBER() OVER (PARTITION BY j.id ORDER BY s.points_awarded DESC, s.created_at) as step_order
  FROM public.journeys j
  JOIN public.steps s ON j.city_id = s.city_id
  WHERE j.is_predefined = true
)
INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions)
SELECT 
  jsd.journey_id,
  jsd.step_id,
  jsd.step_order,
  CASE 
    WHEN jsd.step_order = 1 THEN 'Point de départ de votre aventure ! Prenez le temps d''observer les détails.'
    WHEN jsd.step_order <= 3 THEN 'Étape importante du parcours. N''hésitez pas à poser des questions aux locaux.'
    ELSE 'Profitez de cette étape pour faire une pause et prendre des photos.'
  END
FROM journey_steps_data jsd
WHERE jsd.step_order <= 6; -- Maximum 6 étapes par parcours

-- 6. Ajouter des questions de quiz pour les étapes
WITH quiz_data AS (
  SELECT 
    s.id as step_id,
    s.name as step_name,
    s.type as step_type
  FROM public.steps s
  WHERE s.has_quiz = true
)
INSERT INTO public.quiz_questions (step_id, question, options, correct_answer, explanation, question_type, points_awarded, bonus_points)
SELECT 
  qd.step_id,
  question_data.question,
  question_data.options,
  question_data.correct_answer,
  question_data.explanation,
  question_data.question_type,
  question_data.points_awarded,
  question_data.bonus_points
FROM quiz_data qd
CROSS JOIN (VALUES
  ('Quelle est la caractéristique principale de ce lieu ?', 
   '{"A": "Architecture moderne", "B": "Histoire ancienne", "C": "Technologie avancée", "D": "Commerce international"}',
   'B', 
   'Ce lieu est reconnu pour son patrimoine historique exceptionnel.',
   'multiple_choice', 10, 5),
  ('En quelle année ce monument a-t-il été construit ?', 
   '{"A": "XVe siècle", "B": "XVIe siècle", "C": "XVIIe siècle", "D": "XVIIIe siècle"}',
   'C', 
   'La construction date du 17ème siècle selon les archives historiques.',
   'multiple_choice', 15, 8),
  ('Combien de visiteurs ce lieu accueille-t-il par an ?', 
   '{"A": "Moins de 10 000", "B": "Entre 10 000 et 50 000", "C": "Entre 50 000 et 100 000", "D": "Plus de 100 000"}',
   'C', 
   'Ce lieu populaire attire entre 50 000 et 100 000 visiteurs annuellement.',
   'multiple_choice', 12, 6)
) AS question_data(question, options, correct_answer, explanation, question_type, points_awarded, bonus_points)
LIMIT 1; -- Une question par étape avec quiz

-- 7. Ajouter plus de partenaires pour chaque ville
WITH partner_data AS (
  SELECT 
    c.id as city_id,
    c.name as city_name
  FROM public.cities c
  WHERE c.slug IN ('sion', 'lausanne', 'geneve', 'montreux')
)
INSERT INTO public.partners (city_id, name, category, description, address, phone, email, website, latitude, longitude, is_active, logo_url)
SELECT 
  pd.city_id,
  partner_info.name || ' ' || pd.city_name,
  partner_info.category,
  partner_info.description,
  partner_info.address || ', ' || pd.city_name,
  partner_info.phone,
  partner_info.email,
  partner_info.website,
  (SELECT latitude FROM public.cities WHERE id = pd.city_id) + partner_info.lat_offset,
  (SELECT longitude FROM public.cities WHERE id = pd.city_id) + partner_info.lng_offset,
  true,
  partner_info.logo_url
FROM partner_data pd
CROSS JOIN (VALUES
  ('Hôtel Bellevue', 'hebergement', 'Hôtel de charme avec vue panoramique', 'Avenue du Lac 15', '+41 27 123 45 67', 'info@bellevue.ch', 'www.bellevue.ch', 0.001, 0.002, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'),
  ('Restaurant du Terroir', 'restaurant', 'Cuisine traditionnelle avec produits locaux', 'Rue Gastronomique 22', '+41 27 234 56 78', 'contact@terroir.ch', 'www.terroir.ch', -0.002, 0.001, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'),
  ('Boutique Artisanale', 'commerce', 'Artisanat local et souvenirs authentiques', 'Place du Marché 8', '+41 27 345 67 89', 'boutique@artisans.ch', 'www.artisans.ch', 0.003, -0.001, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'),
  ('Café Central', 'restaurant', 'Café traditionnel au cœur de la ville', 'Rue Principale 12', '+41 27 456 78 90', 'cafe@central.ch', 'www.central.ch', -0.001, 0.003, 'https://images.unsplash.com/photo-1501747315-3aa946dd12d6?w=400'),
  ('Spa Wellness', 'loisir', 'Centre de bien-être et détente', 'Avenue du Bien-être 5', '+41 27 567 89 01', 'spa@wellness.ch', 'www.wellness.ch', 0.002, -0.002, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400')
) AS partner_info(name, category, description, address, phone, email, website, lat_offset, lng_offset, logo_url);

-- 8. Créer des récompenses attractives pour chaque partenaire
INSERT INTO public.rewards (partner_id, title, description, type, points_required, value_chf, terms_conditions, is_active, image_url, max_redemptions)
SELECT 
  p.id,
  reward_data.title,
  reward_data.description,
  reward_data.type::reward_type,
  reward_data.points_required,
  reward_data.value_chf,
  reward_data.terms_conditions,
  true,
  reward_data.image_url,
  reward_data.max_redemptions
FROM public.partners p
CROSS JOIN (VALUES
  ('Réduction 15%', 'Bénéficiez de 15% de réduction sur votre consommation', 'discount', 150, 15.0, 'Valable 30 jours, non cumulable avec d''autres offres', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', 50),
  ('Consommation offerte', 'Une boisson ou entrée offerte', 'free_item', 100, 8.0, 'Valable uniquement du lundi au jeudi', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 30),
  ('Cadeau surprise', 'Recevez un petit cadeau de la maison', 'gift', 200, 12.0, 'Selon disponibilité, un cadeau par personne', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400', 20)
) AS reward_data(title, description, type, points_required, value_chf, terms_conditions, image_url, max_redemptions);

-- 9. Ajouter du contenu documentaire pour les étapes
INSERT INTO public.content_documents (step_id, city_id, title, content, document_type, language)
SELECT 
  s.id,
  s.city_id,
  doc_data.title || ' - ' || s.name,
  doc_data.content,
  doc_data.document_type,
  'fr'
FROM public.steps s
CROSS JOIN (VALUES
  ('Histoire et patrimoine', 'Ce lieu emblématique témoigne de siècles d''histoire. Construit à une époque où l''architecture reflétait le prestige et la prospérité de la région, il continue d''attirer les visiteurs par son charme authentique et ses détails architecturaux remarquables.', 'historical_info'),
  ('Informations pratiques', 'Heures d''ouverture : 9h-18h (été), 10h-17h (hiver). Accès libre. Toilettes publiques à proximité. Parking disponible dans la rue adjacente. Point d''information touristique à 100m.', 'practical_info'),
  ('Anecdotes locales', 'Les habitants racontent qu''autrefois, ce lieu servait de point de rendez-vous pour les marchands. Une légende locale prétend qu''un trésor y aurait été caché, mais personne ne l''a jamais trouvé !', 'local_stories')
) AS doc_data(title, content, document_type)
LIMIT 1; -- Un document par étape