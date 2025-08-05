-- Add comprehensive quizzes and documents for Collioure steps

DO $$
DECLARE
    collioure_city_id UUID;
    step_record RECORD;
    quiz_count INTEGER := 0;
    doc_count INTEGER := 0;
BEGIN
    -- Get Collioure city ID
    SELECT id INTO collioure_city_id FROM public.cities WHERE slug = 'collioure';
    
    -- Loop through all Collioure steps and add quizzes + documents
    FOR step_record IN 
        SELECT id, name, type FROM public.steps 
        WHERE city_id = collioure_city_id AND is_active = true
    LOOP
        -- Add 2-3 quizzes per step based on step type
        CASE step_record.type
            WHEN 'museum' THEN
                -- Quiz 1: Historical knowledge
                INSERT INTO public.quiz_questions (
                    step_id, question, question_type, correct_answer, options, 
                    explanation, points_awarded, bonus_points
                ) VALUES (
                    step_record.id,
                    'Dans quelle villa est installé le Musée d''Art Moderne de Collioure ?',
                    'multiple_choice',
                    'Villa Pams',
                    '["Villa Pams", "Villa Matisse", "Villa Derain", "Villa Dufy"]'::jsonb,
                    'Le Musée d''Art Moderne de Collioure est effectivement installé dans la Villa Pams, une magnifique demeure qui accueille les collections d''art inspirées par la ville.',
                    15, 5
                );
                
                -- Quiz 2: Art movement knowledge
                INSERT INTO public.quiz_questions (
                    step_id, question, question_type, correct_answer, options, 
                    explanation, points_awarded, bonus_points
                ) VALUES (
                    step_record.id,
                    'Quel mouvement artistique a été particulièrement inspiré par Collioure ?',
                    'multiple_choice',
                    'Le Fauvisme',
                    '["Le Fauvisme", "L''Impressionnisme", "Le Cubisme", "Le Surréalisme"]'::jsonb,
                    'Le Fauvisme est né en grande partie à Collioure grâce aux séjours de Matisse et Derain qui ont révolutionné l''usage de la couleur pure.',
                    15, 5
                );
                
                quiz_count := quiz_count + 2;
                
            WHEN 'historic_site' THEN
                -- Quiz 1: Artist knowledge
                INSERT INTO public.quiz_questions (
                    step_id, question, question_type, correct_answer, options, 
                    explanation, points_awarded, bonus_points
                ) VALUES (
                    step_record.id,
                    'Entre quelles années Henri Matisse a-t-il principalement travaillé à Collioure ?',
                    'multiple_choice',
                    '1905-1914',
                    '["1905-1914", "1890-1900", "1920-1930", "1900-1905"]'::jsonb,
                    'Matisse a découvert Collioure en 1905 et y a régulièrement travaillé jusqu''en 1914, période cruciale pour le développement du Fauvisme.',
                    15, 5
                );
                
                -- Quiz 2: Artistic technique
                INSERT INTO public.quiz_questions (
                    step_id, question, question_type, correct_answer, options, 
                    explanation, points_awarded, bonus_points
                ) VALUES (
                    step_record.id,
                    'Quelle innovation artistique Matisse a-t-il développée à Collioure ?',
                    'multiple_choice',
                    'L''usage de couleurs pures non mélangées',
                    '["L''usage de couleurs pures non mélangées", "La perspective aérienne", "Le clair-obscur", "La technique du sfumato"]'::jsonb,
                    'À Collioure, Matisse a libéré la couleur de sa fonction descriptive pour en faire un moyen d''expression pure, caractéristique du Fauvisme.',
                    20, 5
                );
                
                quiz_count := quiz_count + 2;
                
            WHEN 'viewpoint' THEN
                -- Quiz 1: Architectural element
                INSERT INTO public.quiz_questions (
                    step_id, question, question_type, correct_answer, options, 
                    explanation, points_awarded, bonus_points
                ) VALUES (
                    step_record.id,
                    'Quelle particularité architecturale rend le clocher de Collioure unique ?',
                    'multiple_choice',
                    'Il fait office de phare',
                    '["Il fait office de phare", "Il est penché", "Il est en bois", "Il est souterrain"]'::jsonb,
                    'Le clocher de l''église Notre-Dame-des-Anges est unique car il a servi de phare aux marins, d''où sa position remarquable face à la mer.',
                    15, 5
                );
                
                quiz_count := quiz_count + 1;
                
            WHEN 'local_business' THEN
                -- Quiz 1: Local specialty
                INSERT INTO public.quiz_questions (
                    step_id, question, question_type, correct_answer, options, 
                    explanation, points_awarded, bonus_points
                ) VALUES (
                    step_record.id,
                    'Combien de temps faut-il pour l''affinage traditionnel des anchois de Collioure ?',
                    'multiple_choice',
                    '6 mois minimum',
                    '["6 mois minimum", "2 semaines", "1 mois", "1 an"]'::jsonb,
                    'L''affinage traditionnel des anchois de Collioure demande au minimum 6 mois en saumure, ce qui leur donne leur saveur si particulière.',
                    20, 5
                );
                
                -- Quiz 2: Tradition
                INSERT INTO public.quiz_questions (
                    step_id, question, question_type, correct_answer, options, 
                    explanation, points_awarded, bonus_points
                ) VALUES (
                    step_record.id,
                    'Quelle technique traditionnelle est utilisée pour la pêche aux anchois ?',
                    'multiple_choice',
                    'La pêche au lamparo',
                    '["La pêche au lamparo", "La pêche au chalut", "La pêche à la ligne", "La pêche au filet dérivant"]'::jsonb,
                    'La pêche au lamparo utilise la lumière pour attirer les bancs d''anchois la nuit, une technique traditionnelle méditerranéenne.',
                    15, 5
                );
                
                quiz_count := quiz_count + 2;
                
            WHEN 'winery' THEN
                -- Quiz 1: Wine knowledge
                INSERT INTO public.quiz_questions (
                    step_id, question, question_type, correct_answer, options, 
                    explanation, points_awarded, bonus_points
                ) VALUES (
                    step_record.id,
                    'Le Banyuls est un vin de quelle catégorie ?',
                    'multiple_choice',
                    'Vin Doux Naturel (VDN)',
                    '["Vin Doux Naturel (VDN)", "Vin de table", "Vin effervescent", "Vin de liqueur"]'::jsonb,
                    'Le Banyuls est un Vin Doux Naturel, obtenu par mutage (ajout d''alcool) qui interrompt la fermentation et conserve les sucres naturels.',
                    20, 5
                );
                
                quiz_count := quiz_count + 1;
                
            WHEN 'castle' THEN
                -- Quiz 1: Historical periods
                INSERT INTO public.quiz_questions (
                    step_id, question, question_type, correct_answer, options, 
                    explanation, points_awarded, bonus_points
                ) VALUES (
                    step_record.id,
                    'Qui a construit les premières fortifications du Château Royal de Collioure ?',
                    'multiple_choice',
                    'Les Templiers',
                    '["Les Templiers", "Les Romains", "Les Wisigoths", "Les Maures"]'::jsonb,
                    'Les Templiers ont établi les premières fortifications au XIIe siècle, avant que le château ne soit agrandi par les rois d''Aragon.',
                    20, 5
                );
                
                -- Quiz 2: Military architecture
                INSERT INTO public.quiz_questions (
                    step_id, question, question_type, correct_answer, options, 
                    explanation, points_awarded, bonus_points
                ) VALUES (
                    step_record.id,
                    'Quel ingénieur militaire a modernisé les fortifications de Collioure ?',
                    'multiple_choice',
                    'Vauban',
                    '["Vauban", "Coehorn", "Montalembert", "Blondel"]'::jsonb,
                    'Vauban a renforcé et modernisé les fortifications de Collioure au XVIIe siècle selon ses principes révolutionnaires de l''art de la guerre.',
                    20, 5
                );
                
                quiz_count := quiz_count + 2;
                
            ELSE
                -- Generic quiz for other step types
                INSERT INTO public.quiz_questions (
                    step_id, question, question_type, correct_answer, options, 
                    explanation, points_awarded, bonus_points
                ) VALUES (
                    step_record.id,
                    'Dans quelle région de France se trouve Collioure ?',
                    'multiple_choice',
                    'Pyrénées-Orientales',
                    '["Pyrénées-Orientales", "Aude", "Hérault", "Gard"]'::jsonb,
                    'Collioure se situe dans le département des Pyrénées-Orientales, en région Occitanie, près de la frontière espagnole.',
                    10, 5
                );
                
                quiz_count := quiz_count + 1;
        END CASE;
        
        -- Add comprehensive documents for each step
        INSERT INTO public.content_documents (
            step_id, city_id, title, content, document_type, language
        ) VALUES (
            step_record.id,
            collioure_city_id,
            'Informations historiques - ' || step_record.name,
            CASE step_record.type
                WHEN 'museum' THEN 'Le Musée d''Art Moderne de Collioure, installé dans la Villa Pams, est un témoignage vivant de l''effervescence artistique qui a marqué cette ville au début du XXe siècle. La villa elle-même, construite en 1906, est représentative de l''architecture Belle Époque. Le musée abrite une collection exceptionnelle d''œuvres d''artistes qui ont séjourné à Collioure : Matisse, Derain, Dufy, Marquet, Othon Friesz, et bien d''autres. Ces artistes ont été attirés par la lumière méditerranéenne unique et les couleurs intenses du paysage catalan. Le Fauvisme, mouvement révolutionnaire de l''art moderne, est né en grande partie ici, libérant la couleur de sa fonction descriptive pour en faire un moyen d''expression pure. La collection permanente permet de comprendre l''évolution de l''art moderne et l''influence déterminante de Collioure sur les avant-gardes artistiques européennes.'
                WHEN 'historic_site' THEN 'L''atelier de Matisse à Collioure marque un tournant décisif dans l''histoire de l''art moderne. Henri Matisse découvre Collioure en mai 1905, sur les conseils de son ami Maillol. Accompagné d''André Derain, il s''installe dans cette maison de la rue de la Peix et y peint ses premières œuvres fauves. C''est ici qu''il réalise "Femme au chapeau", "Les toits de Collioure", et "La fenêtre ouverte". L''intense luminosité méditerranéenne libère Matisse des contraintes de la couleur locale : les ombres deviennent violettes, les visages verts, les arbres rouges. Cette révolution coloriste scandalisera le Salon d''Automne de 1905, donnant naissance au terme "Fauve". L''atelier, bien que transformé, reste un lieu de pèlerinage pour les amateurs d''art, symbole de cette période créatrice extraordinaire qui a changé à jamais la perception artistique occidentale.'
                WHEN 'viewpoint' THEN 'Le clocher de l''église Notre-Dame-des-Anges est l''emblème de Collioure, immortalisé par d''innombrables artistes. Sa particularité unique réside dans sa double fonction : tour de guet et phare maritime. Construit au XVIIe siècle, il remplace l''ancien clocher détruit lors des travaux de fortification de Vauban. Sa forme cylindrique et sa coupole colorée en font un repère visuel exceptionnel, visible tant depuis la mer que depuis les collines environnantes. Matisse et Derain l''ont peint sous tous les angles, fascinés par ses reflets changeants selon les heures et les saisons. Le clocher-phare guidait les pêcheurs rentrant au port, particulièrement important pour la flotte de barques catalanes qui pratiquaient la pêche aux anchois. Aujourd''hui encore, il reste le symbole de l''identité maritime et artistique de Collioure, point de convergence entre tradition catalane et modernité artistique.'
                WHEN 'local_business' THEN 'Les anchois de Collioure bénéficient d''une renommée internationale grâce à un savoir-faire séculaire transmis de génération en génération. La pêche aux anchois se pratique traditionnellement de mai à octobre, utilisant la technique du lamparo : des barques sortent la nuit avec de puissants projecteurs pour attirer les bancs de poissons. Une fois pêchés, les anchois subissent un processus d''affinage minutieux : étêtage, éviscération, puis salaison en saumure pendant au minimum six mois. Cette maturation lente développe leurs arômes caractéristiques et leur texture fondante. Les salaisons familiales de Collioure perpétuent ces gestes ancestraux, utilisant encore les mêmes bacs de grès et les mêmes recettes que leurs aïeux. L''anchois de Collioure, protégé par une Indication Géographique Protégée depuis 2004, représente l''excellence de la gastronomie catalane et l''authenticité d''une tradition maritime préservée.'
                WHEN 'winery' THEN 'Le Banyuls, vin doux naturel emblématique du Roussillon, tire son caractère exceptionnel des terroirs en terrasses qui surplombent la Méditerranée. Ces vignobles vertigineux, façonnés par des générations de vignerons catalans, bénéficient d''un microclimat unique où se mélangent influences marines et montagnardes. Le cépage principal, le Grenache noir, atteint ici une maturité parfaite grâce à plus de 300 jours de soleil par an et aux vents de Tramontane qui concentrent les arômes. Le processus de vinification, par mutage à l''alcool vinique, interrompt la fermentation et préserve les sucres naturels, créant ce nectar aux saveurs complexes. L''élevage en bonbonnes de verre exposées au soleil et aux variations thermiques développe les notes de fruits confits, d''épices et de cacao. Ce "vin de soleil" accompagne parfaitement les spécialités catalanes et représente l''art de vivre méditerranéen dans toute sa splendeur.'
                WHEN 'castle' THEN 'Le Château Royal de Collioure constitue un remarquable exemple d''architecture militaire méditerranéenne, synthèse de huit siècles d''histoire mouvementée. Fondé par les Templiers au XIIe siècle, il est agrandi par les rois d''Aragon qui en font une forteresse majeure de la Catalogne Nord. La domination espagnole (XIVe-XVIIe siècles) lui confère son caractère hispanique avec ses tours rondes et ses coursives. L''annexion française en 1659 entraîne sa transformation par Vauban selon les principes de la fortification moderne : bastions, casemates, et adaptation à l''artillerie. Le château contrôle la baie et les routes commerciales vers l''Espagne, position stratégique qui explique sa remarquable conservation. Ses murs épais renferment chapelles gothiques, salles d''armes, et cachots, témoins des différentes époques. Classé Monument Historique, il abrite aujourd''hui expositions et manifestations culturelles, réconciliant patrimoine militaire et vocation artistique de Collioure.'
                ELSE 'Collioure, perle de la Côte Vermeille, concentre en son sein toute la richesse de l''identité catalane. Cette cité maritime, nichée entre mer et montagne, a su préserver son authenticité tout en s''ouvrant à la modernité artistique. Ses ruelles pavées, ses maisons aux façades colorées, ses barques catalanes amarrées dans le port racontent l''histoire d''un peuple fier de ses traditions. La langue catalane résonne encore dans les conversations des anciens, les sardanes se dansent sur la place lors des fêtes patronales, et les spécialités culinaires perpétuent les saveurs d''antan. Chaque pierre, chaque recoin recèle des histoires transmises oralement, créant cette atmosphère unique qui a séduit tant d''artistes. Collioure incarne parfaitement l''art de vivre méditerranéen : convivialité, respect des traditions, et ouverture sur le monde.'
            END,
            'historical_info',
            'fr'
        );
        
        doc_count := doc_count + 1;
        
    END LOOP;
    
    -- Update journey metadata with correct point totals
    UPDATE public.journeys 
    SET estimated_duration = (
        SELECT COALESCE(SUM(CASE WHEN s.type = 'museum' THEN 30 WHEN s.type = 'castle' THEN 45 ELSE 20 END), 60)
        FROM public.journey_steps js 
        JOIN public.steps s ON js.step_id = s.id 
        WHERE js.journey_id = journeys.id
    )
    WHERE city_id = collioure_city_id;
    
    RAISE NOTICE 'Added % quizzes and % documents to Collioure steps', quiz_count, doc_count;
    
END $$;