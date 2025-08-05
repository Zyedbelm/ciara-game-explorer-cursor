-- Check existing content for Collioure and create missing journeys/steps

DO $$
DECLARE
    collioure_city_id UUID;
    category_art_culture UUID;
    category_gastronomie UUID;
    category_vieille_ville UUID;
    category_patrimoine UUID;
    category_randonnees UUID;
    journey_art_culture UUID;
    journey_gastronomie UUID;
    journey_vieille_ville UUID;
    step_id UUID;
    existing_journeys_count INTEGER;
    existing_steps_count INTEGER;
BEGIN
    -- Get Collioure city ID
    SELECT id INTO collioure_city_id FROM public.cities WHERE slug = 'collioure';
    
    IF collioure_city_id IS NULL THEN
        RAISE EXCEPTION 'Collioure city not found';
    END IF;
    
    -- Check existing content
    SELECT COUNT(*) INTO existing_journeys_count 
    FROM public.journeys WHERE city_id = collioure_city_id AND is_active = true;
    
    SELECT COUNT(*) INTO existing_steps_count 
    FROM public.steps WHERE city_id = collioure_city_id AND is_active = true;
    
    RAISE NOTICE 'Collioure currently has % journeys and % steps', existing_journeys_count, existing_steps_count;
    
    -- Get existing category IDs
    SELECT id INTO category_art_culture FROM public.journey_categories 
    WHERE city_id = collioure_city_id AND slug = 'art-culture';
    
    SELECT id INTO category_gastronomie FROM public.journey_categories 
    WHERE city_id = collioure_city_id AND slug = 'gastronomie-locale';
    
    SELECT id INTO category_vieille_ville FROM public.journey_categories 
    WHERE city_id = collioure_city_id AND slug = 'vieille-ville';
    
    SELECT id INTO category_patrimoine FROM public.journey_categories 
    WHERE city_id = collioure_city_id AND slug = 'patrimoine-culturel';
    
    SELECT id INTO category_randonnees FROM public.journey_categories 
    WHERE city_id = collioure_city_id AND slug = 'randonnees-nature';
    
    -- Create missing categories if they don't exist
    
    -- Art et Culture category (if not exists)
    IF category_art_culture IS NULL THEN
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
        ) RETURNING id INTO category_art_culture;
        RAISE NOTICE 'Created Art et Culture category';
    END IF;
    
    -- Gastronomie Locale category (if not exists)
    IF category_gastronomie IS NULL THEN
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
        ) RETURNING id INTO category_gastronomie;
        RAISE NOTICE 'Created Gastronomie Locale category';
    END IF;
    
    -- Vieille Ville category (if not exists)
    IF category_vieille_ville IS NULL THEN
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
        ) RETURNING id INTO category_vieille_ville;
        RAISE NOTICE 'Created Vieille Ville category';
    END IF;
    
    -- CREATE MISSING JOURNEYS
    
    -- Check if Art et Culture journey exists
    SELECT id INTO journey_art_culture FROM public.journeys 
    WHERE city_id = collioure_city_id AND category_id = category_art_culture;
    
    IF journey_art_culture IS NULL THEN
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
        RAISE NOTICE 'Created Art et Culture journey: %', journey_art_culture;
    END IF;
    
    -- Check if Gastronomie journey exists
    SELECT id INTO journey_gastronomie FROM public.journeys 
    WHERE city_id = collioure_city_id AND category_id = category_gastronomie;
    
    IF journey_gastronomie IS NULL THEN
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
        RAISE NOTICE 'Created Gastronomie journey: %', journey_gastronomie;
    END IF;
    
    -- Check if Vieille Ville journey exists
    SELECT id INTO journey_vieille_ville FROM public.journeys 
    WHERE city_id = collioure_city_id AND category_id = category_vieille_ville;
    
    IF journey_vieille_ville IS NULL THEN
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
        RAISE NOTICE 'Created Vieille Ville journey: %', journey_vieille_ville;
    END IF;
    
    RAISE NOTICE 'Categories and journeys creation completed';
    
END $$;