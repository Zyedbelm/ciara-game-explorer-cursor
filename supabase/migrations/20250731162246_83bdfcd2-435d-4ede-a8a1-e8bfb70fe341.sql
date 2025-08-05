-- Add comprehensive steps for the new Collioure journeys

DO $$
DECLARE
    collioure_city_id UUID;
    journey_art_culture UUID;
    journey_gastronomie UUID;
    journey_vieille_ville UUID;
    journey_patrimoine UUID;
    journey_randonnees UUID;
    step_id UUID;
    step_count INTEGER := 0;
BEGIN
    -- Get Collioure city ID
    SELECT id INTO collioure_city_id FROM public.cities WHERE slug = 'collioure';
    
    -- Get journey IDs
    SELECT j.id INTO journey_art_culture 
    FROM public.journeys j 
    JOIN public.journey_categories jc ON j.category_id = jc.id 
    WHERE j.city_id = collioure_city_id AND jc.slug = 'art-culture';
    
    SELECT j.id INTO journey_gastronomie 
    FROM public.journeys j 
    JOIN public.journey_categories jc ON j.category_id = jc.id 
    WHERE j.city_id = collioure_city_id AND jc.slug = 'gastronomie-locale';
    
    SELECT j.id INTO journey_vieille_ville 
    FROM public.journeys j 
    JOIN public.journey_categories jc ON j.category_id = jc.id 
    WHERE j.city_id = collioure_city_id AND jc.slug = 'vieille-ville';
    
    SELECT j.id INTO journey_patrimoine 
    FROM public.journeys j 
    JOIN public.journey_categories jc ON j.category_id = jc.id 
    WHERE j.city_id = collioure_city_id AND jc.slug = 'patrimoine-culturel';
    
    SELECT j.id INTO journey_randonnees 
    FROM public.journeys j 
    JOIN public.journey_categories jc ON j.category_id = jc.id 
    WHERE j.city_id = collioure_city_id AND jc.slug = 'randonnees-nature';
    
    -- STEPS FOR ART ET CULTURE JOURNEY
    IF journey_art_culture IS NOT NULL THEN
        -- Step 1: Musée d'Art Moderne
        INSERT INTO public.steps (
            city_id, name, description, latitude, longitude, points_awarded, 
            validation_radius, has_quiz, type, address, is_active
        ) VALUES (
            collioure_city_id,
            'Musée d''Art Moderne de Collioure',
            'Situé dans la villa Pams, ce musée présente une remarquable collection d''œuvres inspirées par Collioure, des Fauves aux artistes contemporains. Un voyage à travers l''histoire artistique de la ville.',
            42.5241, 3.0853, 25, 30, true, 'museum',
            'Route de Port-Vendres, 66190 Collioure', true
        ) RETURNING id INTO step_id;
        
        INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
        VALUES (journey_art_culture, step_id, 1);
        step_count := step_count + 1;
        
        -- Step 2: Atelier de Matisse
        INSERT INTO public.steps (
            city_id, name, description, latitude, longitude, points_awarded, 
            validation_radius, has_quiz, type, address, is_active
        ) VALUES (
            collioure_city_id,
            'L''Atelier de Matisse',
            'Découvrez l''emplacement de l''ancien atelier d''Henri Matisse. C''est ici que le maître a créé certaines de ses œuvres les plus célèbres entre 1905 et 1914, révolutionnant l''art moderne.',
            42.5250, 3.0841, 20, 25, true, 'historic_site',
            'Rue de la Peix, 66190 Collioure', true
        ) RETURNING id INTO step_id;
        
        INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
        VALUES (journey_art_culture, step_id, 2);
        step_count := step_count + 1;
        
        -- Step 3: Le Clocher des Fauves
        INSERT INTO public.steps (
            city_id, name, description, latitude, longitude, points_awarded, 
            validation_radius, has_quiz, type, address, is_active
        ) VALUES (
            collioure_city_id,
            'Le Clocher des Fauves',
            'Admirez le célèbre clocher de Collioure depuis l''angle exact que Matisse et Derain ont immortalisé dans leurs toiles fauves. Un symbole de l''art moderne né à Collioure.',
            42.5260, 3.0836, 15, 20, true, 'viewpoint',
            'Place de l''Église, 66190 Collioure', true
        ) RETURNING id INTO step_id;
        
        INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
        VALUES (journey_art_culture, step_id, 3);
        step_count := step_count + 1;
    END IF;
    
    -- STEPS FOR GASTRONOMIE JOURNEY
    IF journey_gastronomie IS NOT NULL THEN
        -- Step 1: Anchois de Collioure
        INSERT INTO public.steps (
            city_id, name, description, latitude, longitude, points_awarded, 
            validation_radius, has_quiz, type, address, is_active
        ) VALUES (
            collioure_city_id,
            'Maison des Anchois',
            'Découvrez le secret des fameux anchois de Collioure, une tradition séculaire transmise de génération en génération. Visitez une authentique salaison et apprenez les techniques ancestrales.',
            42.5245, 3.0825, 30, 25, true, 'local_business',
            'Rue Voltaire, 66190 Collioure', true
        ) RETURNING id INTO step_id;
        
        INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
        VALUES (journey_gastronomie, step_id, 1);
        step_count := step_count + 1;
        
        -- Step 2: Cave à Banyuls
        INSERT INTO public.steps (
            city_id, name, description, latitude, longitude, points_awarded, 
            validation_radius, has_quiz, type, address, is_active
        ) VALUES (
            collioure_city_id,
            'Cave des Dominicains',
            'Plongez dans l''univers du Banyuls, ce vin doux naturel emblématique de la région. Dégustation et découverte des terroirs en terrasses face à la Méditerranée.',
            42.5255, 3.0845, 25, 30, true, 'winery',
            'Avenue du Général de Gaulle, 66190 Collioure', true
        ) RETURNING id INTO step_id;
        
        INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
        VALUES (journey_gastronomie, step_id, 2);
        step_count := step_count + 1;
        
        -- Step 3: Marché Local
        INSERT INTO public.steps (
            city_id, name, description, latitude, longitude, points_awarded, 
            validation_radius, has_quiz, type, address, is_active
        ) VALUES (
            collioure_city_id,
            'Marché de Collioure',
            'Explorez le marché coloré de Collioure et ses produits locaux : fruits de mer fraîchement pêchés, légumes des terrasses catalanes, et spécialités régionales authentiques.',
            42.5265, 3.0830, 20, 25, true, 'market',
            'Place du 18 Juin, 66190 Collioure', true
        ) RETURNING id INTO step_id;
        
        INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
        VALUES (journey_gastronomie, step_id, 3);
        step_count := step_count + 1;
    END IF;
    
    -- STEPS FOR VIEILLE VILLE JOURNEY
    IF journey_vieille_ville IS NOT NULL THEN
        -- Step 1: Château Royal
        INSERT INTO public.steps (
            city_id, name, description, latitude, longitude, points_awarded, 
            validation_radius, has_quiz, type, address, is_active
        ) VALUES (
            collioure_city_id,
            'Château Royal de Collioure',
            'Explorez cette forteresse médiévale, témoin de l''histoire tumultueuse de Collioure. Des Templiers aux rois d''Aragon, puis aux rois de France, chaque pierre raconte une époque.',
            42.5269, 3.0833, 30, 35, true, 'castle',
            'Rue du Château, 66190 Collioure', true
        ) RETURNING id INTO step_id;
        
        INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
        VALUES (journey_vieille_ville, step_id, 1);
        step_count := step_count + 1;
        
        -- Step 2: Église Notre-Dame-des-Anges
        INSERT INTO public.steps (
            city_id, name, description, latitude, longitude, points_awarded, 
            validation_radius, has_quiz, type, address, is_active
        ) VALUES (
            collioure_city_id,
            'Église Notre-Dame-des-Anges',
            'Visitez cette église unique avec son clocher-phare, symbole de Collioure. Son retable baroque et son histoire maritime en font un joyau du patrimoine catalan.',
            42.5261, 3.0836, 25, 30, true, 'church',
            'Place de l''Église, 66190 Collioure', true
        ) RETURNING id INTO step_id;
        
        INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
        VALUES (journey_vieille_ville, step_id, 2);
        step_count := step_count + 1;
        
        -- Step 3: Rue du Soleil
        INSERT INTO public.steps (
            city_id, name, description, latitude, longitude, points_awarded, 
            validation_radius, has_quiz, type, address, is_active
        ) VALUES (
            collioure_city_id,
            'Rue du Soleil',
            'Flânez dans cette rue pittoresque aux façades colorées typiques de la Catalogne. Boutiques d''artisans, galeries d''art et architecture catalane traditionnelle vous attendent.',
            42.5255, 3.0840, 15, 20, true, 'street',
            'Rue du Soleil, 66190 Collioure', true
        ) RETURNING id INTO step_id;
        
        INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
        VALUES (journey_vieille_ville, step_id, 3);
        step_count := step_count + 1;
    END IF;
    
    RAISE NOTICE 'Created % new steps for Collioure journeys', step_count;
    
END $$;