-- Implementation plan for Collioure content improvement
-- First, let's get the Collioure city ID and verify current content

DO $$
DECLARE
    collioure_city_id UUID;
    category_art_culture UUID;
    category_gastronomie UUID;
    category_vieille_ville UUID;
    journey_art_culture UUID;
    journey_gastronomie UUID;
    journey_vieille_ville UUID;
    step_id UUID;
    quiz_id UUID;
    doc_id UUID;
BEGIN
    -- Get Collioure city ID
    SELECT id INTO collioure_city_id FROM public.cities WHERE slug = 'collioure';
    
    IF collioure_city_id IS NULL THEN
        RAISE EXCEPTION 'Collioure city not found';
    END IF;
    
    RAISE NOTICE 'Found Collioure city ID: %', collioure_city_id;
    
    -- 1. CREATE MISSING JOURNEY CATEGORIES
    
    -- Art et Culture category
    INSERT INTO public.journey_categories (
        city_id, name, slug, description, type, difficulty, estimated_duration, icon, color,
        name_en, name_de, description_en, description_de
    ) VALUES (
        collioure_city_id, 
        'Art et Culture', 
        'art-culture', 
        'Découvrez l''art et la culture catalane de Collioure', 
        'art-culture', 
        'easy', 
        90, 
        'palette', 
        '#F59E0B',
        'Art and Culture',
        'Kunst und Kultur',
        'Discover the Catalan art and culture of Collioure',
        'Entdecken Sie die katalanische Kunst und Kultur von Collioure'
    ) ON CONFLICT (city_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description
    RETURNING id INTO category_art_culture;
    
    -- Gastronomie Locale category
    INSERT INTO public.journey_categories (
        city_id, name, slug, description, type, difficulty, estimated_duration, icon, color,
        name_en, name_de, description_en, description_de
    ) VALUES (
        collioure_city_id, 
        'Gastronomie Locale', 
        'gastronomie-locale', 
        'Savourez les spécialités culinaires catalanes', 
        'gastronomie-locale', 
        'easy', 
        120, 
        'utensils', 
        '#DC2626',
        'Local Gastronomy',
        'Lokale Gastronomie',
        'Savor the Catalan culinary specialties',
        'Genießen Sie die katalanischen Spezialitäten'
    ) ON CONFLICT (city_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description
    RETURNING id INTO category_gastronomie;
    
    -- Vieille Ville category
    INSERT INTO public.journey_categories (
        city_id, name, slug, description, type, difficulty, estimated_duration, icon, color,
        name_en, name_de, description_en, description_de
    ) VALUES (
        collioure_city_id, 
        'Vieille Ville', 
        'vieille-ville', 
        'Promenade dans les ruelles historiques de Collioure', 
        'vieille-ville', 
        'easy', 
        75, 
        'building', 
        '#7C3AED',
        'Old Town',
        'Altstadt',
        'Stroll through the historic streets of Collioure',
        'Spaziergang durch die historischen Gassen von Collioure'
    ) ON CONFLICT (city_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description
    RETURNING id INTO category_vieille_ville;
    
    -- 2. CREATE NEW JOURNEYS
    
    -- Art et Culture Journey
    INSERT INTO public.journeys (
        city_id, category_id, name, description, difficulty, estimated_duration, 
        points_total, is_active, is_predefined, created_by,
        name_en, name_de, description_en, description_de
    ) VALUES (
        collioure_city_id,
        category_art_culture,
        'Sur les traces des Peintres',
        'Découvrez Collioure à travers les yeux des grands maîtres de la peinture. De Matisse à Derain, explorez les lieux qui ont inspiré les Fauves et révolutionné l''art moderne.',
        'easy',
        90,
        180,
        true,
        true,
        '00000000-0000-0000-0000-000000000000',
        'In the Footsteps of Painters',
        'Auf den Spuren der Maler',
        'Discover Collioure through the eyes of great masters of painting. From Matisse to Derain, explore the places that inspired the Fauves and revolutionized modern art.',
        'Entdecken Sie Collioure durch die Augen der großen Malmeister. Von Matisse bis Derain, erkunden Sie die Orte, die die Fauves inspirierten und die moderne Kunst revolutionierten.'
    ) RETURNING id INTO journey_art_culture;
    
    -- Gastronomie Locale Journey
    INSERT INTO public.journeys (
        city_id, category_id, name, description, difficulty, estimated_duration, 
        points_total, is_active, is_predefined, created_by,
        name_en, name_de, description_en, description_de
    ) VALUES (
        collioure_city_id,
        category_gastronomie,
        'Saveurs Catalanes',
        'Embarquez pour un voyage gustatif à travers Collioure. Découvrez les anchois de Collioure, les vins de Banyuls et toutes les spécialités qui font la renommée gastronomique de la région.',
        'easy',
        120,
        200,
        true,
        true,
        '00000000-0000-0000-0000-000000000000',
        'Catalan Flavors',
        'Katalanische Geschmäcker',
        'Embark on a taste journey through Collioure. Discover Collioure anchovies, Banyuls wines and all the specialties that make the region''s gastronomic reputation.',
        'Begeben Sie sich auf eine Geschmacksreise durch Collioure. Entdecken Sie Collioure-Sardellen, Banyuls-Weine und alle Spezialitäten, die den gastronomischen Ruf der Region ausmachen.'
    ) RETURNING id INTO journey_gastronomie;
    
    -- Vieille Ville Journey
    INSERT INTO public.journeys (
        city_id, category_id, name, description, difficulty, estimated_duration, 
        points_total, is_active, is_predefined, created_by,
        name_en, name_de, description_en, description_de
    ) VALUES (
        collioure_city_id,
        category_vieille_ville,
        'Cœur Historique de Collioure',
        'Plongez dans l''histoire millénaire de Collioure en parcourant ses ruelles pavées, ses places ombragées et ses monuments emblématiques. Une promenade au cœur du patrimoine catalan.',
        'easy',
        75,
        150,
        true,
        true,
        '00000000-0000-0000-0000-000000000000',
        'Historic Heart of Collioure',
        'Historisches Herz von Collioure',
        'Dive into the thousand-year history of Collioure by walking through its cobbled streets, shaded squares and emblematic monuments. A walk in the heart of Catalan heritage.',
        'Tauchen Sie in die tausendjährige Geschichte von Collioure ein, indem Sie durch die gepflasterten Straßen, schattigen Plätze und emblematischen Denkmäler wandeln.'
    ) RETURNING id INTO journey_vieille_ville;
    
    -- 3. CREATE NEW STEPS FOR ART ET CULTURE JOURNEY
    
    -- Step 1: Musée d'Art Moderne
    INSERT INTO public.steps (
        city_id, name, description, latitude, longitude, points_awarded, 
        validation_radius, has_quiz, type, address,
        name_en, name_de, description_en, description_de
    ) VALUES (
        collioure_city_id,
        'Musée d''Art Moderne de Collioure',
        'Situé dans la villa Pams, ce musée présente une remarquable collection d''œuvres inspirées par Collioure, des Fauves aux artistes contemporains.',
        42.5241,
        3.0853,
        25,
        30,
        true,
        'museum',
        'Route de Port-Vendres, 66190 Collioure',
        'Modern Art Museum of Collioure',
        'Museum für moderne Kunst in Collioure',
        'Located in Villa Pams, this museum presents a remarkable collection of works inspired by Collioure, from the Fauves to contemporary artists.',
        'Dieses Museum in der Villa Pams präsentiert eine bemerkenswerte Sammlung von Werken, die von Collioure inspiriert wurden, von den Fauves bis zu zeitgenössischen Künstlern.'
    ) RETURNING id INTO step_id;
    
    -- Add to journey
    INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
    VALUES (journey_art_culture, step_id, 1);
    
    -- Step 2: Atelier de Matisse
    INSERT INTO public.steps (
        city_id, name, description, latitude, longitude, points_awarded, 
        validation_radius, has_quiz, type, address,
        name_en, name_de, description_en, description_de
    ) VALUES (
        collioure_city_id,
        'L''Atelier de Matisse',
        'Découvrez l''emplacement de l''ancien atelier d''Henri Matisse, où le maître a créé certaines de ses œuvres les plus célèbres entre 1905 et 1914.',
        42.5250,
        3.0841,
        20,
        25,
        true,
        'historic_site',
        'Rue de la Peix, 66190 Collioure',
        'Matisse''s Studio',
        'Matisse''s Atelier',
        'Discover the location of Henri Matisse''s former studio, where the master created some of his most famous works between 1905 and 1914.',
        'Entdecken Sie den Ort des ehemaligen Ateliers von Henri Matisse, wo der Meister zwischen 1905 und 1914 einige seiner berühmtesten Werke schuf.'
    ) RETURNING id INTO step_id;
    
    INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
    VALUES (journey_art_culture, step_id, 2);
    
    -- Step 3: Le Clocher de Collioure (vue des Fauves)
    INSERT INTO public.steps (
        city_id, name, description, latitude, longitude, points_awarded, 
        validation_radius, has_quiz, type, address,
        name_en, name_de, description_en, description_de
    ) VALUES (
        collioure_city_id,
        'Le Clocher des Fauves',
        'Admirez le célèbre clocher de Collioure depuis l''angle que Matisse et Derain ont immortalisé dans leurs toiles fauves.',
        42.5260,
        3.0836,
        15,
        20,
        true,
        'viewpoint',
        'Place de l''Église, 66190 Collioure',
        'The Fauves'' Bell Tower',
        'Der Glockenturm der Fauves',
        'Admire the famous bell tower of Collioure from the angle that Matisse and Derain immortalized in their Fauve paintings.',
        'Bewundern Sie den berühmten Glockenturm von Collioure aus dem Blickwinkel, den Matisse und Derain in ihren Fauve-Gemälden verewigten.'
    ) RETURNING id INTO step_id;
    
    INSERT INTO public.journey_steps (journey_id, step_id, step_order) 
    VALUES (journey_art_culture, step_id, 3);
    
    RAISE NOTICE 'Created Art et Culture journey with 3 steps';
    
END $$;