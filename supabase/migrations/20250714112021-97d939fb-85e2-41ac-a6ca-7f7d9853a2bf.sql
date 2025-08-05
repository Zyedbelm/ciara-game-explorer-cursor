-- Add sample data for Geneva to make the app more dynamic

-- First, let's check if Geneva exists and get its ID
DO $$ 
DECLARE
    geneva_id UUID;
    culture_cat_id UUID;
    nature_cat_id UUID;
    gastro_cat_id UUID;
    historical_journey_id UUID;
    lakeside_journey_id UUID;
BEGIN
    -- Insert Geneva if it doesn't exist
    INSERT INTO cities (name, slug, country, latitude, longitude, description)
    VALUES ('Genève', 'geneve', 'Switzerland', 46.2044, 6.1432, 'Ville internationale au cœur de l''Europe')
    ON CONFLICT (slug) DO UPDATE SET
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        description = EXCLUDED.description
    RETURNING id INTO geneva_id;
    
    -- If we didn't get an ID from INSERT, get it from existing record
    IF geneva_id IS NULL THEN
        SELECT id INTO geneva_id FROM cities WHERE slug = 'geneve';
    END IF;

    -- Insert journey categories for Geneva
    INSERT INTO journey_categories (city_id, name, slug, type, description, difficulty, estimated_duration, color, icon)
    VALUES 
        (geneva_id, 'Patrimoine Culturel', 'culture', 'art_culture', 'Découvrez les musées et monuments historiques', 'medium', 120, '#8B5CF6', 'museum'),
        (geneva_id, 'Nature & Détente', 'nature', 'nature', 'Parcours dans les parcs et au bord du lac', 'easy', 90, '#10B981', 'tree'),
        (geneva_id, 'Gastronomie Locale', 'gastronomy', 'gastronomy', 'Savourez les spécialités genevoises', 'easy', 150, '#F59E0B', 'utensils')
    ON CONFLICT (city_id, slug) DO UPDATE SET
        description = EXCLUDED.description,
        estimated_duration = EXCLUDED.estimated_duration
    RETURNING id INTO culture_cat_id;
    
    -- Get category IDs
    SELECT id INTO culture_cat_id FROM journey_categories WHERE city_id = geneva_id AND slug = 'culture';
    SELECT id INTO nature_cat_id FROM journey_categories WHERE city_id = geneva_id AND slug = 'nature';
    SELECT id INTO gastro_cat_id FROM journey_categories WHERE city_id = geneva_id AND slug = 'gastronomy';

    -- Insert sample steps for Geneva
    INSERT INTO steps (city_id, name, type, latitude, longitude, description, points_awarded, has_quiz, validation_radius, images, address)
    VALUES 
        (geneva_id, 'Jet d''Eau', 'landmark', 46.2073, 6.1550, 'L''emblématique jet d''eau de Genève, symbole de la ville', 15, true, 100, ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4'], 'Quai Gustave-Ador, 1207 Genève'),
        (geneva_id, 'Cathédrale Saint-Pierre', 'monument', 46.2017, 6.1485, 'Magnifique cathédrale gothique au cœur de la vieille ville', 20, true, 50, ARRAY['https://images.unsplash.com/photo-1549197095-c6803c5c1d7f'], 'Cour de Saint-Pierre, 1204 Genève'),
        (geneva_id, 'Parc des Bastions', 'viewpoint', 46.1998, 6.1432, 'Parc historique avec le célèbre mur des réformateurs', 10, false, 80, ARRAY['https://images.unsplash.com/photo-1571115764595-644a1f56a55c'], 'Promenade des Bastions, 1204 Genève'),
        (geneva_id, 'Musée d''Art et d''Histoire', 'museum', 46.1956, 6.1447, 'L''un des plus grands musées de Suisse', 25, true, 30, ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], 'Rue Charles-Galland 2, 1206 Genève'),
        (geneva_id, 'Bains des Pâquis', 'activity', 46.2107, 6.1511, 'Bains publics populaires au bord du lac Léman', 15, false, 60, ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5'], 'Quai du Mont-Blanc 30, 1201 Genève'),
        (geneva_id, 'Place du Bourg-de-Four', 'landmark', 46.2016, 6.1474, 'Plus ancienne place publique de Genève', 10, true, 40, ARRAY['https://images.unsplash.com/photo-1520637836862-4d197d17c13a'], 'Place du Bourg-de-Four, 1204 Genève')
    ON CONFLICT (city_id, name) DO UPDATE SET
        description = EXCLUDED.description,
        points_awarded = EXCLUDED.points_awarded;

    -- Create sample journeys
    INSERT INTO journeys (city_id, category_id, name, description, difficulty, estimated_duration, total_points, is_predefined)
    VALUES 
        (geneva_id, culture_cat_id, 'Genève Historique', 'Découvrez l''histoire fascinante de Genève à travers ses monuments emblématiques', 'medium', 150, 70, true),
        (geneva_id, nature_cat_id, 'Balade au Bord du Lac', 'Une promenade relaxante le long du magnifique lac Léman', 'easy', 90, 40, true)
    ON CONFLICT (city_id, name) DO UPDATE SET
        description = EXCLUDED.description
    RETURNING id INTO historical_journey_id;
    
    -- Get journey IDs
    SELECT id INTO historical_journey_id FROM journeys WHERE city_id = geneva_id AND name = 'Genève Historique';
    SELECT id INTO lakeside_journey_id FROM journeys WHERE city_id = geneva_id AND name = 'Balade au Bord du Lac';

    -- Create journey steps for historical journey
    INSERT INTO journey_steps (journey_id, step_id, step_order, custom_instructions)
    SELECT 
        historical_journey_id,
        s.id,
        ROW_NUMBER() OVER (ORDER BY 
            CASE s.name 
                WHEN 'Cathédrale Saint-Pierre' THEN 1
                WHEN 'Place du Bourg-de-Four' THEN 2
                WHEN 'Parc des Bastions' THEN 3
                WHEN 'Musée d''Art et d''Histoire' THEN 4
            END
        ),
        CASE s.name 
            WHEN 'Cathédrale Saint-Pierre' THEN 'Commencez votre visite par cette magnifique cathédrale gothique'
            WHEN 'Place du Bourg-de-Four' THEN 'Promenez-vous sur cette ancienne place romaine'
            WHEN 'Parc des Bastions' THEN 'Admirez le mur des réformateurs dans ce parc historique'
            WHEN 'Musée d''Art et d''Histoire' THEN 'Terminez par la visite de ce musée exceptionnel'
        END
    FROM steps s
    WHERE s.city_id = geneva_id 
    AND s.name IN ('Cathédrale Saint-Pierre', 'Place du Bourg-de-Four', 'Parc des Bastions', 'Musée d''Art et d''Histoire')
    ON CONFLICT (journey_id, step_id) DO NOTHING;

    -- Create journey steps for lakeside journey
    INSERT INTO journey_steps (journey_id, step_id, step_order, custom_instructions)
    SELECT 
        lakeside_journey_id,
        s.id,
        ROW_NUMBER() OVER (ORDER BY 
            CASE s.name 
                WHEN 'Jet d''Eau' THEN 1
                WHEN 'Bains des Pâquis' THEN 2
            END
        ),
        CASE s.name 
            WHEN 'Jet d''Eau' THEN 'Admirez ce symbole emblématique de Genève'
            WHEN 'Bains des Pâquis' THEN 'Détendez-vous dans ce lieu convivial au bord du lac'
        END
    FROM steps s
    WHERE s.city_id = geneva_id 
    AND s.name IN ('Jet d''Eau', 'Bains des Pâquis')
    ON CONFLICT (journey_id, step_id) DO NOTHING;

    -- Add sample quiz questions
    INSERT INTO quiz_questions (step_id, question, correct_answer, options, explanation, points_awarded)
    SELECT 
        s.id,
        CASE s.name 
            WHEN 'Jet d''Eau' THEN 'À quelle hauteur peut monter le Jet d''Eau de Genève ?'
            WHEN 'Cathédrale Saint-Pierre' THEN 'Quel réformateur célèbre a prêché dans cette cathédrale ?'
            WHEN 'Place du Bourg-de-Four' THEN 'Cette place était à l''origine un marché de quelle époque ?'
        END,
        CASE s.name 
            WHEN 'Jet d''Eau' THEN '140 mètres'
            WHEN 'Cathédrale Saint-Pierre' THEN 'Jean Calvin'
            WHEN 'Place du Bourg-de-Four' THEN 'Époque romaine'
        END,
        CASE s.name 
            WHEN 'Jet d''Eau' THEN '["100 mètres", "140 mètres", "180 mètres", "200 mètres"]'::jsonb
            WHEN 'Cathédrale Saint-Pierre' THEN '["Jean Calvin", "Martin Luther", "Huldrych Zwingli", "Guillaume Farel"]'::jsonb
            WHEN 'Place du Bourg-de-Four' THEN '["Époque romaine", "Moyen Âge", "Renaissance", "Époque moderne"]'::jsonb
        END,
        CASE s.name 
            WHEN 'Jet d''Eau' THEN 'Le Jet d''Eau peut atteindre une hauteur de 140 mètres et est visible depuis très loin'
            WHEN 'Cathédrale Saint-Pierre' THEN 'Jean Calvin a fait de Genève le centre de la Réforme protestante'
            WHEN 'Place du Bourg-de-Four' THEN 'Cette place existe depuis l''époque romaine et était un lieu de marché'
        END,
        10
    FROM steps s
    WHERE s.city_id = geneva_id 
    AND s.name IN ('Jet d''Eau', 'Cathédrale Saint-Pierre', 'Place du Bourg-de-Four')
    ON CONFLICT (step_id, question) DO NOTHING;

END $$;