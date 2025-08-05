-- Populate Sion with realistic step completion data for heatmap testing
-- This creates test users and step completions with realistic patterns

DO $$
DECLARE
    sion_city_id uuid;
    sion_steps uuid[];
    test_user_ids uuid[];
    current_step_id uuid;
    current_user_id uuid;
    completion_date timestamp with time zone;
    hour_weight numeric;
    day_weight numeric;
    random_points integer;
    i integer;
    j integer;
    step_count integer;
BEGIN
    -- Get Sion's city ID
    SELECT id INTO sion_city_id FROM public.cities WHERE name = 'Sion';
    
    IF sion_city_id IS NULL THEN
        RAISE EXCEPTION 'Sion city not found';
    END IF;
    
    -- Get all active steps for Sion
    SELECT array_agg(id) INTO sion_steps 
    FROM public.steps 
    WHERE city_id = sion_city_id AND is_active = true;
    
    step_count := array_length(sion_steps, 1);
    
    IF step_count IS NULL OR step_count = 0 THEN
        RAISE EXCEPTION 'No active steps found for Sion';
    END IF;
    
    RAISE NOTICE 'Found % active steps for Sion', step_count;
    
    -- Create test users for Sion (visitors with realistic profiles)
    INSERT INTO public.profiles (
        user_id, 
        email, 
        full_name, 
        role, 
        city_id, 
        total_points, 
        current_level, 
        fitness_level,
        preferred_languages
    )
    SELECT 
        gen_random_uuid(),
        'test_sion_user_' || generate_series || '@example.com',
        CASE generate_series % 10
            WHEN 0 THEN 'Marie Dubois'
            WHEN 1 THEN 'Jean Martin'
            WHEN 2 THEN 'Sophie Laurent'
            WHEN 3 THEN 'Pierre Leroy'
            WHEN 4 THEN 'Emma Bernard'
            WHEN 5 THEN 'Lucas Rousseau'
            WHEN 6 THEN 'Chloé Moreau'
            WHEN 7 THEN 'Julien Petit'
            WHEN 8 THEN 'Camille Simon'
            ELSE 'Alex Michel'
        END,
        'visitor',
        sion_city_id,
        0, -- Will be updated by trigger
        1,
        (generate_series % 3) + 2, -- Fitness level 2-4
        ARRAY['fr'::text]
    FROM generate_series(1, 15)
    ON CONFLICT (email) DO NOTHING;
    
    -- Get the test user IDs we just created
    SELECT array_agg(user_id) INTO test_user_ids
    FROM public.profiles 
    WHERE email LIKE 'test_sion_user_%@example.com'
    AND city_id = sion_city_id;
    
    RAISE NOTICE 'Created/found % test users for Sion', array_length(test_user_ids, 1);
    
    -- Generate realistic step completions over the last 30 days
    FOR i IN 1..80 LOOP  -- Generate 80 completions total
        -- Pick a random step
        current_step_id := sion_steps[1 + (random() * (step_count - 1))::integer];
        
        -- Pick a random user
        current_user_id := test_user_ids[1 + (random() * (array_length(test_user_ids, 1) - 1))::integer];
        
        -- Generate a date in the last 30 days with weighted distribution
        -- More activity on weekends and during peak hours (10am-6pm)
        completion_date := now() - (random() * interval '30 days');
        
        -- Adjust time to create realistic patterns
        -- Weekend bias (Saturday = 6, Sunday = 0)
        day_weight := CASE extract(dow from completion_date)
            WHEN 0 THEN 1.5  -- Sunday
            WHEN 6 THEN 1.5  -- Saturday
            WHEN 5 THEN 1.2  -- Friday
            ELSE 1.0
        END;
        
        -- Peak hours bias (10am-6pm gets more activity)
        hour_weight := CASE 
            WHEN extract(hour from completion_date) BETWEEN 10 AND 18 THEN 2.0
            WHEN extract(hour from completion_date) BETWEEN 8 AND 10 THEN 1.5
            WHEN extract(hour from completion_date) BETWEEN 18 AND 20 THEN 1.5
            ELSE 0.5
        END;
        
        -- Only create completion if it passes the weighted random check
        IF random() < (day_weight * hour_weight / 4.0) THEN
            -- Get points for this step
            SELECT points_awarded INTO random_points 
            FROM public.steps 
            WHERE id = current_step_id;
            
            -- Insert step completion (avoid duplicates)
            INSERT INTO public.step_completions (
                id,
                user_id,
                step_id,
                journey_id, -- We'll leave this null for now
                completed_at,
                points_earned,
                quiz_score,
                validation_method
            )
            SELECT 
                gen_random_uuid(),
                current_user_id,
                current_step_id,
                NULL,
                completion_date,
                COALESCE(random_points, 10) + (random() * 5)::integer, -- Add some variation
                (random() * 100)::integer, -- Random quiz score
                CASE (random() * 3)::integer
                    WHEN 0 THEN 'gps'
                    WHEN 1 THEN 'manual'
                    ELSE 'qr_code'
                END
            WHERE NOT EXISTS (
                SELECT 1 FROM public.step_completions 
                WHERE user_id = current_user_id 
                AND step_id = current_step_id
            );
        END IF;
    END LOOP;
    
    -- Update user total points (should be handled by trigger, but let's ensure consistency)
    UPDATE public.profiles 
    SET total_points = (
        SELECT COALESCE(SUM(points_earned), 0)
        FROM public.step_completions sc
        WHERE sc.user_id = profiles.user_id
    )
    WHERE user_id = ANY(test_user_ids);
    
    -- Log completion stats
    DECLARE
        completion_count integer;
        user_count integer;
        step_coverage integer;
    BEGIN
        SELECT COUNT(*) INTO completion_count
        FROM public.step_completions sc
        JOIN public.steps s ON sc.step_id = s.id
        WHERE s.city_id = sion_city_id;
        
        SELECT COUNT(DISTINCT sc.user_id) INTO user_count
        FROM public.step_completions sc
        JOIN public.steps s ON sc.step_id = s.id
        WHERE s.city_id = sion_city_id;
        
        SELECT COUNT(DISTINCT sc.step_id) INTO step_coverage
        FROM public.step_completions sc
        JOIN public.steps s ON sc.step_id = s.id
        WHERE s.city_id = sion_city_id;
        
        RAISE NOTICE 'Sion test data summary:';
        RAISE NOTICE '- Total completions: %', completion_count;
        RAISE NOTICE '- Active users: %', user_count;
        RAISE NOTICE '- Steps with completions: % out of %', step_coverage, step_count;
    END;
    
END $$;