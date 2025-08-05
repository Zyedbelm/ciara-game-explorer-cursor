-- Phase 1: Création de parcours prédéfinis par catégorie et ville
-- Créer des parcours variés en utilisant les étapes existantes

-- Nettoyer d'abord les données orphelines
DELETE FROM journey_steps WHERE journey_id NOT IN (SELECT id FROM journeys);

-- Créer des parcours prédéfinis pour chaque ville et catégorie
INSERT INTO journeys (
  city_id, category_id, name, description, difficulty, estimated_duration, 
  distance_km, total_points, is_predefined, is_active, language
)
SELECT DISTINCT
  c.id as city_id,
  jc.id as category_id,
  CASE 
    WHEN jc.name = 'Patrimoine' THEN c.name || ' Historique'
    WHEN jc.name = 'Gastronomie' THEN 'Saveurs de ' || c.name
    WHEN jc.name = 'Nature' THEN c.name || ' Nature'
    WHEN jc.name = 'Vieille Ville' THEN 'Cœur de ' || c.name
    WHEN jc.name = 'Art & Culture' THEN c.name || ' Culturel'
  END as name,
  CASE 
    WHEN jc.name = 'Patrimoine' THEN 'Découvrez le patrimoine historique et architectural de ' || c.name || ' à travers ses monuments emblématiques.'
    WHEN jc.name = 'Gastronomie' THEN 'Savourez les spécialités locales et découvrez la richesse culinaire de ' || c.name || '.'
    WHEN jc.name = 'Nature' THEN 'Explorez les paysages naturels et les points de vue exceptionnels autour de ' || c.name || '.'
    WHEN jc.name = 'Vieille Ville' THEN 'Promenez-vous dans les rues historiques et découvrez le charme du centre-ville de ' || c.name || '.'
    WHEN jc.name = 'Art & Culture' THEN 'Immergez-vous dans l''art et la culture locale de ' || c.name || ' à travers ses musées et galeries.'
  END as description,
  CASE 
    WHEN jc.name = 'Nature' THEN 'medium'
    ELSE 'easy'
  END as difficulty,
  CASE 
    WHEN jc.name = 'Nature' THEN 180
    WHEN jc.name = 'Gastronomie' THEN 120
    ELSE 90
  END as estimated_duration,
  CASE 
    WHEN jc.name = 'Nature' THEN 5.0
    WHEN jc.name = 'Patrimoine' THEN 3.0
    ELSE 2.0
  END as distance_km,
  CASE 
    WHEN jc.name = 'Nature' THEN 150
    WHEN jc.name = 'Patrimoine' THEN 120
    ELSE 100
  END as total_points,
  true as is_predefined,
  true as is_active,
  'fr' as language
FROM cities c
CROSS JOIN journey_categories jc
WHERE EXISTS (
  SELECT 1 FROM steps s 
  WHERE s.city_id = c.id 
  AND s.is_active = true
)
AND NOT EXISTS (
  SELECT 1 FROM journeys j2 
  WHERE j2.city_id = c.id 
  AND j2.category_id = jc.id
);

-- Phase 2: Enrichissement du contenu
-- Ajouter des étapes manquantes pour les villes qui en ont besoin

-- Ajouter des étapes génériques pour les villes qui en manquent
INSERT INTO steps (city_id, name, description, latitude, longitude, address, type, points_awarded, has_quiz, is_active, validation_radius)
SELECT 
  c.id as city_id,
  CASE 
    WHEN step_data.type = 'monument' THEN 'Monument Principal de ' || c.name
    WHEN step_data.type = 'restaurant' THEN 'Restaurant Local ' || c.name
    WHEN step_data.type = 'viewpoint' THEN 'Point de Vue ' || c.name
    WHEN step_data.type = 'museum' THEN 'Musée de ' || c.name
    WHEN step_data.type = 'park' THEN 'Parc Central ' || c.name
  END as name,
  CASE 
    WHEN step_data.type = 'monument' THEN 'Un monument emblématique qui témoigne de l''histoire riche de ' || c.name || '.'
    WHEN step_data.type = 'restaurant' THEN 'Découvrez les spécialités culinaires locales dans ce restaurant typique de ' || c.name || '.'
    WHEN step_data.type = 'viewpoint' THEN 'Un point de vue exceptionnel offrant un panorama unique sur ' || c.name || ' et ses environs.'
    WHEN step_data.type = 'museum' THEN 'Plongez dans l''histoire et la culture locale de ' || c.name || ' à travers ses collections.'
    WHEN step_data.type = 'park' THEN 'Un espace vert au cœur de ' || c.name || ' parfait pour une pause détente.'
  END as description,
  c.latitude + (RANDOM() - 0.5) * 0.01 as latitude,
  c.longitude + (RANDOM() - 0.5) * 0.01 as longitude,
  'Centre-ville de ' || c.name as address,
  step_data.type,
  step_data.points,
  step_data.has_quiz,
  true as is_active,
  30 as validation_radius
FROM cities c
CROSS JOIN (
  VALUES 
    ('monument', 25, true),
    ('restaurant', 20, false),
    ('viewpoint', 30, true),
    ('museum', 25, true),
    ('park', 15, false)
) AS step_data(type, points, has_quiz)
WHERE (
  SELECT COUNT(*) FROM steps s 
  WHERE s.city_id = c.id AND s.type = step_data.type
) = 0
AND c.latitude IS NOT NULL 
AND c.longitude IS NOT NULL;

-- Créer des questions de quiz pour les étapes qui n'en ont pas
INSERT INTO quiz_questions (step_id, question, correct_answer, options, explanation, points_awarded, bonus_points, question_type)
SELECT 
  s.id,
  CASE 
    WHEN s.type = 'monument' THEN 'Quelle est l''importance historique de ce monument ?'
    WHEN s.type = 'viewpoint' THEN 'Que pouvez-vous observer depuis ce point de vue ?'
    WHEN s.type = 'museum' THEN 'Quel type de collection trouve-t-on dans ce musée ?'
    ELSE 'Que savez-vous sur ce lieu ?'
  END as question,
  CASE 
    WHEN s.type = 'monument' THEN 'Il témoigne de l''histoire locale'
    WHEN s.type = 'viewpoint' THEN 'Un panorama exceptionnel'
    WHEN s.type = 'museum' THEN 'Des collections d''art et d''histoire'
    ELSE 'C''est un lieu important de la ville'
  END as correct_answer,
  CASE 
    WHEN s.type = 'monument' THEN '["Il témoigne de l''histoire locale", "Il a été construit récemment", "Il n''a pas d''importance", "Il va être démoli"]'
    WHEN s.type = 'viewpoint' THEN '["Un panorama exceptionnel", "Seulement des bâtiments", "Rien d''intéressant", "Uniquement la mer"]'
    WHEN s.type = 'museum' THEN '["Des collections d''art et d''histoire", "Seulement des voitures", "Uniquement des vêtements", "Rien d''important"]'
    ELSE '["C''est un lieu important de la ville", "C''est un lieu sans intérêt", "Il n''existe plus", "C''est privé"]'
  END as options,
  CASE 
    WHEN s.type = 'monument' THEN 'Ce monument fait partie intégrante du patrimoine culturel et historique de la région.'
    WHEN s.type = 'viewpoint' THEN 'Ce point de vue offre une perspective unique sur la géographie et l''urbanisme local.'
    WHEN s.type = 'museum' THEN 'Ce musée preserve et présente l''héritage culturel et artistique de la région.'
    ELSE 'Ce lieu contribue à l''identité et au charme de la destination.'
  END as explanation,
  15 as points_awarded,
  5 as bonus_points,
  'multiple_choice' as question_type
FROM steps s
WHERE s.has_quiz = true
AND NOT EXISTS (
  SELECT 1 FROM quiz_questions qq 
  WHERE qq.step_id = s.id
)
LIMIT 20;

-- Ajouter du contenu documentaire pour les étapes
INSERT INTO content_documents (step_id, city_id, title, content, document_type, language)
SELECT 
  s.id,
  s.city_id,
  'Guide historique - ' || s.name,
  CASE 
    WHEN s.type = 'monument' THEN 'Ce monument remarquable illustre parfaitement l''architecture et l''histoire de la région. Construit selon les techniques traditionnelles, il représente un témoignage précieux du patrimoine local. Les visiteurs peuvent y découvrir des éléments architecturaux authentiques et comprendre l''évolution urbaine de la ville à travers les siècles.'
    WHEN s.type = 'viewpoint' THEN 'Ce point de vue exceptionnel permet d''apprécier la beauté du paysage et de comprendre la géographie locale. Depuis cette position privilégiée, les visiteurs peuvent observer l''organisation territoriale, l''architecture urbaine et les éléments naturels qui caractérisent cette destination unique.'
    WHEN s.type = 'museum' THEN 'Ce lieu culturel propose une immersion dans l''histoire et les traditions locales. Les collections présentées témoignent de la richesse culturelle de la région et permettent aux visiteurs de découvrir l''art, l''artisanat et les coutumes qui ont façonné l''identité locale au fil du temps.'
    WHEN s.type = 'restaurant' THEN 'Cet établissement propose une cuisine authentique qui reflète les traditions culinaires de la région. Les spécialités servies mettent en valeur les produits locaux et les recettes traditionnelles, offrant aux visiteurs une expérience gastronomique représentative du terroir local.'
    ELSE 'Ce lieu d''intérêt contribue au charme et à l''authenticité de la destination. Il offre aux visiteurs l''opportunité de découvrir un aspect particulier de la culture locale et de s''immerger dans l''atmosphère unique qui caractérise cette région.'
  END as content,
  'historical_info' as document_type,
  'fr' as language
FROM steps s
WHERE NOT EXISTS (
  SELECT 1 FROM content_documents cd 
  WHERE cd.step_id = s.id
)
AND s.is_active = true
LIMIT 30;

-- Phase 3: Associations intelligentes
-- Lier les étapes aux parcours de manière logique

-- Associer des étapes aux parcours selon leur type et catégorie
WITH journey_step_mapping AS (
  SELECT 
    j.id as journey_id,
    s.id as step_id,
    j.city_id,
    jc.name as category_name,
    s.type as step_type,
    s.points_awarded,
    ROW_NUMBER() OVER (
      PARTITION BY j.id 
      ORDER BY 
        CASE 
          WHEN jc.name = 'Patrimoine' AND s.type IN ('monument', 'museum') THEN 1
          WHEN jc.name = 'Gastronomie' AND s.type = 'restaurant' THEN 1
          WHEN jc.name = 'Nature' AND s.type IN ('viewpoint', 'park') THEN 1
          WHEN jc.name = 'Vieille Ville' AND s.type IN ('monument', 'museum') THEN 1
          WHEN jc.name = 'Art & Culture' AND s.type = 'museum' THEN 1
          ELSE 2
        END,
        s.points_awarded DESC,
        RANDOM()
    ) as step_order
  FROM journeys j
  JOIN journey_categories jc ON j.category_id = jc.id
  JOIN steps s ON j.city_id = s.city_id
  WHERE j.is_predefined = true
  AND s.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM journey_steps js 
    WHERE js.journey_id = j.id AND js.step_id = s.id
  )
)
INSERT INTO journey_steps (journey_id, step_id, step_order, custom_instructions)
SELECT 
  jsm.journey_id,
  jsm.step_id,
  jsm.step_order,
  CASE 
    WHEN jsm.step_order = 1 THEN 'Point de départ de votre aventure ! Prenez le temps de vous imprégner de l''atmosphère du lieu.'
    WHEN jsm.step_order = 2 THEN 'Deuxième étape de votre parcours. Observez les détails et n''hésitez pas à poser des questions.'
    WHEN jsm.step_order = 3 THEN 'Vous êtes maintenant au cœur de votre découverte. Profitez-en pour prendre de belles photos.'
    WHEN jsm.step_order = 4 THEN 'Avant-dernière étape ! Le moment idéal pour faire une pause et savourer l''expérience.'
    ELSE 'Dernière étape de votre parcours. Félicitations pour cette belle découverte !'
  END as custom_instructions
FROM journey_step_mapping jsm
WHERE jsm.step_order <= 5; -- Maximum 5 étapes par parcours

-- Mettre à jour les points totaux des parcours
UPDATE journeys 
SET total_points = (
  SELECT COALESCE(SUM(s.points_awarded), 0)
  FROM journey_steps js
  JOIN steps s ON js.step_id = s.id
  WHERE js.journey_id = journeys.id
)
WHERE is_predefined = true;

-- Mettre à jour la durée estimée en fonction du nombre d'étapes
UPDATE journeys 
SET estimated_duration = (
  SELECT COALESCE(COUNT(*) * 15 + 30, 45) -- 15 min par étape + 30 min de base
  FROM journey_steps js
  WHERE js.journey_id = journeys.id
)
WHERE is_predefined = true;