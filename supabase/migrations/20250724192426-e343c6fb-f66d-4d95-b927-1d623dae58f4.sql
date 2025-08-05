-- Update existing Swiss cities with hero images
UPDATE public.cities SET hero_image_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop' WHERE slug = 'sion';
UPDATE public.cities SET hero_image_url = 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200&h=800&fit=crop' WHERE slug = 'geneva';
UPDATE public.cities SET hero_image_url = 'https://images.unsplash.com/photo-1580837119756-563d608dd119?w=1200&h=800&fit=crop' WHERE slug = 'lausanne';
UPDATE public.cities SET hero_image_url = 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1200&h=800&fit=crop' WHERE slug = 'montreux';

-- Get France country ID
DO $$
DECLARE
    france_id uuid;
    sete_id uuid := gen_random_uuid();
    narbonne_id uuid := gen_random_uuid();
    collioure_id uuid := gen_random_uuid();
    gruissan_id uuid := gen_random_uuid();
    carcassonne_id uuid := gen_random_uuid();
    
    -- Category IDs for each city
    sete_patrimoine_id uuid := gen_random_uuid();
    sete_gastro_id uuid := gen_random_uuid();
    sete_nature_id uuid := gen_random_uuid();
    sete_ville_id uuid := gen_random_uuid();
    sete_art_id uuid := gen_random_uuid();
    
    narbonne_patrimoine_id uuid := gen_random_uuid();
    narbonne_gastro_id uuid := gen_random_uuid();
    narbonne_nature_id uuid := gen_random_uuid();
    narbonne_ville_id uuid := gen_random_uuid();
    narbonne_art_id uuid := gen_random_uuid();
    
    collioure_patrimoine_id uuid := gen_random_uuid();
    collioure_gastro_id uuid := gen_random_uuid();
    collioure_nature_id uuid := gen_random_uuid();
    collioure_ville_id uuid := gen_random_uuid();
    collioure_art_id uuid := gen_random_uuid();
    
    gruissan_patrimoine_id uuid := gen_random_uuid();
    gruissan_gastro_id uuid := gen_random_uuid();
    gruissan_nature_id uuid := gen_random_uuid();
    gruissan_ville_id uuid := gen_random_uuid();
    gruissan_art_id uuid := gen_random_uuid();
    
    carcassonne_patrimoine_id uuid := gen_random_uuid();
    carcassonne_gastro_id uuid := gen_random_uuid();
    carcassonne_nature_id uuid := gen_random_uuid();
    carcassonne_ville_id uuid := gen_random_uuid();
    carcassonne_art_id uuid := gen_random_uuid();
    
    -- Step IDs for each city
    sete_step1 uuid := gen_random_uuid();
    sete_step2 uuid := gen_random_uuid();
    sete_step3 uuid := gen_random_uuid();
    sete_step4 uuid := gen_random_uuid();
    sete_step5 uuid := gen_random_uuid();
    
    narbonne_step1 uuid := gen_random_uuid();
    narbonne_step2 uuid := gen_random_uuid();
    narbonne_step3 uuid := gen_random_uuid();
    narbonne_step4 uuid := gen_random_uuid();
    narbonne_step5 uuid := gen_random_uuid();
    
    collioure_step1 uuid := gen_random_uuid();
    collioure_step2 uuid := gen_random_uuid();
    collioure_step3 uuid := gen_random_uuid();
    collioure_step4 uuid := gen_random_uuid();
    
    gruissan_step1 uuid := gen_random_uuid();
    gruissan_step2 uuid := gen_random_uuid();
    gruissan_step3 uuid := gen_random_uuid();
    
    carcassonne_step1 uuid := gen_random_uuid();
    carcassonne_step2 uuid := gen_random_uuid();
    carcassonne_step3 uuid := gen_random_uuid();
    carcassonne_step4 uuid := gen_random_uuid();
    
    -- Journey IDs
    sete_journey1 uuid := gen_random_uuid();
    sete_journey2 uuid := gen_random_uuid();
    narbonne_journey1 uuid := gen_random_uuid();
    narbonne_journey2 uuid := gen_random_uuid();
    collioure_journey1 uuid := gen_random_uuid();
    gruissan_journey1 uuid := gen_random_uuid();
    carcassonne_journey1 uuid := gen_random_uuid();
    carcassonne_journey2 uuid := gen_random_uuid();
BEGIN
    -- Get France country ID
    SELECT id INTO france_id FROM public.countries WHERE code = 'FR';
    
    IF france_id IS NULL THEN
        INSERT INTO public.countries (id, code, name_fr, name_en, name_de, is_active, display_order)
        VALUES (gen_random_uuid(), 'FR', 'France', 'France', 'Frankreich', true, 1)
        RETURNING id INTO france_id;
    END IF;
    
    -- Insert new French cities
    INSERT INTO public.cities (id, name, slug, description, latitude, longitude, country_id, timezone, default_language, supported_languages, hero_image_url, is_visible_on_homepage) VALUES
    (sete_id, 'Sète', 'sete', 'Perle de la Méditerranée, Sète vous charme avec ses canaux, ses traditions maritimes et sa gastronomie unique.', 43.4042, 3.6936, france_id, 'Europe/Paris', 'fr', ARRAY['fr', 'en'], 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1200&h=800&fit=crop', true),
    (narbonne_id, 'Narbonne', 'narbonne', 'Ancienne capitale de la Gaule, Narbonne dévoile 2000 ans d''histoire entre monuments romains et architecture gothique.', 43.1839, 3.0044, france_id, 'Europe/Paris', 'fr', ARRAY['fr', 'en'], 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200&h=800&fit=crop', true),
    (collioure_id, 'Collioure', 'collioure', 'Joyau de la Côte Vermeille, Collioure séduit par ses maisons colorées, son château royal et ses criques sauvages.', 42.5262, 3.0838, france_id, 'Europe/Paris', 'fr', ARRAY['fr', 'en'], 'https://images.unsplash.com/photo-1580837119756-563d608dd119?w=1200&h=800&fit=crop', true),
    (gruissan_id, 'Gruissan', 'gruissan', 'Entre étangs et Méditerranée, Gruissan vous offre un cadre préservé avec ses salines, ses flamants roses et ses plages sauvages.', 43.1089, 3.0871, france_id, 'Europe/Paris', 'fr', ARRAY['fr', 'en'], 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop', true),
    (carcassonne_id, 'Carcassonne', 'carcassonne', 'Cité médiévale classée UNESCO, Carcassonne vous transporte au cœur du Moyen Âge avec ses remparts et sa forteresse.', 43.2127, 2.3490, france_id, 'Europe/Paris', 'fr', ARRAY['fr', 'en'], 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1200&h=800&fit=crop', true);
    
    -- Insert journey categories for each city
    INSERT INTO public.journey_categories (id, city_id, name, slug, description, type, difficulty, estimated_duration, icon, color) VALUES
    -- Sète categories
    (sete_patrimoine_id, sete_id, 'Patrimoine Maritime', 'patrimoine-maritime', 'Découvrez l''héritage maritime de Sète', 'patrimoine-culturel', 'easy', 120, 'anchor', '#1E40AF'),
    (sete_gastro_id, sete_id, 'Gastronomie Sétoise', 'gastronomie-setoise', 'Savourez les spécialités de la mer', 'gastronomie-locale', 'easy', 90, 'utensils', '#DC2626'),
    (sete_nature_id, sete_id, 'Canaux et Nature', 'canaux-nature', 'Explorez les canaux et espaces naturels', 'randonnees-nature', 'medium', 150, 'waves', '#059669'),
    (sete_ville_id, sete_id, 'Centre Historique', 'centre-historique', 'Promenade dans le vieux Sète', 'vieille-ville', 'easy', 60, 'building', '#7C3AED'),
    (sete_art_id, sete_id, 'Art et Culture', 'art-culture', 'Musées et sites culturels sétois', 'art-culture', 'easy', 90, 'palette', '#F59E0B'),
    
    -- Narbonne categories
    (narbonne_patrimoine_id, narbonne_id, 'Patrimoine Romain', 'patrimoine-romain', 'Sur les traces de la Rome antique', 'patrimoine-culturel', 'easy', 120, 'landmark', '#8B4513'),
    (narbonne_gastro_id, narbonne_id, 'Gastronomie Narbonnaise', 'gastronomie-narbonnaise', 'Découvrez les saveurs du terroir', 'gastronomie-locale', 'easy', 90, 'utensils', '#DC2626'),
    (narbonne_nature_id, narbonne_id, 'Nature et Vignobles', 'nature-vignobles', 'Entre nature et vignes', 'randonnees-nature', 'medium', 180, 'grape', '#059669'),
    (narbonne_ville_id, narbonne_id, 'Centre Médiéval', 'centre-medieval', 'Le cœur historique de Narbonne', 'vieille-ville', 'easy', 75, 'building', '#7C3AED'),
    (narbonne_art_id, narbonne_id, 'Arts et Musées', 'arts-musees', 'Richesses culturelles narbonnaises', 'art-culture', 'easy', 90, 'palette', '#F59E0B'),
    
    -- Collioure categories  
    (collioure_patrimoine_id, collioure_id, 'Patrimoine Royal', 'patrimoine-royal', 'Château et fortifications', 'patrimoine-culturel', 'easy', 90, 'castle', '#8B4513'),
    (collioure_gastro_id, collioure_id, 'Gastronomie Catalane', 'gastronomie-catalane', 'Saveurs de Catalogne', 'gastronomie-locale', 'easy', 75, 'utensils', '#DC2626'),
    (collioure_nature_id, collioure_id, 'Côte Vermeille', 'cote-vermeille', 'Criques et sentiers côtiers', 'randonnees-nature', 'medium', 120, 'mountain', '#059669'),
    (collioure_ville_id, collioure_id, 'Village de Pêcheurs', 'village-pecheurs', 'Le charme de Collioure', 'vieille-ville', 'easy', 45, 'building', '#7C3AED'),
    (collioure_art_id, collioure_id, 'Art et Fauvisme', 'art-fauvisme', 'Sur les pas des peintres', 'art-culture', 'easy', 60, 'palette', '#F59E0B'),
    
    -- Gruissan categories
    (gruissan_patrimoine_id, gruissan_id, 'Patrimoine Salicole', 'patrimoine-salicole', 'L''héritage des sauniers', 'patrimoine-culturel', 'easy', 90, 'droplets', '#8B4513'),
    (gruissan_gastro_id, gruissan_id, 'Gastronomie Lagunaire', 'gastronomie-lagunaire', 'Produits de l''étang', 'gastronomie-locale', 'easy', 75, 'utensils', '#DC2626'),
    (gruissan_nature_id, gruissan_id, 'Étangs et Flamants', 'etangs-flamants', 'Faune et flore lagunaires', 'randonnees-nature', 'easy', 120, 'bird', '#059669'),
    (gruissan_ville_id, gruissan_id, 'Village Circulaire', 'village-circulaire', 'L''unique village rond', 'vieille-ville', 'easy', 45, 'building', '#7C3AED'),
    (gruissan_art_id, gruissan_id, 'Culture Maritime', 'culture-maritime', 'Traditions et savoir-faire', 'art-culture', 'easy', 60, 'palette', '#F59E0B'),
    
    -- Carcassonne categories
    (carcassonne_patrimoine_id, carcassonne_id, 'Cité Médiévale', 'cite-medievale', 'La forteresse du Moyen Âge', 'patrimoine-culturel', 'easy', 150, 'shield', '#8B4513'),
    (carcassonne_gastro_id, carcassonne_id, 'Gastronomie Audoise', 'gastronomie-audoise', 'Spécialités du pays cathare', 'gastronomie-locale', 'easy', 90, 'utensils', '#DC2626'),
    (carcassonne_nature_id, carcassonne_id, 'Canal du Midi', 'canal-midi', 'Patrimoine mondial UNESCO', 'randonnees-nature', 'easy', 120, 'waves', '#059669'),
    (carcassonne_ville_id, carcassonne_id, 'Bastide Saint-Louis', 'bastide-saint-louis', 'La ville basse médiévale', 'vieille-ville', 'easy', 75, 'building', '#7C3AED'),
    (carcassonne_art_id, carcassonne_id, 'Art et Histoire', 'art-histoire', 'Musées et patrimoine', 'art-culture', 'easy', 90, 'palette', '#F59E0B');
    
    -- Insert steps for each city
    INSERT INTO public.steps (id, city_id, name, description, latitude, longitude, type, points_awarded, validation_radius, has_quiz, is_active, review_status) VALUES
    -- Sète steps
    (sete_step1, sete_id, 'Théâtre de la Mer', 'Théâtre en plein air face à la Méditerranée, lieu mythique des festivals sétois.', 43.4025, 3.6975, 'monument', 20, 30, true, true, 'approved'),
    (sete_step2, sete_id, 'Mont Saint-Clair', 'Point culminant offrant une vue panoramique sur l''étang de Thau et la mer.', 43.3995, 3.6889, 'viewpoint', 25, 50, true, true, 'approved'),
    (sete_step3, sete_id, 'Canaux du Centre-Ville', 'Découverte des canaux bordés de maisons colorées, surnommés la "Venise du Languedoc".', 43.4036, 3.6953, 'canal', 15, 25, true, true, 'approved'),
    (sete_step4, sete_id, 'Halles de Sète', 'Marché couvert réputé pour ses produits de la mer et spécialités locales.', 43.4042, 3.6958, 'market', 20, 25, true, true, 'approved'),
    (sete_step5, sete_id, 'Cimetière Marin', 'Cimetière célèbre immortalisé par Paul Valéry, offrant une vue majestueuse.', 43.4001, 3.6903, 'cemetery', 25, 30, true, true, 'approved'),
    
    -- Narbonne steps
    (narbonne_step1, narbonne_id, 'Cathédrale Saint-Just', 'Cathédrale gothique inachevée, l''une des plus hautes de France.', 43.1847, 3.0031, 'cathedral', 25, 30, true, true, 'approved'),
    (narbonne_step2, narbonne_id, 'Horreum Romain', 'Entrepôts souterrains romains, témoins de l''activité commerciale antique.', 43.1845, 3.0028, 'ruins', 20, 25, true, true, 'approved'),
    (narbonne_step3, narbonne_id, 'Palais des Archevêques', 'Complexe architectural abritant l''hôtel de ville et des musées.', 43.1840, 3.0035, 'palace', 25, 30, true, true, 'approved'),
    (narbonne_step4, narbonne_id, 'Pont des Marchands', 'Pont habité unique en France, vestige médiéval sur la Robine.', 43.1835, 3.0025, 'bridge', 15, 25, true, true, 'approved'),
    (narbonne_step5, narbonne_id, 'Via Domitia', 'Vestiges de l''ancienne voie romaine qui reliait l''Italie à l''Espagne.', 43.1850, 3.0040, 'ruins', 20, 30, true, true, 'approved'),
    
    -- Collioure steps
    (collioure_step1, collioure_id, 'Château Royal', 'Forteresse des rois de Majorque puis des rois de France.', 42.5258, 3.0845, 'castle', 25, 30, true, true, 'approved'),
    (collioure_step2, collioure_id, 'Église Notre-Dame', 'Église fortifiée au clocher emblématique servant d''amer aux marins.', 42.5265, 3.0835, 'church', 20, 25, true, true, 'approved'),
    (collioure_step3, collioure_id, 'Port de Pêche', 'Port coloré immortalisé par les peintres fauves Matisse et Derain.', 42.5260, 3.0840, 'port', 15, 25, true, true, 'approved'),
    (collioure_step4, collioure_id, 'Sentier du Fauvisme', 'Parcours sur les traces des peintres avec reproductions des œuvres.', 42.5255, 3.0850, 'trail', 20, 40, true, true, 'approved'),
    
    -- Gruissan steps
    (gruissan_step1, gruissan_id, 'Tour Barberousse', 'Donjon du XIIIe siècle, vestige du château des archevêques de Narbonne.', 43.1095, 3.0875, 'tower', 25, 30, true, true, 'approved'),
    (gruissan_step2, gruissan_id, 'Salines de Gruissan', 'Site de production de sel avec observation des flamants roses.', 43.1150, 3.1050, 'nature', 20, 50, true, true, 'approved'),
    (gruissan_step3, gruissan_id, 'Village Circulaire', 'Village médiéval organisé en cercles concentriques autour de la tour.', 43.1089, 3.0871, 'village', 15, 30, true, true, 'approved'),
    
    -- Carcassonne steps
    (carcassonne_step1, carcassonne_id, 'Cité de Carcassonne', 'Ensemble fortifié médiéval classé au patrimoine mondial de l''UNESCO.', 43.2063, 2.3637, 'fortress', 30, 50, true, true, 'approved'),
    (carcassonne_step2, carcassonne_id, 'Basilique Saint-Nazaire', 'Église gothique remarquable dans l''enceinte de la Cité.', 43.2058, 2.3645, 'basilica', 25, 30, true, true, 'approved'),
    (carcassonne_step3, carcassonne_id, 'Bastide Saint-Louis', 'Ville basse avec sa place Carnot et ses maisons médiévales.', 43.2127, 2.3490, 'district', 20, 40, true, true, 'approved'),
    (carcassonne_step4, carcassonne_id, 'Canal du Midi', 'Voie navigable du XVIIe siècle reliant Atlantique et Méditerranée.', 43.2140, 2.3520, 'canal', 20, 30, true, true, 'approved');
    
    -- Insert journeys
    INSERT INTO public.journeys (id, city_id, category_id, name, description, difficulty, estimated_duration, distance_km, total_points, is_active, is_predefined, review_status) VALUES
    -- Sète journeys
    (sete_journey1, sete_id, sete_patrimoine_id, 'Découverte Maritime de Sète', 'Un parcours complet pour découvrir l''âme maritime de Sète, de ses canaux à ses hauteurs.', 'easy', 180, 4.5, 105, true, true, 'approved'),
    (sete_journey2, sete_id, sete_nature_id, 'Sète Nature et Panoramas', 'Entre mont Saint-Clair et cimetière marin, découvrez les plus beaux points de vue.', 'medium', 120, 3.2, 70, true, true, 'approved'),
    
    -- Narbonne journeys
    (narbonne_journey1, narbonne_id, narbonne_patrimoine_id, 'Narbonne Antique et Médiévale', 'Voyage dans le temps de la Rome antique au Moyen Âge.', 'easy', 150, 3.8, 105, true, true, 'approved'),
    (narbonne_journey2, narbonne_id, narbonne_ville_id, 'Centre Historique de Narbonne', 'Flânerie dans le cœur historique entre cathédrale et palais.', 'easy', 90, 2.1, 60, true, true, 'approved'),
    
    -- Collioure journey
    (collioure_journey1, collioure_id, collioure_art_id, 'Collioure des Peintres', 'Sur les traces des artistes fauves dans ce joyau méditerranéen.', 'easy', 120, 2.8, 80, true, true, 'approved'),
    
    -- Gruissan journey
    (gruissan_journey1, gruissan_id, gruissan_nature_id, 'Gruissan Authentique', 'Entre patrimoine médiéval et nature préservée.', 'easy', 90, 2.5, 60, true, true, 'approved'),
    
    -- Carcassonne journeys
    (carcassonne_journey1, carcassonne_id, carcassonne_patrimoine_id, 'La Cité Médiévale', 'Exploration complète de la forteresse médiévale la plus célèbre d''Europe.', 'easy', 180, 3.5, 95, true, true, 'approved'),
    (carcassonne_journey2, carcassonne_id, carcassonne_ville_id, 'Deux Villes, Une Histoire', 'De la Cité à la Bastide, découvrez les deux visages de Carcassonne.', 'medium', 150, 4.2, 90, true, true, 'approved');
    
    -- Insert journey steps relationships
    INSERT INTO public.journey_steps (journey_id, step_id, step_order) VALUES
    -- Sète journey 1
    (sete_journey1, sete_step3, 1), (sete_journey1, sete_step4, 2), (sete_journey1, sete_step1, 3), (sete_journey1, sete_step2, 4), (sete_journey1, sete_step5, 5),
    -- Sète journey 2  
    (sete_journey2, sete_step2, 1), (sete_journey2, sete_step5, 2), (sete_journey2, sete_step1, 3),
    -- Narbonne journey 1
    (narbonne_journey1, narbonne_step5, 1), (narbonne_journey1, narbonne_step2, 2), (narbonne_journey1, narbonne_step3, 3), (narbonne_journey1, narbonne_step1, 4), (narbonne_journey1, narbonne_step4, 5),
    -- Narbonne journey 2
    (narbonne_journey2, narbonne_step3, 1), (narbonne_journey2, narbonne_step1, 2), (narbonne_journey2, narbonne_step4, 3),
    -- Collioure journey
    (collioure_journey1, collioure_step3, 1), (collioure_journey1, collioure_step4, 2), (collioure_journey1, collioure_step1, 3), (collioure_journey1, collioure_step2, 4),
    -- Gruissan journey
    (gruissan_journey1, gruissan_step3, 1), (gruissan_journey1, gruissan_step1, 2), (gruissan_journey1, gruissan_step2, 3),
    -- Carcassonne journey 1
    (carcassonne_journey1, carcassonne_step1, 1), (carcassonne_journey1, carcassonne_step2, 2), (carcassonne_journey1, carcassonne_step4, 3),
    -- Carcassonne journey 2
    (carcassonne_journey2, carcassonne_step3, 1), (carcassonne_journey2, carcassonne_step4, 2), (carcassonne_journey2, carcassonne_step1, 3), (carcassonne_journey2, carcassonne_step2, 4);
    
    -- Insert quiz questions for each step
    INSERT INTO public.quiz_questions (step_id, question, options, correct_answer, explanation, points_awarded, bonus_points) VALUES
    -- Sète quizzes
    (sete_step1, 'Quel est le nom du théâtre en plein air de Sète ?', '["Théâtre de la Mer", "Théâtre des Flots", "Théâtre Maritime", "Théâtre Bleu"]', 'Théâtre de la Mer', 'Le Théâtre de la Mer est un lieu emblématique de Sète qui accueille de nombreux festivals.', 10, 5),
    (sete_step2, 'Quelle vue peut-on admirer depuis le mont Saint-Clair ?', '["L''étang de Thau et la mer", "Seulement la mer", "Seulement l''étang", "Les Pyrénées"]', 'L''étang de Thau et la mer', 'Du mont Saint-Clair, on jouit d''une vue exceptionnelle sur l''étang de Thau d''un côté et la Méditerranée de l''autre.', 10, 5),
    (sete_step3, 'Pourquoi Sète est-elle surnommée la "Venise du Languedoc" ?', '["À cause de ses canaux", "À cause de ses gondoles", "À cause de ses masques", "À cause de ses palais"]', 'À cause de ses canaux', 'Les nombreux canaux bordés de maisons colorées évoquent l''atmosphère vénitienne.', 10, 5),
    (sete_step4, 'Que trouve-t-on principalement aux Halles de Sète ?', '["Produits de la mer", "Fruits exotiques", "Épices orientales", "Fromages de montagne"]', 'Produits de la mer', 'Les Halles de Sète sont réputées pour leurs étals de poissons et fruits de mer frais.', 10, 5),
    (sete_step5, 'Quel poète a rendu célèbre le Cimetière Marin ?', '["Paul Valéry", "Charles Baudelaire", "Arthur Rimbaud", "Guillaume Apollinaire"]', 'Paul Valéry', 'Paul Valéry, natif de Sète, a écrit le célèbre poème "Le Cimetière Marin" inspiré de ce lieu.', 10, 5),
    
    -- Narbonne quizzes
    (narbonne_step1, 'Quelle particularité architecturale a la cathédrale Saint-Just de Narbonne ?', '["Elle est inachevée", "Elle a deux clochers", "Elle est souterraine", "Elle est ronde"]', 'Elle est inachevée', 'La cathédrale Saint-Just n''a jamais été terminée, seul le chœur a été construit.', 10, 5),
    (narbonne_step2, 'À quoi servaient les Horrea romains ?', '["Entrepôts", "Thermes", "Théâtres", "Temples"]', 'Entrepôts', 'Les Horrea étaient des entrepôts souterrains où les Romains stockaient les marchandises.', 10, 5),
    (narbonne_step3, 'Que abrite aujourd''hui le Palais des Archevêques ?', '["L''hôtel de ville et des musées", "Une université", "Un hôpital", "Des bureaux"]', 'L''hôtel de ville et des musées', 'Le Palais des Archevêques est devenu l''hôtel de ville et abrite plusieurs musées.', 10, 5),
    (narbonne_step4, 'Qu''est-ce qui rend unique le Pont des Marchands ?', '["Il est habité", "Il est en bois", "Il bouge", "Il est transparent"]', 'Il est habité', 'Le Pont des Marchands est l''un des rares ponts habités de France.', 10, 5),
    (narbonne_step5, 'Que reliait la Via Domitia ?', '["L''Italie à l''Espagne", "Rome à Paris", "L''Italie à la Gaule", "L''Espagne à l''Afrique"]', 'L''Italie à l''Espagne', 'La Via Domitia était une voie romaine stratégique reliant l''Italie à l''Espagne.', 10, 5),
    
    -- Collioure quizzes
    (collioure_step1, 'Qui a fait construire le Château Royal de Collioure ?', '["Les rois de Majorque", "Les rois de France", "Les comtes de Barcelone", "Les rois d''Aragon"]', 'Les rois de Majorque', 'Le château a été édifié par les rois de Majorque au XIIIe siècle.', 10, 5),
    (collioure_step2, 'À quoi servait le clocher de l''église Notre-Dame ?', '["D''amer aux marins", "De tour de guet", "De phare", "De beffroi"]', 'D''amer aux marins', 'Le clocher caractéristique servait de point de repère pour les navigateurs.', 10, 5),
    (collioure_step3, 'Quels peintres ont immortalisé le port de Collioure ?', '["Matisse et Derain", "Picasso et Braque", "Monet et Renoir", "Cézanne et Gauguin"]', 'Matisse et Derain', 'Les peintres fauves Matisse et Derain ont révolutionné l''art en peignant à Collioure.', 10, 5),
    (collioure_step4, 'Que peut-on voir sur le Sentier du Fauvisme ?', '["Reproductions d''œuvres de peintres", "Sculptures modernes", "Jardins botaniques", "Ruines antiques"]', 'Reproductions d''œuvres de peintres', 'Le sentier présente des reproductions des œuvres peintes sur les lieux mêmes par les artistes.', 10, 5),
    
    -- Gruissan quizzes
    (gruissan_step1, 'Quel est le nom de la tour qui domine Gruissan ?', '["Tour Barberousse", "Tour Magne", "Tour de Constance", "Tour du Roi"]', 'Tour Barberousse', 'La Tour Barberousse est le donjon du château des archevêques de Narbonne.', 10, 5),
    (gruissan_step2, 'Quels oiseaux peut-on observer dans les salines ?', '["Flamants roses", "Hérons cendrés", "Cigognes blanches", "Pélicans"]', 'Flamants roses', 'Les salines de Gruissan abritent une importante colonie de flamants roses.', 10, 5),
    (gruissan_step3, 'Comment est organisé le village de Gruissan ?', '["En cercles concentriques", "En damier", "En étoile", "En ligne droite"]', 'En cercles concentriques', 'Gruissan est un village circulaire médiéval unique, organisé en cercles autour de sa tour.', 10, 5),
    
    -- Carcassonne quizzes
    (carcassonne_step1, 'Depuis quand la Cité de Carcassonne est-elle classée UNESCO ?', '["1997", "1985", "2000", "1972"]', '1997', 'La Cité de Carcassonne a été inscrite au patrimoine mondial de l''UNESCO en 1997.', 10, 5),
    (carcassonne_step2, 'Dans quel style architectural est la basilique Saint-Nazaire ?', '["Gothique", "Roman", "Baroque", "Renaissance"]', 'Gothique', 'La basilique Saint-Nazaire est un remarquable exemple de l''art gothique languedocien.', 10, 5),
    (carcassonne_step3, 'Comment appelle-t-on la ville basse de Carcassonne ?', '["Bastide Saint-Louis", "Ville Neuve", "Bourg Saint-Michel", "Quartier des Jacobins"]', 'Bastide Saint-Louis', 'La Bastide Saint-Louis est la ville basse médiévale fondée par Louis IX.', 10, 5),
    (carcassonne_step4, 'Le Canal du Midi relie quelles deux mers ?', '["Atlantique et Méditerranée", "Manche et Méditerranée", "Atlantique et Manche", "Méditerranée et Adriatique"]', 'Atlantique et Méditerranée', 'Le Canal du Midi, œuvre de Pierre-Paul Riquet, relie l''océan Atlantique à la mer Méditerranée.', 10, 5);
    
    RAISE NOTICE 'Plan implementation completed: 5 new French cities created with complete journey data and Swiss cities updated with hero images.';
END $$;