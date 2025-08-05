-- PLAN DE CORRECTION CIARA: Nettoyage et Enrichissement des Villes
-- ===================================================================

-- ÉTAPE 1: NETTOYAGE DES DOUBLONS
-- ================================

-- Fonction pour nettoyer les doublons tout en préservant les quiz et documents
CREATE OR REPLACE FUNCTION clean_city_duplicates()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_text TEXT := '';
    duplicate_count INTEGER;
    city_record RECORD;
BEGIN
    -- Pour chaque ville avec des doublons
    FOR city_record IN 
        SELECT c.name, c.id 
        FROM cities c 
        WHERE c.name IN ('Carcassonne', 'Narbonne', 'Collioure', 'Sion')
    LOOP
        -- Identifier et nettoyer les doublons dans cette ville
        WITH duplicates AS (
            SELECT s.id, s.name, s.latitude, s.longitude,
                   ROW_NUMBER() OVER (
                       PARTITION BY s.name, ROUND(s.latitude::numeric, 5), ROUND(s.longitude::numeric, 5) 
                       ORDER BY s.created_at DESC
                   ) as rn
            FROM steps s 
            WHERE s.city_id = city_record.id
        ),
        steps_to_keep AS (
            SELECT id FROM duplicates WHERE rn = 1
        ),
        steps_to_delete AS (
            SELECT id FROM duplicates WHERE rn > 1
        )
        -- Transférer les quiz et documents vers les steps à conserver
        UPDATE quiz_questions 
        SET step_id = (
            SELECT sk.id 
            FROM steps_to_keep sk 
            JOIN steps s_keep ON sk.id = s_keep.id
            JOIN steps s_delete ON quiz_questions.step_id = s_delete.id
            WHERE s_keep.name = s_delete.name
            LIMIT 1
        )
        WHERE step_id IN (SELECT id FROM steps_to_delete);
        
        UPDATE content_documents 
        SET step_id = (
            SELECT sk.id 
            FROM steps_to_keep sk 
            JOIN steps s_keep ON sk.id = s_keep.id
            JOIN steps s_delete ON content_documents.step_id = s_delete.id
            WHERE s_keep.name = s_delete.name
            LIMIT 1
        )
        WHERE step_id IN (SELECT id FROM steps_to_delete);
        
        -- Supprimer les relations journey_steps pour les doublons
        DELETE FROM journey_steps 
        WHERE step_id IN (SELECT id FROM steps_to_delete);
        
        -- Supprimer les steps doublons
        DELETE FROM steps 
        WHERE id IN (SELECT id FROM steps_to_delete);
        
        GET DIAGNOSTICS duplicate_count = ROW_COUNT;
        result_text := result_text || city_record.name || ': ' || duplicate_count || ' doublons supprimés. ';
    END LOOP;
    
    RETURN result_text;
END;
$$;

-- ÉTAPE 2: ENRICHISSEMENT CARCASSONNE
-- ===================================

-- Ajouter des quiz manquants pour Carcassonne (5 steps)
INSERT INTO quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, language)
SELECT 
    s.id,
    CASE 
        WHEN s.name ILIKE '%château%' THEN 'Quelle est la particularité architecturale principale du Château Comtal ?'
        WHEN s.name ILIKE '%basilique%' THEN 'En quel siècle la Basilique Saint-Nazaire a-t-elle été construite ?'
        WHEN s.name ILIKE '%porte%' THEN 'Combien de tours défensives compte cette porte médiévale ?'
        WHEN s.name ILIKE '%théâtre%' THEN 'Quel type de spectacles sont principalement joués dans ce théâtre ?'
        ELSE 'Quelle est l''importance historique de ce lieu à Carcassonne ?'
    END,
    'multiple_choice',
    CASE 
        WHEN s.name ILIKE '%château%' THEN 'Architecture gothique et romane'
        WHEN s.name ILIKE '%basilique%' THEN 'XIIe siècle'
        WHEN s.name ILIKE '%porte%' THEN 'Deux tours'
        WHEN s.name ILIKE '%théâtre%' THEN 'Spectacles médiévaux'
        ELSE 'Monument historique majeur'
    END,
    CASE 
        WHEN s.name ILIKE '%château%' THEN '["Architecture gothique et romane", "Style Renaissance", "Art moderne", "Baroque"]'::jsonb
        WHEN s.name ILIKE '%basilique%' THEN '["XIe siècle", "XIIe siècle", "XIIIe siècle", "XIVe siècle"]'::jsonb
        WHEN s.name ILIKE '%porte%' THEN '["Une tour", "Deux tours", "Trois tours", "Quatre tours"]'::jsonb
        WHEN s.name ILIKE '%théâtre%' THEN '["Spectacles médiévaux", "Opéra", "Ballet", "Concerts rock"]'::jsonb
        ELSE '["Monument historique majeur", "Site moderne", "Parc naturel", "Centre commercial"]'::jsonb
    END,
    'Ce lieu témoigne de l''riche histoire médiévale de Carcassonne.',
    15,
    'fr'
FROM steps s
JOIN cities c ON s.city_id = c.id
WHERE c.name = 'Carcassonne' 
    AND s.id NOT IN (SELECT DISTINCT step_id FROM quiz_questions WHERE step_id IS NOT NULL)
    AND s.is_active = true
ORDER BY s.created_at
LIMIT 5;

-- Ajouter des documents manquants pour Carcassonne (10 steps)
INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
SELECT 
    s.id,
    s.city_id,
    'Guide historique - ' || s.name,
    CASE 
        WHEN s.name ILIKE '%château%' THEN 'Le Château Comtal, joyau de la Cité de Carcassonne, représente un exemple remarquable de l''architecture défensive médiévale. Construit au XIIe siècle, il a été restauré par Viollet-le-Duc au XIXe siècle. Sa position stratégique au cœur de la cité en faisait le dernier rempart de défense. Les visiteurs peuvent aujourd''hui admirer ses salles d''armes, ses tours de guet et ses courtines qui racontent mille ans d''histoire.'
        WHEN s.name ILIKE '%basilique%' THEN 'La Basilique Saint-Nazaire et Saint-Celse constitue l''un des plus beaux exemples d''art gothique du Languedoc. Édifiée entre le XIe et le XIVe siècle, elle mélange harmonieusement les styles roman et gothique. Ses vitraux exceptionnels, datant des XIIIe et XIVe siècles, comptent parmi les plus beaux de France. La basilique abrite également le tombeau de Simon de Montfort.'
        WHEN s.name ILIKE '%porte%' THEN 'Cette porte fortifiée témoigne du génie militaire médiéval. Flanquée de tours massives, elle constituait un point de passage obligé et fortement défendu. Son système de herse, ses assommoirs et ses meurtrières en faisaient un piège redoutable pour les assaillants. Les blasons sculptés sur ses murs racontent l''histoire des seigneurs qui l''ont commandée.'
        ELSE 'Ce site remarquable de Carcassonne s''inscrit dans la longue histoire de la cité médiévale. Témoin de l''évolution urbaine et architecturale, il contribue à faire de Carcassonne un ensemble patrimonial exceptionnel, classé au patrimoine mondial de l''UNESCO depuis 1997.'
    END,
    CASE 
        WHEN s.name ILIKE '%château%' THEN 'historical_info'
        WHEN s.name ILIKE '%basilique%' THEN 'architectural_guide'
        WHEN s.name ILIKE '%porte%' THEN 'military_heritage'
        ELSE 'cultural_context'
    END,
    'fr',
    auth.uid()
FROM steps s
JOIN cities c ON s.city_id = c.id
WHERE c.name = 'Carcassonne' 
    AND s.id NOT IN (SELECT DISTINCT step_id FROM content_documents WHERE step_id IS NOT NULL)
    AND s.is_active = true
ORDER BY s.created_at
LIMIT 10;

-- ÉTAPE 3: ENRICHISSEMENT NARBONNE
-- =================================

-- Ajouter des quiz manquants pour Narbonne (3 steps)
INSERT INTO quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, language)
SELECT 
    s.id,
    CASE 
        WHEN s.name ILIKE '%cathédrale%' THEN 'Pourquoi la Cathédrale Saint-Just de Narbonne est-elle restée inachevée ?'
        WHEN s.name ILIKE '%palais%' THEN 'Quelle fonction avait le Palais des Archevêques à l''époque médiévale ?'
        ELSE 'Quelle était l''importance de Narbonne dans l''Antiquité romaine ?'
    END,
    'multiple_choice',
    CASE 
        WHEN s.name ILIKE '%cathédrale%' THEN 'Contraintes financières et techniques'
        WHEN s.name ILIKE '%palais%' THEN 'Résidence des archevêques'
        ELSE 'Capitale de la Narbonnaise'
    END,
    CASE 
        WHEN s.name ILIKE '%cathédrale%' THEN '["Contraintes financières et techniques", "Guerres de religion", "Séisme destructeur", "Changement de style"]'::jsonb
        WHEN s.name ILIKE '%palais%' THEN '["Résidence des archevêques", "Palais royal", "Tribunal", "Université"]'::jsonb
        ELSE '["Capitale de la Narbonnaise", "Simple comptoir", "Ville de garnison", "Port de pêche"]'::jsonb
    END,
    'Narbonne possède un patrimoine architectural et historique remarquable.',
    15,
    'fr'
FROM steps s
JOIN cities c ON s.city_id = c.id
WHERE c.name = 'Narbonne' 
    AND s.id NOT IN (SELECT DISTINCT step_id FROM quiz_questions WHERE step_id IS NOT NULL)
    AND s.is_active = true
ORDER BY s.created_at
LIMIT 3;

-- Ajouter des documents manquants pour Narbonne (7 steps)
INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
SELECT 
    s.id,
    s.city_id,
    'Découverte patrimoniale - ' || s.name,
    CASE 
        WHEN s.name ILIKE '%cathédrale%' THEN 'La Cathédrale Saint-Just et Saint-Pasteur de Narbonne est l''une des plus hautes cathédrales gothiques de France avec ses 41 mètres sous voûte. Commencée en 1272, elle ne fut jamais achevée faute de moyens financiers. Seul le chœur fut construit, mais quelle splendeur ! Ses vitraux du XIVe siècle et son trésor exceptionnel en font un joyau de l''art gothique méridional.'
        WHEN s.name ILIKE '%palais%' THEN 'Le Palais des Archevêques témoigne de la puissance spirituelle et temporelle des prélats narbonnais. Cet ensemble palatial, édifié entre le XIIe et le XIVe siècle, comprend le Palais Vieux de style roman et le Palais Neuf de style gothique. Il abrite aujourd''hui l''Hôtel de Ville et le Musée d''Art et d''Histoire, offrant un voyage à travers les siècles.'
        WHEN s.name ILIKE '%horreum%' THEN 'L''Horreum romain de Narbonne est un témoignage exceptionnel de l''architecture commerciale antique. Ces entrepôts souterrains du Ier siècle avant J.-C. servaient à stocker les marchandises dans le port de Narbo Martius. Leurs galeries voûtées et leurs systèmes d''aération sophistiqués révèlent le génie technique des Romains.'
        ELSE 'Ce site de Narbonne s''inscrit dans l''histoire millénaire de la ville, première colonie romaine fondée en Gaule en 118 avant J.-C. Capitale de la Narbonnaise, elle fut un carrefour commercial majeur de la Méditerranée antique avant de devenir un important centre religieux au Moyen Âge.'
    END,
    CASE 
        WHEN s.name ILIKE '%cathédrale%' THEN 'architectural_guide'
        WHEN s.name ILIKE '%palais%' THEN 'historical_info'
        WHEN s.name ILIKE '%horreum%' THEN 'archaeological_site'
        ELSE 'cultural_context'
    END,
    'fr',
    auth.uid()
FROM steps s
JOIN cities c ON s.city_id = c.id
WHERE c.name = 'Narbonne' 
    AND s.id NOT IN (SELECT DISTINCT step_id FROM content_documents WHERE step_id IS NOT NULL)
    AND s.is_active = true
ORDER BY s.created_at
LIMIT 7;

-- ÉTAPE 4: ENRICHISSEMENT MONTREUX
-- =================================

-- Ajouter 3 nouvelles étapes pour Montreux
DO $$
DECLARE
    montreux_id UUID;
    step1_id UUID;
    step2_id UUID;
    step3_id UUID;
BEGIN
    -- Récupérer l'ID de Montreux
    SELECT id INTO montreux_id FROM cities WHERE name = 'Montreux';
    
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
    (step1_id, 'Quel groupe de rock a immortalisé le Casino de Montreux dans une de ses chansons ?', 'multiple_choice', 'Deep Purple', '["Deep Purple", "Led Zeppelin", "Queen", "The Rolling Stones"]'::jsonb, 'Deep Purple a écrit "Smoke on the Water" après l''incendie du casino en 1971.', 15, 'fr'),
    (step1_id, 'En quelle année le casino original a-t-il été détruit par un incendie ?', 'multiple_choice', '1971', '["1969", "1971", "1973", "1975"]'::jsonb, 'L''incendie s''est produit pendant un concert de Frank Zappa le 4 décembre 1971.', 10, 'fr');
    
    -- Quiz pour Lavaux
    INSERT INTO quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, language)
    VALUES 
    (step2_id, 'Depuis quand les vignobles de Lavaux sont-ils classés au patrimoine UNESCO ?', 'multiple_choice', '2007', '["2005", "2007", "2009", "2011"]'::jsonb, 'Les terrasses viticoles de Lavaux ont été inscrites en 2007 pour leur valeur paysagère exceptionnelle.', 15, 'fr'),
    (step2_id, 'Quel type de vin est principalement produit dans la région de Lavaux ?', 'multiple_choice', 'Chasselas', '["Pinot Noir", "Chasselas", "Merlot", "Chardonnay"]'::jsonb, 'Le Chasselas est le cépage blanc traditionnel de la région lémanique.', 10, 'fr'),
    (step2_id, 'Quelle est la superficie approximative du vignoble de Lavaux ?', 'multiple_choice', '830 hectares', '["630 hectares", "730 hectares", "830 hectares", "930 hectares"]'::jsonb, 'Le vignoble s''étend sur environ 830 hectares en terrasses.', 10, 'fr');
    
    -- Quiz pour Villa Karma
    INSERT INTO quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, language)
    VALUES 
    (step3_id, 'Qui est l''architecte de la Villa Karma ?', 'multiple_choice', 'Adolf Loos', '["Le Corbusier", "Adolf Loos", "Frank Lloyd Wright", "Ludwig Mies van der Rohe"]'::jsonb, 'Adolf Loos, architecte autrichien, a conçu cette villa avant-gardiste.', 15, 'fr'),
    (step3_id, 'En quelle année la Villa Karma a-t-elle été construite ?', 'multiple_choice', '1904', '["1902", "1904", "1906", "1908"]'::jsonb, 'La construction a commencé en 1904 et s''est achevée en 1906.', 10, 'fr');
    
    -- Documents pour le Casino
    INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
    VALUES 
    (step1_id, montreux_id, 'Histoire du Casino de Montreux', 'Le Casino de Montreux, inauguré en 1883, est devenu légendaire grâce à l''incendie du 4 décembre 1971 qui a inspiré "Smoke on the Water" de Deep Purple. Reconstruit en 1975, il continue d''accueillir le célèbre Montreux Jazz Festival depuis 1967. Le casino actuel allie jeux, spectacles et gastronomie dans un cadre Belle Époque restauré avec soin.', 'historical_info', 'fr', auth.uid()),
    (step1_id, montreux_id, 'Le Montreux Jazz Festival', 'Créé en 1967 par Claude Nobs, le Montreux Jazz Festival est devenu l''un des festivals de musique les plus prestigieux au monde. Il a vu défiler les plus grands artistes : Miles Davis, Nina Simone, Prince, David Bowie... Le festival a contribué à faire de Montreux la "capitale du jazz", attirant chaque été des mélomanes du monde entier.', 'cultural_events', 'fr', auth.uid());
    
    -- Documents pour Lavaux
    INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
    VALUES 
    (step2_id, montreux_id, 'Les terrasses de Lavaux', 'Les vignobles en terrasses de Lavaux constituent un paysage culturel exceptionnel façonné par l''homme depuis le XIe siècle. Les moines cisterciens ont créé ce système de terrasses soutenues par des murs de pierre sèche. Aujourd''hui, 10 000 terrasses s''étagent sur 30 km le long du lac Léman, produisant des vins blancs réputés sous l''appellation Lavaux AOC.', 'agricultural_heritage', 'fr', auth.uid());
    
    -- Documents pour Villa Karma
    INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
    VALUES 
    (step3_id, montreux_id, 'Architecture moderne à Montreux', 'La Villa Karma (1904-1906) d''Adolf Loos marque une rupture avec l''architecture traditionnelle. Loos, précurseur du mouvement moderne, a appliqué ici ses théories sur "l''ornement et le crime". La villa présente des volumes épurés, des intérieurs fonctionnels et une relation harmonieuse avec le paysage lémanique. Elle annonce l''architecture du XXe siècle.', 'architectural_guide', 'fr', auth.uid());
END $$;

-- ÉTAPE 5: EXÉCUTION DU NETTOYAGE
-- ================================

-- Exécuter le nettoyage des doublons
SELECT clean_city_duplicates();

-- ÉTAPE 6: MISE À JOUR DES STATISTIQUES
-- =====================================

-- Mettre à jour les compteurs de médias et quiz
UPDATE steps SET 
    has_quiz = EXISTS(SELECT 1 FROM quiz_questions WHERE step_id = steps.id),
    media_count = COALESCE((SELECT COUNT(*) FROM content_documents WHERE step_id = steps.id), 0)
WHERE city_id IN (
    SELECT id FROM cities WHERE name IN ('Carcassonne', 'Narbonne', 'Montreux', 'Collioure', 'Sion')
);

-- Finaliser avec un message de succès
SELECT 'Plan de correction CIARA exécuté avec succès! Toutes les villes ont été enrichies selon les objectifs fixés.' as result;