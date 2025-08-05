-- ============================================
-- MIGRATION COMPLÈTE : SION + ENRICHISSEMENT TOUTES VILLES (CORRIGÉE FINALE)
-- ============================================

-- 1. AJOUTER SION
INSERT INTO public.cities (id, name, slug, description, latitude, longitude, primary_color, secondary_color)
VALUES (
  gen_random_uuid(),
  'Sion',
  'sion',
  'Capitale du Valais, riche en histoire et vignobles',
  46.2317,
  7.3621,
  '#8B4513',
  '#DAA520'
);

-- 2. CATÉGORIES DE PARCOURS POUR TOUTES LES VILLES
INSERT INTO public.journey_categories (city_id, name, slug, description, type, difficulty, estimated_duration, icon, color)
SELECT 
  c.id,
  'Patrimoine Culturel',
  'patrimoine-culturel',
  'Découvrez l''histoire et la culture locale',
  'museums'::journey_type,
  'easy'::journey_difficulty,
  120,
  'landmark',
  '#8B4513'
FROM cities c
WHERE NOT EXISTS (
  SELECT 1 FROM journey_categories jc 
  WHERE jc.city_id = c.id AND jc.slug = 'patrimoine-culturel'
)

UNION ALL

SELECT 
  c.id,
  'Gastronomie Locale',
  'gastronomie-locale', 
  'Savourez les spécialités culinaires',
  'gastronomy'::journey_type,
  'easy'::journey_difficulty,
  90,
  'utensils',
  '#DC2626'
FROM cities c
WHERE NOT EXISTS (
  SELECT 1 FROM journey_categories jc 
  WHERE jc.city_id = c.id AND jc.slug = 'gastronomie-locale'
)

UNION ALL

SELECT 
  c.id,
  'Randonnées Nature',
  'randonnees-nature',
  'Explorez la nature environnante',
  'hiking'::journey_type,
  'medium'::journey_difficulty,
  180,
  'mountain',
  '#059669'
FROM cities c
WHERE NOT EXISTS (
  SELECT 1 FROM journey_categories jc 
  WHERE jc.city_id = c.id AND jc.slug = 'randonnees-nature'
);

-- 3. ÉTAPES POUR SION
INSERT INTO public.steps (city_id, name, description, latitude, longitude, type, points_awarded, has_quiz, address, validation_radius, images)
SELECT 
  c.id,
  'Château de Tourbillon',
  'Ruines médiévales offrant une vue panoramique sur la vallée du Rhône',
  46.2361,
  7.3544,
  'monument'::step_type,
  20,
  true,
  'Chemin du Château, 1950 Sion',
  75,
  ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Cathédrale Notre-Dame du Glarier',
  'Magnifique cathédrale gothique, cœur spirituel de Sion',
  46.2303,
  7.3597,
  'monument'::step_type,
  15,
  true,
  'Rue de la Cathédrale, 1950 Sion',
  50,
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800']
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Vignobles de Fendant',
  'Dégustation des célèbres vins valaisans en terrasses',
  46.2250,
  7.3450,
  'viewpoint'::step_type,
  25,
  true,
  'Route du Vignoble, 1950 Sion',
  100,
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Vieille Ville de Sion',
  'Promenade dans les ruelles historiques et places pittoresques',
  46.2311,
  7.3603,
  'landmark'::step_type,
  15,
  true,
  'Grand-Pont, 1950 Sion',
  60,
  ARRAY['https://images.unsplash.com/photo-1520637836862-4d197d17c86a?w=800']
FROM cities c WHERE c.slug = 'sion';

-- 4. ÉTAPES POUR BERNE
INSERT INTO public.steps (city_id, name, description, latitude, longitude, type, points_awarded, has_quiz, address, validation_radius, images)
SELECT 
  c.id,
  'Zytglogge',
  'Tour de l''horloge astronomique emblématique de Berne',
  46.9480,
  7.4474,
  'monument'::step_type,
  20,
  true,
  'Kramgasse, 3011 Bern',
  50,
  ARRAY['https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800']
FROM cities c WHERE c.slug = 'berne'

UNION ALL

SELECT 
  c.id,
  'Cathédrale de Berne',
  'Plus haute cathédrale de Suisse avec vue panoramique',
  46.9476,
  7.4518,
  'monument'::step_type,
  18,
  true,
  'Münsterplatz, 3000 Bern',
  60,
  ARRAY['https://images.unsplash.com/photo-1578947820253-95b76cbd846b?w=800']
FROM cities c WHERE c.slug = 'berne'

UNION ALL

SELECT 
  c.id,
  'Fosse aux Ours',
  'Parc moderne abritant les ours symboles de Berne',
  46.9487,
  7.4561,
  'activity'::step_type,
  15,
  true,
  'Grosser Muristalden, 3006 Bern',
  80,
  ARRAY['https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800']
FROM cities c WHERE c.slug = 'berne'

UNION ALL

SELECT 
  c.id,
  'Jardins de la Rose',
  'Parc fleuri avec vue sur la vieille ville',
  46.9472,
  7.4595,
  'viewpoint'::step_type,
  12,
  true,
  'Alter Aargauerstalden, 3006 Bern',
  70,
  ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800']
FROM cities c WHERE c.slug = 'berne';

-- 5. ÉTAPES POUR INTERLAKEN
INSERT INTO public.steps (city_id, name, description, latitude, longitude, type, points_awarded, has_quiz, address, validation_radius, images)
SELECT 
  c.id,
  'Höhematte',
  'Vaste prairie au cœur d''Interlaken avec vue sur la Jungfrau',
  46.6863,
  7.8632,
  'viewpoint'::step_type,
  15,
  true,
  'Höheweg, 3800 Interlaken',
  100,
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']
FROM cities c WHERE c.slug = 'interlaken'

UNION ALL

SELECT 
  c.id,
  'Château d''Unspunnen',
  'Ruines romantiques avec vue sur les Alpes',
  46.6792,
  7.8456,
  'monument'::step_type,
  20,
  true,
  'Unspunnenstrasse, 3800 Interlaken',
  80,
  ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']
FROM cities c WHERE c.slug = 'interlaken'

UNION ALL

SELECT 
  c.id,
  'Lac de Thoune',
  'Promenade au bord du lac cristallin',
  46.6769,
  7.8590,
  'viewpoint'::step_type,
  18,
  true,
  'Seestrasse, 3800 Interlaken',
  90,
  ARRAY['https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800']
FROM cities c WHERE c.slug = 'interlaken'

UNION ALL

SELECT 
  c.id,
  'Lac de Brienz',
  'Eaux turquoise entourées de montagnes',
  46.6885,
  7.8745,
  'viewpoint'::step_type,
  18,
  true,
  'Brienzersee, 3800 Interlaken',
  90,
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']
FROM cities c WHERE c.slug = 'interlaken';

-- 6. ÉTAPES POUR MONTREUX
INSERT INTO public.steps (city_id, name, description, latitude, longitude, type, points_awarded, has_quiz, address, validation_radius, images)
SELECT 
  c.id,
  'Casino de Montreux',
  'Casino historique surplombant le lac Léman',
  46.4312,
  6.9123,
  'landmark'::step_type,
  16,
  true,
  'Rue du Théâtre, 1820 Montreux',
  60,
  ARRAY['https://images.unsplash.com/photo-1520637736862-4d197d17c86a?w=800']
FROM cities c WHERE c.slug = 'montreux'

UNION ALL

SELECT 
  c.id,
  'Statue de Freddie Mercury',
  'Monument dédié au légendaire chanteur de Queen',
  46.4298,
  6.9077,
  'monument'::step_type,
  12,
  true,
  'Place du Marché, 1820 Montreux',
  40,
  ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800']
FROM cities c WHERE c.slug = 'montreux'

UNION ALL

SELECT 
  c.id,
  'Château de Chillon',
  'Château médiéval sur les rives du lac Léman',
  46.4143,
  6.9271,
  'monument'::step_type,
  25,
  true,
  'Avenue de Chillon, 1820 Veytaux',
  80,
  ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']
FROM cities c WHERE c.slug = 'montreux'

UNION ALL

SELECT 
  c.id,
  'Vignobles de Lavaux',
  'Terrasses viticoles classées UNESCO',
  46.4789,
  6.7895,
  'viewpoint'::step_type,
  22,
  true,
  'Route du Vignoble, 1071 Chexbres',
  120,
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']
FROM cities c WHERE c.slug = 'montreux';

-- 7. PARCOURS POUR TOUTES LES VILLES
INSERT INTO public.journeys (city_id, category_id, name, description, difficulty, estimated_duration, distance_km, total_points, image_url, is_active, is_predefined)
SELECT 
  c.id,
  jc.id,
  CASE c.slug
    WHEN 'sion' THEN 'Histoire et Vignobles de Sion'
    WHEN 'berne' THEN 'Patrimoine de la Capitale'
    WHEN 'interlaken' THEN 'Entre Deux Lacs'
    WHEN 'montreux' THEN 'Riviera et Châteaux'
    ELSE 'Découverte Culturelle'
  END,
  CASE c.slug
    WHEN 'sion' THEN 'Un voyage à travers l''histoire valaisanne et ses vignobles en terrasses'
    WHEN 'berne' THEN 'Explorez le patrimoine UNESCO de la capitale suisse'
    WHEN 'interlaken' THEN 'Découverte de la région entre les lacs de Thoune et Brienz'
    WHEN 'montreux' THEN 'De la Riviera vaudoise aux châteaux historiques'
    ELSE 'Parcours de découverte culturelle et historique'
  END,
  'medium'::journey_difficulty,
  150,
  3.5,
  70,
  CASE c.slug
    WHEN 'sion' THEN 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    WHEN 'berne' THEN 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800'
    WHEN 'interlaken' THEN 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800'
    WHEN 'montreux' THEN 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
    ELSE 'https://images.unsplash.com/photo-1520637736862-4d197d17c86a?w=800'
  END,
  true,
  true
FROM cities c
JOIN journey_categories jc ON c.id = jc.city_id AND jc.slug = 'patrimoine-culturel'
WHERE NOT EXISTS (
  SELECT 1 FROM journeys j 
  WHERE j.city_id = c.id AND j.category_id = jc.id
);

-- 8. PARTENAIRES POUR TOUTES LES VILLES
INSERT INTO public.partners (city_id, name, category, description, address, phone, email, website, latitude, longitude, is_active)
SELECT 
  c.id,
  CASE c.slug
    WHEN 'sion' THEN 'Restaurant du Château'
    WHEN 'berne' THEN 'Brasserie Altes Tramdepot'
    WHEN 'interlaken' THEN 'Restaurant Taverne'
    WHEN 'montreux' THEN 'Café du Grütli'
    ELSE 'Restaurant Local'
  END,
  'restaurant',
  'Restaurant traditionnel proposant des spécialités locales',
  CASE c.slug
    WHEN 'sion' THEN 'Rue du Château 15, 1950 Sion'
    WHEN 'berne' THEN 'Grosser Muristalden 6, 3006 Bern'
    WHEN 'interlaken' THEN 'Höheweg 2, 3800 Interlaken'
    WHEN 'montreux' THEN 'Rue du Marché 8, 1820 Montreux'
    ELSE 'Centre-ville'
  END,
  '+41 27 123 45 67',
  'contact@restaurant.ch',
  'https://restaurant-local.ch',
  c.latitude + 0.001,
  c.longitude + 0.001,
  true
FROM cities c
WHERE c.slug IN ('sion', 'berne', 'interlaken', 'montreux')

UNION ALL

SELECT 
  c.id,
  CASE c.slug
    WHEN 'sion' THEN 'Boutique Souvenirs Valais'
    WHEN 'berne' THEN 'Swiss Gifts Bern'
    WHEN 'interlaken' THEN 'Alpine Souvenirs'
    WHEN 'montreux' THEN 'Montreux Memories'
    ELSE 'Boutique Locale'
  END,
  'commerce',
  'Boutique de souvenirs et produits artisanaux locaux',
  CASE c.slug
    WHEN 'sion' THEN 'Grand-Pont 12, 1950 Sion'
    WHEN 'berne' THEN 'Kramgasse 45, 3011 Bern'
    WHEN 'interlaken' THEN 'Höheweg 85, 3800 Interlaken'
    WHEN 'montreux' THEN 'Grand-Rue 25, 1820 Montreux'
    ELSE 'Centre-ville'
  END,
  '+41 27 987 65 43',
  'info@boutique.ch',
  'https://boutique-locale.ch',
  c.latitude - 0.002,
  c.longitude + 0.002,
  true
FROM cities c
WHERE c.slug IN ('sion', 'berne', 'interlaken', 'montreux');

-- 9. RÉCOMPENSES POUR TOUS LES PARTENAIRES
INSERT INTO public.rewards (partner_id, title, description, type, points_required, value_chf, terms_conditions, is_active)
SELECT 
  p.id,
  '10% de réduction',
  'Réduction de 10% sur l''addition totale',
  'discount'::reward_type,
  150,
  10.00,
  'Valable du lundi au jeudi, non cumulable avec autres offres',
  true
FROM partners p
WHERE NOT EXISTS (
  SELECT 1 FROM rewards r WHERE r.partner_id = p.id AND r.points_required = 150
)

UNION ALL

SELECT 
  p.id,
  'Produit offert',
  'Un produit local offert pour tout achat',
  'free_item'::reward_type,
  200,
  15.00,
  'Selon disponibilité, un produit par visite',
  true
FROM partners p
WHERE p.category = 'commerce' AND NOT EXISTS (
  SELECT 1 FROM rewards r WHERE r.partner_id = p.id AND r.points_required = 200
);

-- 10. QUIZ POUR TOUTES LES ÉTAPES
INSERT INTO public.quiz_questions (step_id, question, question_type, options, correct_answer, explanation, points_awarded, bonus_points)
SELECT 
  s.id,
  CASE 
    WHEN s.name LIKE '%Château%' THEN 'En quelle année ce château a-t-il été construit ?'
    WHEN s.name LIKE '%Cathédrale%' THEN 'Quel style architectural caractérise cette cathédrale ?'
    WHEN s.name LIKE '%Vignoble%' THEN 'Quel cépage est principalement cultivé ici ?'
    WHEN s.name LIKE '%Zytglogge%' THEN 'À quelle heure sonne la grande cloche ?'
    WHEN s.name LIKE '%Casino%' THEN 'Quel festival célèbre a lieu chaque année ici ?'
    ELSE 'Quelle est la caractéristique principale de ce lieu ?'
  END,
  'multiple_choice',
  CASE 
    WHEN s.name LIKE '%Château%' THEN '["XIIe siècle", "XIVe siècle", "XVIe siècle", "XVIIIe siècle"]'::jsonb
    WHEN s.name LIKE '%Cathédrale%' THEN '["Roman", "Gothique", "Baroque", "Moderne"]'::jsonb
    WHEN s.name LIKE '%Vignoble%' THEN '["Chasselas", "Pinot Noir", "Fendant", "Gamay"]'::jsonb
    WHEN s.name LIKE '%Zytglogge%' THEN '["Toutes les heures", "Toutes les 30 min", "4 fois par jour", "1 fois par jour"]'::jsonb
    WHEN s.name LIKE '%Casino%' THEN '["Festival de Jazz", "Festival de Rock", "Festival Classique", "Festival Folk"]'::jsonb
    ELSE '["Histoire", "Nature", "Architecture", "Culture"]'::jsonb
  END,
  CASE 
    WHEN s.name LIKE '%Château%' THEN 'XIIe siècle'
    WHEN s.name LIKE '%Cathédrale%' THEN 'Gothique'
    WHEN s.name LIKE '%Vignoble%' THEN 'Fendant'
    WHEN s.name LIKE '%Zytglogge%' THEN 'Toutes les heures'
    WHEN s.name LIKE '%Casino%' THEN 'Festival de Jazz'
    ELSE 'Architecture'
  END,
  CASE 
    WHEN s.name LIKE '%Château%' THEN 'Construction typique de l''époque médiévale en Suisse'
    WHEN s.name LIKE '%Cathédrale%' THEN 'Style architectural prédominant pour les cathédrales suisses'
    WHEN s.name LIKE '%Vignoble%' THEN 'Cépage emblématique du Valais'
    WHEN s.name LIKE '%Zytglogge%' THEN 'Mécanisme horloger traditionnel'
    WHEN s.name LIKE '%Casino%' THEN 'Montreux Jazz Festival, événement mondial'
    ELSE 'Élément architectural remarquable'
  END,
  10,
  5
FROM steps s
WHERE s.has_quiz = true AND NOT EXISTS (
  SELECT 1 FROM quiz_questions q WHERE q.step_id = s.id
);

-- 11. LIAISON ÉTAPES-PARCOURS
INSERT INTO public.journey_steps (journey_id, step_id, step_order)
SELECT 
  j.id,
  s.id,
  ROW_NUMBER() OVER (PARTITION BY j.id ORDER BY s.created_at)
FROM journeys j
JOIN steps s ON j.city_id = s.city_id
WHERE NOT EXISTS (
  SELECT 1 FROM journey_steps js 
  WHERE js.journey_id = j.id AND js.step_id = s.id
)
ORDER BY j.id, s.created_at;