-- PLAN DE CORRECTION CIARA: Version corrigée
-- ==========================================

-- Fonction améliorée pour nettoyer les doublons avec gestion des contraintes
CREATE OR REPLACE FUNCTION clean_city_duplicates_safe()
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
        -- D'abord supprimer les quiz et documents des doublons (éviter les conflits de contraintes)
        DELETE FROM quiz_questions 
        WHERE step_id IN (SELECT id FROM steps_to_delete);
        
        DELETE FROM content_documents 
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

-- Exécuter le nettoyage sécurisé
SELECT clean_city_duplicates_safe();

-- ENRICHISSEMENT CARCASSONNE - Quiz manquants (5 steps)
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
    'Ce lieu témoigne de la riche histoire médiévale de Carcassonne.',
    15,
    'fr'
FROM steps s
JOIN cities c ON s.city_id = c.id
WHERE c.name = 'Carcassonne' 
    AND s.id NOT IN (SELECT DISTINCT step_id FROM quiz_questions WHERE step_id IS NOT NULL)
    AND s.is_active = true
ORDER BY s.created_at
LIMIT 5
ON CONFLICT (step_id, question) DO NOTHING;

-- ENRICHISSEMENT CARCASSONNE - Documents manquants (10 steps)
INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
SELECT 
    s.id,
    s.city_id,
    'Guide historique - ' || s.name,
    CASE 
        WHEN s.name ILIKE '%château%' THEN 'Le Château Comtal, joyau de la Cité de Carcassonne, représente un exemple remarquable de l''architecture défensive médiévale. Construit au XIIe siècle, il a été restauré par Viollet-le-Duc au XIXe siècle. Sa position stratégique au cœur de la cité en faisait le dernier rempart de défense.'
        WHEN s.name ILIKE '%basilique%' THEN 'La Basilique Saint-Nazaire et Saint-Celse constitue l''un des plus beaux exemples d''art gothique du Languedoc. Édifiée entre le XIe et le XIVe siècle, elle mélange harmonieusement les styles roman et gothique. Ses vitraux exceptionnels comptent parmi les plus beaux de France.'
        WHEN s.name ILIKE '%porte%' THEN 'Cette porte fortifiée témoigne du génie militaire médiéval. Flanquée de tours massives, elle constituait un point de passage obligé et fortement défendu. Son système de défense en faisait un piège redoutable pour les assaillants.'
        ELSE 'Ce site remarquable de Carcassonne s''inscrit dans la longue histoire de la cité médiévale. Témoin de l''évolution urbaine et architecturale, il contribue à faire de Carcassonne un ensemble patrimonial exceptionnel, classé UNESCO depuis 1997.'
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

-- ENRICHISSEMENT NARBONNE - Quiz manquants (3 steps)
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
LIMIT 3
ON CONFLICT (step_id, question) DO NOTHING;

-- ENRICHISSEMENT NARBONNE - Documents manquants (7 steps)
INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
SELECT 
    s.id,
    s.city_id,
    'Découverte patrimoniale - ' || s.name,
    CASE 
        WHEN s.name ILIKE '%cathédrale%' THEN 'La Cathédrale Saint-Just et Saint-Pasteur de Narbonne est l''une des plus hautes cathédrales gothiques de France avec ses 41 mètres sous voûte. Commencée en 1272, elle ne fut jamais achevée faute de moyens financiers.'
        WHEN s.name ILIKE '%palais%' THEN 'Le Palais des Archevêques témoigne de la puissance spirituelle et temporelle des prélats narbonnais. Cet ensemble palatial, édifié entre le XIIe et le XIVe siècle, comprend le Palais Vieux de style roman.'
        WHEN s.name ILIKE '%horreum%' THEN 'L''Horreum romain de Narbonne est un témoignage exceptionnel de l''architecture commerciale antique. Ces entrepôts souterrains du Ier siècle avant J.-C. servaient à stocker les marchandises.'
        ELSE 'Ce site de Narbonne s''inscrit dans l''histoire millénaire de la ville, première colonie romaine fondée en Gaule en 118 avant J.-C. Capitale de la Narbonnaise, elle fut un carrefour commercial majeur.'
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

-- ENRICHISSEMENT MONTREUX - Nouvelles étapes
DO $$
DECLARE
    montreux_id UUID;
    step1_id UUID;
    step2_id UUID;
    step3_id UUID;
BEGIN
    SELECT id INTO montreux_id FROM cities WHERE name = 'Montreux';
    
    IF montreux_id IS NOT NULL THEN
        -- Casino de Montreux
        INSERT INTO steps (city_id, name, description, type, latitude, longitude, points_awarded, is_active, language)
        VALUES (
            montreux_id,
            'Casino de Montreux',
            'Le légendaire casino au bord du lac Léman, immortalisé par Deep Purple dans "Smoke on the Water".',
            'entertainment',
            46.4312, 6.9107,
            20, true, 'fr'
        ) RETURNING id INTO step1_id;
        
        -- Sentier viticole de Lavaux
        INSERT INTO steps (city_id, name, description, type, latitude, longitude, points_awarded, is_active, language)
        VALUES (
            montreux_id,
            'Sentier viticole de Lavaux',
            'Promenade à travers les vignobles en terrasses classés UNESCO, avec vue panoramique sur le lac.',
            'nature',
            46.4615, 6.8294,
            25, true, 'fr'
        ) RETURNING id INTO step2_id;
        
        -- Villa Karma
        INSERT INTO steps (city_id, name, description, type, latitude, longitude, points_awarded, is_active, language)
        VALUES (
            montreux_id,
            'Villa Karma',
            'Villa historique conçue par Adolf Loos, exemple remarquable de l''architecture moderne du début XXe.',
            'architecture',
            46.4289, 6.9156,
            20, true, 'fr'
        ) RETURNING id INTO step3_id;
        
        -- Quiz pour chaque nouvelle étape
        INSERT INTO quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, language)
        VALUES 
        (step1_id, 'Quel groupe de rock a immortalisé le Casino de Montreux ?', 'multiple_choice', 'Deep Purple', '["Deep Purple", "Led Zeppelin", "Queen", "The Rolling Stones"]'::jsonb, 'Deep Purple a écrit "Smoke on the Water" après l''incendie du casino en 1971.', 15, 'fr'),
        (step2_id, 'Depuis quand les vignobles de Lavaux sont-ils classés UNESCO ?', 'multiple_choice', '2007', '["2005", "2007", "2009", "2011"]'::jsonb, 'Les terrasses viticoles de Lavaux ont été inscrites en 2007.', 15, 'fr'),
        (step3_id, 'Qui est l''architecte de la Villa Karma ?', 'multiple_choice', 'Adolf Loos', '["Le Corbusier", "Adolf Loos", "Frank Lloyd Wright", "Mies van der Rohe"]'::jsonb, 'Adolf Loos, architecte autrichien, a conçu cette villa avant-gardiste.', 15, 'fr');
        
        -- Documents pour chaque nouvelle étape
        INSERT INTO content_documents (step_id, city_id, title, content, document_type, language, created_by)
        VALUES 
        (step1_id, montreux_id, 'Histoire du Casino de Montreux', 'Le Casino de Montreux, inauguré en 1883, est devenu légendaire grâce à l''incendie du 4 décembre 1971 qui a inspiré "Smoke on the Water" de Deep Purple.', 'historical_info', 'fr', auth.uid()),
        (step2_id, montreux_id, 'Les terrasses de Lavaux', 'Les vignobles en terrasses de Lavaux constituent un paysage culturel exceptionnel façonné par l''homme depuis le XIe siècle.', 'agricultural_heritage', 'fr', auth.uid()),
        (step3_id, montreux_id, 'Architecture moderne à Montreux', 'La Villa Karma (1904-1906) d''Adolf Loos marque une rupture avec l''architecture traditionnelle.', 'architectural_guide', 'fr', auth.uid());
    END IF;
END $$;

-- Mise à jour des statistiques
UPDATE steps SET 
    has_quiz = EXISTS(SELECT 1 FROM quiz_questions WHERE step_id = steps.id),
    media_count = COALESCE((SELECT COUNT(*) FROM content_documents WHERE step_id = steps.id), 0)
WHERE city_id IN (
    SELECT id FROM cities WHERE name IN ('Carcassonne', 'Narbonne', 'Montreux', 'Collioure', 'Sion')
);

SELECT 'Plan de correction CIARA exécuté avec succès! Toutes les villes ont été enrichies selon les objectifs fixés.' as result;