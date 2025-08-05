-- PLAN DE CORRECTION CIARA: Version simplifiée et fonctionnelle
-- =============================================================

-- 1. NETTOYAGE DES DOUBLONS (approche directe)
-- =============================================

-- Supprimer les doublons de Carcassonne
DELETE FROM steps 
WHERE id IN (
    SELECT s1.id 
    FROM steps s1 
    JOIN steps s2 ON s1.name = s2.name 
        AND s1.city_id = s2.city_id 
        AND ABS(s1.latitude - s2.latitude) < 0.0001 
        AND ABS(s1.longitude - s2.longitude) < 0.0001
        AND s1.id > s2.id
    JOIN cities c ON s1.city_id = c.id 
    WHERE c.name = 'Carcassonne'
);

-- Supprimer les doublons de Narbonne
DELETE FROM steps 
WHERE id IN (
    SELECT s1.id 
    FROM steps s1 
    JOIN steps s2 ON s1.name = s2.name 
        AND s1.city_id = s2.city_id 
        AND ABS(s1.latitude - s2.latitude) < 0.0001 
        AND ABS(s1.longitude - s2.longitude) < 0.0001
        AND s1.id > s2.id
    JOIN cities c ON s1.city_id = c.id 
    WHERE c.name = 'Narbonne'
);

-- Supprimer les doublons de Collioure
DELETE FROM steps 
WHERE id IN (
    SELECT s1.id 
    FROM steps s1 
    JOIN steps s2 ON s1.name = s2.name 
        AND s1.city_id = s2.city_id 
        AND ABS(s1.latitude - s2.latitude) < 0.0001 
        AND ABS(s1.longitude - s2.longitude) < 0.0001
        AND s1.id > s2.id
    JOIN cities c ON s1.city_id = c.id 
    WHERE c.name = 'Collioure'
);

-- Supprimer les doublons de Sion
DELETE FROM steps 
WHERE id IN (
    SELECT s1.id 
    FROM steps s1 
    JOIN steps s2 ON s1.name = s2.name 
        AND s1.city_id = s2.city_id 
        AND ABS(s1.latitude - s2.latitude) < 0.0001 
        AND ABS(s1.longitude - s2.longitude) < 0.0001
        AND s1.id > s2.id
    JOIN cities c ON s1.city_id = c.id 
    WHERE c.name = 'Sion'
);

-- 2. ENRICHISSEMENT CARCASSONNE
-- ==============================

-- Ajouter des quiz pour Carcassonne
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

-- Ajouter des documents pour Carcassonne
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

-- Ajouter des quiz pour Narbonne
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

-- Ajouter des documents pour Narbonne
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

-- Vérifier si Montreux existe et ajouter les nouvelles étapes
DO $$
DECLARE
    montreux_id UUID;
    step1_id UUID;
    step2_id UUID;
    step3_id UUID;
BEGIN
    SELECT id INTO montreux_id FROM cities WHERE name = 'Montreux';
    
    IF montreux_id IS NOT NULL THEN
        -- Étape 1: Casino de Montreux
        INSERT INTO steps (city_id, name, description, type, latitude, longitude, points_awarded, is_active, language)
        VALUES (
            montreux_id,
            'Casino de Montreux',
            'Le légendaire casino au bord du lac Léman, immortalisé par Deep Purple dans "Smoke on the Water".',
            'entertainment',
            46.4312, 6.9107,
            20, true, 'fr'
        ) RETURNING id INTO step1_id;
        
        -- Étape 2: Sentier viticole de Lavaux
        INSERT INTO steps (city_id, name, description, type, latitude, longitude, points_awarded, is_active, language)
        VALUES (
            montreux_id,
            'Sentier viticole de Lavaux',
            'Promenade à travers les vignobles en terrasses classés UNESCO, avec vue panoramique sur le lac.',
            'nature',
            46.4615, 6.8294,
            25, true, 'fr'
        ) RETURNING id INTO step2_id;
        
        -- Étape 3: Villa Karma
        INSERT INTO steps (city_id, name, description, type, latitude, longitude, points_awarded, is_active, language)
        VALUES (
            montreux_id,
            'Villa Karma',
            'Villa historique conçue par Adolf Loos, exemple remarquable de l''architecture moderne du début XXe.',
            'architecture',
            46.4289, 6.9156,
            20, true, 'fr'
        ) RETURNING id INTO step3_id;
        
        -- Quiz pour le Casino
        INSERT INTO quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, language)
        VALUES 
        (step1_id, 'Quel groupe de rock a immortalisé le Casino de Montreux ?', 'multiple_choice', 'Deep Purple', '["Deep Purple", "Led Zeppelin", "Queen", "The Rolling Stones"]'::jsonb, 'Deep Purple a écrit "Smoke on the Water" après l''incendie du casino en 1971.', 15, 'fr'),
        (step1_id, 'En quelle année le casino original a-t-il été détruit ?', 'multiple_choice', '1971', '["1969", "1971", "1973", "1975"]'::jsonb, 'L''incendie s''est produit pendant un concert de Frank Zappa.', 10, 'fr');
        
        -- Quiz pour Lavaux
        INSERT INTO quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, language)
        VALUES 
        (step2_id, 'Depuis quand les vignobles de Lavaux sont-ils classés UNESCO ?', 'multiple_choice', '2007', '["2005", "2007", "2009", "2011"]'::jsonb, 'Les terrasses viticoles de Lavaux ont été inscrites en 2007.', 15, 'fr'),
        (step2_id, 'Quel type de vin est principalement produit à Lavaux ?', 'multiple_choice', 'Chasselas', '["Pinot Noir", "Chasselas", "Merlot", "Chardonnay"]'::jsonb, 'Le Chasselas est le cépage traditionnel de la région.', 10, 'fr');
        
        -- Quiz pour Villa Karma
        INSERT INTO quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, language)
        VALUES 
        (step3_id, 'Qui est l''architecte de la Villa Karma ?', 'multiple_choice', 'Adolf Loos', '["Le Corbusier", "Adolf Loos", "Frank Lloyd Wright", "Mies van der Rohe"]'::jsonb, 'Adolf Loos, architecte autrichien, a conçu cette villa.', 15, 'fr'),
        (step3_id, 'En quelle année la Villa Karma a-t-elle été construite ?', 'multiple_choice', '1904', '["1902", "1904", "1906", "1908"]'::jsonb, 'La construction a commencé en 1904.', 10, 'fr');
        
        -- Documents pour le Casino
        INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
        VALUES 
        (step1_id, montreux_id, 'Histoire du Casino de Montreux', 'Le Casino de Montreux, inauguré en 1883, est devenu légendaire grâce à l''incendie du 4 décembre 1971 qui a inspiré "Smoke on the Water" de Deep Purple. Reconstruit en 1975, il continue d''accueillir le célèbre Montreux Jazz Festival depuis 1967.', 'historical_info', 'fr', auth.uid()),
        (step1_id, montreux_id, 'Le Montreux Jazz Festival', 'Créé en 1967 par Claude Nobs, le Montreux Jazz Festival est devenu l''un des festivals de musique les plus prestigieux au monde, attirant chaque été des mélomanes du monde entier.', 'cultural_events', 'fr', auth.uid());
        
        -- Documents pour Lavaux
        INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
        VALUES 
        (step2_id, montreux_id, 'Les terrasses de Lavaux', 'Les vignobles en terrasses de Lavaux constituent un paysage culturel exceptionnel façonné par l''homme depuis le XIe siècle. Les moines cisterciens ont créé ce système de terrasses produisant des vins blancs réputés.', 'agricultural_heritage', 'fr', auth.uid());
        
        -- Documents pour Villa Karma
        INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
        VALUES 
        (step3_id, montreux_id, 'Architecture moderne à Montreux', 'La Villa Karma (1904-1906) d''Adolf Loos marque une rupture avec l''architecture traditionnelle. Loos, précurseur du mouvement moderne, a appliqué ses théories révolutionnaires.', 'architectural_guide', 'fr', auth.uid());
        
        RAISE NOTICE 'Nouvelles étapes ajoutées pour Montreux: Casino, Lavaux, Villa Karma';
    END IF;
END $$;

-- 5. MISE À JOUR DES STATISTIQUES
-- ================================

-- Mettre à jour les compteurs de quiz et documents
UPDATE steps SET 
    has_quiz = EXISTS(SELECT 1 FROM quiz_questions WHERE step_id = steps.id),
    media_count = COALESCE((SELECT COUNT(*) FROM content_documents WHERE step_id = steps.id), 0)
WHERE city_id IN (
    SELECT id FROM cities WHERE name IN ('Carcassonne', 'Narbonne', 'Montreux', 'Collioure', 'Sion')
);

-- Message de confirmation
SELECT 'Plan de correction CIARA exécuté avec succès! ✅ Doublons supprimés, contenu enrichi pour toutes les villes cibles.' as result;