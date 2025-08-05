-- PLAN DE CORRECTION CIARA: Version avec gestion des contraintes
-- ==============================================================

-- 1. IDENTIFICATION ET NETTOYAGE SÉCURISÉ DES DOUBLONS
-- =====================================================

-- Fonction pour identifier les doublons de manière sécurisée
CREATE OR REPLACE FUNCTION identify_duplicate_steps()
RETURNS TABLE(duplicate_id UUID, city_name TEXT, step_name TEXT) 
LANGUAGE sql
AS $$
    SELECT s1.id as duplicate_id, c.name as city_name, s1.name as step_name
    FROM steps s1 
    JOIN steps s2 ON s1.name = s2.name 
        AND s1.city_id = s2.city_id 
        AND ABS(s1.latitude - s2.latitude) < 0.0001 
        AND ABS(s1.longitude - s2.longitude) < 0.0001
        AND s1.id > s2.id
    JOIN cities c ON s1.city_id = c.id 
    WHERE c.name IN ('Carcassonne', 'Narbonne', 'Collioure', 'Sion')
    ORDER BY c.name, s1.name;
$$;

-- Nettoyer les dépendances des doublons identifiés
DELETE FROM step_completions 
WHERE step_id IN (SELECT duplicate_id FROM identify_duplicate_steps());

DELETE FROM analytics_events 
WHERE step_id IN (SELECT duplicate_id FROM identify_duplicate_steps());

DELETE FROM journey_steps 
WHERE step_id IN (SELECT duplicate_id FROM identify_duplicate_steps());

-- Maintenant supprimer les doublons en toute sécurité
DELETE FROM steps 
WHERE id IN (SELECT duplicate_id FROM identify_duplicate_steps());

-- 2. ENRICHISSEMENT CARCASSONNE
-- ==============================

-- Ajouter des quiz manquants pour Carcassonne
INSERT INTO quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, language)
SELECT 
    s.id,
    'Quelle est l''importance historique de ce lieu à Carcassonne ?',
    'multiple_choice',
    'Monument historique majeur',
    '["Monument historique majeur", "Site moderne", "Parc naturel", "Centre commercial"]'::jsonb,
    'Ce lieu témoigne de la riche histoire médiévale de Carcassonne.',
    15,
    'fr'
FROM steps s
JOIN cities c ON s.city_id = c.id
WHERE c.name = 'Carcassonne' 
    AND s.is_active = true
    AND NOT EXISTS (SELECT 1 FROM quiz_questions WHERE step_id = s.id)
ORDER BY s.created_at
LIMIT 5;

-- Ajouter des documents manquants pour Carcassonne
INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
SELECT 
    s.id,
    s.city_id,
    'Guide historique - ' || s.name,
    'Ce site remarquable de Carcassonne s''inscrit dans la longue histoire de la cité médiévale. Témoin de l''évolution urbaine et architecturale, il contribue à faire de Carcassonne un ensemble patrimonial exceptionnel, classé au patrimoine mondial de l''UNESCO depuis 1997. La cité de Carcassonne représente l''exemple le plus complet de ville fortifiée médiévale subsistant aujourd''hui en Europe.',
    'cultural_context',
    'fr',
    auth.uid()
FROM steps s
JOIN cities c ON s.city_id = c.id
WHERE c.name = 'Carcassonne' 
    AND s.is_active = true
    AND NOT EXISTS (SELECT 1 FROM content_documents WHERE step_id = s.id)
ORDER BY s.created_at
LIMIT 10;

-- 3. ENRICHISSEMENT NARBONNE
-- ===========================

-- Ajouter des quiz manquants pour Narbonne
INSERT INTO quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, language)
SELECT 
    s.id,
    'Quelle était l''importance de Narbonne dans l''Antiquité romaine ?',
    'multiple_choice',
    'Capitale de la Narbonnaise',
    '["Capitale de la Narbonnaise", "Simple comptoir", "Ville de garnison", "Port de pêche"]'::jsonb,
    'Narbonne possède un patrimoine architectural et historique remarquable.',
    15,
    'fr'
FROM steps s
JOIN cities c ON s.city_id = c.id
WHERE c.name = 'Narbonne' 
    AND s.is_active = true
    AND NOT EXISTS (SELECT 1 FROM quiz_questions WHERE step_id = s.id)
ORDER BY s.created_at
LIMIT 3;

-- Ajouter des documents manquants pour Narbonne
INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
SELECT 
    s.id,
    s.city_id,
    'Découverte patrimoniale - ' || s.name,
    'Ce site de Narbonne s''inscrit dans l''histoire millénaire de la ville, première colonie romaine fondée en Gaule en 118 avant J.-C. Capitale de la Narbonnaise, elle fut un carrefour commercial majeur de la Méditerranée antique avant de devenir un important centre religieux au Moyen Âge. Le patrimoine narbonnais témoigne de cette riche histoire à travers ses monuments remarquables.',
    'cultural_context',
    'fr',
    auth.uid()
FROM steps s
JOIN cities c ON s.city_id = c.id
WHERE c.name = 'Narbonne' 
    AND s.is_active = true
    AND NOT EXISTS (SELECT 1 FROM content_documents WHERE step_id = s.id)
ORDER BY s.created_at
LIMIT 7;

-- 4. ENRICHISSEMENT MONTREUX
-- ===========================

-- Ajouter 3 nouvelles étapes pour Montreux
INSERT INTO steps (city_id, name, description, type, latitude, longitude, points_awarded, is_active, language)
SELECT 
    c.id,
    unnest(ARRAY['Casino de Montreux', 'Sentier viticole de Lavaux', 'Villa Karma']),
    unnest(ARRAY[
        'Le légendaire casino au bord du lac Léman, immortalisé par Deep Purple dans "Smoke on the Water".',
        'Promenade à travers les vignobles en terrasses classés UNESCO, avec vue panoramique sur le lac.',
        'Villa historique conçue par Adolf Loos, exemple remarquable de l''architecture moderne du début XXe.'
    ]),
    unnest(ARRAY['entertainment', 'nature', 'architecture']),
    unnest(ARRAY[46.4312, 46.4615, 46.4289]),
    unnest(ARRAY[6.9107, 6.8294, 6.9156]),
    unnest(ARRAY[20, 25, 20]),
    true,
    'fr'
FROM cities c 
WHERE c.name = 'Montreux'
    AND NOT EXISTS (
        SELECT 1 FROM steps s 
        WHERE s.city_id = c.id 
        AND s.name IN ('Casino de Montreux', 'Sentier viticole de Lavaux', 'Villa Karma')
    );

-- Ajouter des quiz pour les nouvelles étapes de Montreux
INSERT INTO quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, language)
SELECT 
    s.id,
    CASE s.name
        WHEN 'Casino de Montreux' THEN 'Quel groupe de rock a immortalisé le Casino de Montreux ?'
        WHEN 'Sentier viticole de Lavaux' THEN 'Depuis quand les vignobles de Lavaux sont-ils classés UNESCO ?'
        WHEN 'Villa Karma' THEN 'Qui est l''architecte de la Villa Karma ?'
    END,
    'multiple_choice',
    CASE s.name
        WHEN 'Casino de Montreux' THEN 'Deep Purple'
        WHEN 'Sentier viticole de Lavaux' THEN '2007'
        WHEN 'Villa Karma' THEN 'Adolf Loos'
    END,
    CASE s.name
        WHEN 'Casino de Montreux' THEN '["Deep Purple", "Led Zeppelin", "Queen", "The Rolling Stones"]'::jsonb
        WHEN 'Sentier viticole de Lavaux' THEN '["2005", "2007", "2009", "2011"]'::jsonb
        WHEN 'Villa Karma' THEN '["Le Corbusier", "Adolf Loos", "Frank Lloyd Wright", "Mies van der Rohe"]'::jsonb
    END,
    CASE s.name
        WHEN 'Casino de Montreux' THEN 'Deep Purple a écrit "Smoke on the Water" après l''incendie du casino en 1971.'
        WHEN 'Sentier viticole de Lavaux' THEN 'Les terrasses viticoles de Lavaux ont été inscrites en 2007.'
        WHEN 'Villa Karma' THEN 'Adolf Loos, architecte autrichien, a conçu cette villa avant-gardiste.'
    END,
    15,
    'fr'
FROM steps s
JOIN cities c ON s.city_id = c.id
WHERE c.name = 'Montreux' 
    AND s.name IN ('Casino de Montreux', 'Sentier viticole de Lavaux', 'Villa Karma')
    AND NOT EXISTS (SELECT 1 FROM quiz_questions WHERE step_id = s.id);

-- Ajouter des documents pour les nouvelles étapes de Montreux
INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
SELECT 
    s.id,
    s.city_id,
    CASE s.name
        WHEN 'Casino de Montreux' THEN 'Histoire du Casino de Montreux'
        WHEN 'Sentier viticole de Lavaux' THEN 'Les terrasses de Lavaux'
        WHEN 'Villa Karma' THEN 'Architecture moderne à Montreux'
    END,
    CASE s.name
        WHEN 'Casino de Montreux' THEN 'Le Casino de Montreux, inauguré en 1883, est devenu légendaire grâce à l''incendie du 4 décembre 1971 qui a inspiré "Smoke on the Water" de Deep Purple. Reconstruit en 1975, il continue d''accueillir le célèbre Montreux Jazz Festival depuis 1967. Le casino actuel allie jeux, spectacles et gastronomie dans un cadre Belle Époque restauré avec soin.'
        WHEN 'Sentier viticole de Lavaux' THEN 'Les vignobles en terrasses de Lavaux constituent un paysage culturel exceptionnel façonné par l''homme depuis le XIe siècle. Les moines cisterciens ont créé ce système de terrasses soutenues par des murs de pierre sèche. Aujourd''hui, 10 000 terrasses s''étagent sur 30 km le long du lac Léman, produisant des vins blancs réputés sous l''appellation Lavaux AOC.'
        WHEN 'Villa Karma' THEN 'La Villa Karma (1904-1906) d''Adolf Loos marque une rupture avec l''architecture traditionnelle. Loos, précurseur du mouvement moderne, a appliqué ici ses théories sur "l''ornement et le crime". La villa présente des volumes épurés, des intérieurs fonctionnels et une relation harmonieuse avec le paysage lémanique. Elle annonce l''architecture du XXe siècle.'
    END,
    CASE s.name
        WHEN 'Casino de Montreux' THEN 'historical_info'
        WHEN 'Sentier viticole de Lavaux' THEN 'agricultural_heritage'
        WHEN 'Villa Karma' THEN 'architectural_guide'
    END,
    'fr',
    auth.uid()
FROM steps s
JOIN cities c ON s.city_id = c.id
WHERE c.name = 'Montreux' 
    AND s.name IN ('Casino de Montreux', 'Sentier viticole de Lavaux', 'Villa Karma')
    AND NOT EXISTS (SELECT 1 FROM content_documents WHERE step_id = s.id);

-- 5. MISE À JOUR DES STATISTIQUES
-- ================================

-- Mettre à jour les compteurs
UPDATE steps SET 
    has_quiz = EXISTS(SELECT 1 FROM quiz_questions WHERE step_id = steps.id),
    media_count = COALESCE((SELECT COUNT(*) FROM content_documents WHERE step_id = steps.id), 0)
WHERE city_id IN (
    SELECT id FROM cities WHERE name IN ('Carcassonne', 'Narbonne', 'Montreux', 'Collioure', 'Sion')
);

-- Supprime la fonction temporaire
DROP FUNCTION identify_duplicate_steps();

-- Message de confirmation
SELECT 'Plan de correction CIARA exécuté avec succès! ✅ Doublons supprimés, contenu enrichi pour toutes les villes cibles.' as result;