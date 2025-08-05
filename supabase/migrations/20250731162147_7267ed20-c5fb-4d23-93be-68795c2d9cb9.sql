-- Create comprehensive content for Collioure with correct table structure

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
    
    -- Get or create categories
    SELECT id INTO category_art_culture FROM public.journey_categories 
    WHERE city_id = collioure_city_id AND slug = 'art-culture';
    
    IF category_art_culture IS NULL THEN
        INSERT INTO public.journey_categories (
            city_id, name, slug, description, type, difficulty, estimated_duration, icon, color
        ) VALUES (
            collioure_city_id, 
            'Art et Culture', 
            'art-culture', 
            'Découvrez l''art et la culture catalane de Collioure', 
            'art-culture', 
            'easy', 
            90, 
            'palette', 
            '#F59E0B'
        ) RETURNING id INTO category_art_culture;
    END IF;
    
    SELECT id INTO category_gastronomie FROM public.journey_categories 
    WHERE city_id = collioure_city_id AND slug = 'gastronomie-locale';
    
    IF category_gastronomie IS NULL THEN
        INSERT INTO public.journey_categories (
            city_id, name, slug, description, type, difficulty, estimated_duration, icon, color
        ) VALUES (
            collioure_city_id, 
            'Gastronomie Locale', 
            'gastronomie-locale', 
            'Savourez les spécialités culinaires catalanes', 
            'gastronomie-locale', 
            'easy', 
            120, 
            'utensils', 
            '#DC2626'
        ) RETURNING id INTO category_gastronomie;
    END IF;
    
    SELECT id INTO category_vieille_ville FROM public.journey_categories 
    WHERE city_id = collioure_city_id AND slug = 'vieille-ville';
    
    IF category_vieille_ville IS NULL THEN
        INSERT INTO public.journey_categories (
            city_id, name, slug, description, type, difficulty, estimated_duration, icon, color
        ) VALUES (
            collioure_city_id, 
            'Vieille Ville', 
            'vieille-ville', 
            'Promenade dans les ruelles historiques de Collioure', 
            'vieille-ville', 
            'easy', 
            75, 
            'building', 
            '#7C3AED'
        ) RETURNING id INTO category_vieille_ville;
    END IF;
    
    -- CREATE NEW JOURNEYS (using correct column names)
    
    -- Art et Culture Journey
    SELECT id INTO journey_art_culture FROM public.journeys 
    WHERE city_id = collioure_city_id AND category_id = category_art_culture;
    
    IF journey_art_culture IS NULL THEN
        INSERT INTO public.journeys (
            city_id, category_id, name, description, difficulty, estimated_duration, 
            is_active, is_predefined
        ) VALUES (
            collioure_city_id,
            category_art_culture,
            'Sur les traces des Peintres',
            'Découvrez Collioure à travers les yeux des grands maîtres de la peinture. De Matisse à Derain, explorez les lieux qui ont inspiré les Fauves et révolutionné l''art moderne.',
            'easy',
            90,
            true,
            true
        ) RETURNING id INTO journey_art_culture;
        RAISE NOTICE 'Created Art et Culture journey: %', journey_art_culture;
    END IF;
    
    -- Gastronomie Journey
    SELECT id INTO journey_gastronomie FROM public.journeys 
    WHERE city_id = collioure_city_id AND category_id = category_gastronomie;
    
    IF journey_gastronomie IS NULL THEN
        INSERT INTO public.journeys (
            city_id, category_id, name, description, difficulty, estimated_duration, 
            is_active, is_predefined
        ) VALUES (
            collioure_city_id,
            category_gastronomie,
            'Saveurs Catalanes',
            'Embarquez pour un voyage gustatif à travers Collioure. Découvrez les anchois de Collioure, les vins de Banyuls et toutes les spécialités qui font la renommée gastronomique de la région.',
            'easy',
            120,
            true,
            true
        ) RETURNING id INTO journey_gastronomie;
        RAISE NOTICE 'Created Gastronomie journey: %', journey_gastronomie;
    END IF;
    
    -- Vieille Ville Journey
    SELECT id INTO journey_vieille_ville FROM public.journeys 
    WHERE city_id = collioure_city_id AND category_id = category_vieille_ville;
    
    IF journey_vieille_ville IS NULL THEN
        INSERT INTO public.journeys (
            city_id, category_id, name, description, difficulty, estimated_duration, 
            is_active, is_predefined
        ) VALUES (
            collioure_city_id,
            category_vieille_ville,
            'Cœur Historique de Collioure',
            'Plongez dans l''histoire millénaire de Collioure en parcourant ses ruelles pavées, ses places ombragées et ses monuments emblématiques. Une promenade au cœur du patrimoine catalan.',
            'easy',
            75,
            true,
            true
        ) RETURNING id INTO journey_vieille_ville;
        RAISE NOTICE 'Created Vieille Ville journey: %', journey_vieille_ville;
    END IF;
    
    RAISE NOTICE 'Categories and journeys creation completed successfully';
    
END $$;