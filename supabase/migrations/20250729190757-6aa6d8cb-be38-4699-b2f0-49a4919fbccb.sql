-- Populate Sion with realistic step completion data using existing users
-- This approach only uses existing users from the profiles table

DO $$
DECLARE
    sion_city_id uuid;
    sion_steps uuid[];
    available_user_ids uuid[];
    current_step_id uuid;
    current_user_id uuid;
    completion_date timestamp with time zone;
    hour_weight numeric;
    day_weight numeric;
    random_points integer;
    i integer;
    step_count integer;
    user_count integer;
    completions_created integer := 0;
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
    
    -- Get existing users (any users will do for testing)
    SELECT array_agg(user_id) INTO available_user_ids
    FROM public.profiles 
    WHERE user_id IS NOT NULL
    LIMIT 50; -- Use up to 50 existing users
    
    user_count := array_length(available_user_ids, 1);
    
    IF user_count IS NULL OR user_count = 0 THEN
        RAISE EXCEPTION 'No users found in profiles table';
    END IF;
    
    RAISE NOTICE 'Using % existing users for step completions', user_count;
    
    -- Generate realistic step completions over the last 30 days
    FOR i IN 1..200 LOOP  -- Try to generate up to 200 completions
        -- Pick a random step
        current_step_id := sion_steps[1 + (random() * (step_count - 1))::integer];
        
        -- Pick a random user
        current_user_id := available_user_ids[1 + (random() * (user_count - 1))::integer];
        
        -- Skip if this user already completed this step
        IF EXISTS (
            SELECT 1 FROM public.step_completions 
            WHERE user_id = current_user_id 
            AND step_id = current_step_id
        ) THEN
            CONTINUE;
        END IF;
        
        -- Generate a date in the last 30 days with weighted distribution
        completion_date := now() - (random() * interval '30 days');
        
        -- Adjust time to create realistic patterns
        -- Weekend bias (Saturday = 6, Sunday = 0)
        day_weight := CASE extract(dow from completion_date)
            WHEN 0 THEN 2.0  -- Sunday
            WHEN 6 THEN 2.0  -- Saturday  
            WHEN 5 THEN 1.4  -- Friday
            ELSE 1.0
        END;
        
        -- Peak hours bias (10am-6pm gets more activity)
        hour_weight := CASE 
            WHEN extract(hour from completion_date) BETWEEN 10 AND 18 THEN 3.0
            WHEN extract(hour from completion_date) BETWEEN 8 AND 10 THEN 2.0
            WHEN extract(hour from completion_date) BETWEEN 18 AND 20 THEN 2.0
            ELSE 0.4
        END;
        
        -- Only create completion if it passes the weighted random check
        IF random() < (day_weight * hour_weight / 8.0) THEN
            -- Get points for this step
            SELECT points_awarded INTO random_points 
            FROM public.steps 
            WHERE id = current_step_id;
            
            -- Insert step completion
            INSERT INTO public.step_completions (
                id,
                user_id,
                step_id,
                journey_id,
                completed_at,
                points_earned,
                quiz_score,
                validation_method
            )
            VALUES (
                gen_random_uuid(),
                current_user_id,
                current_step_id,
                NULL,
                completion_date,
                COALESCE(random_points, 10) + (random() * 8)::integer, -- Add variation 0-8 points
                CASE WHEN random() > 0.2 THEN (75 + random() * 25)::integer ELSE NULL END, -- 80% have good quiz scores
                CASE (random() * 4)::integer
                    WHEN 0 THEN 'gps'
                    WHEN 1 THEN 'manual'
                    WHEN 2 THEN 'qr_code'
                    ELSE 'photo'
                END
            );
            
            completions_created := completions_created + 1;
        END IF;
    END LOOP;
    
    -- Add corresponding analytics events for the heatmap
    INSERT INTO public.analytics_events (
        event_type,
        event_name,
        user_id,
        city_id,
        step_id,
        properties,
        timestamp
    )
    SELECT 
        'step',
        'step_completion',
        sc.user_id,
        sion_city_id,
        sc.step_id,
        jsonb_build_object(
            'points_earned', sc.points_earned,
            'validation_method', sc.validation_method,
            'quiz_score', sc.quiz_score,
            'location', jsonb_build_object(
                'latitude', s.latitude,
                'longitude', s.longitude
            )
        ),
        sc.completed_at
    FROM public.step_completions sc
    JOIN public.steps s ON sc.step_id = s.id
    WHERE s.city_id = sion_city_id
    AND sc.completed_at > now() - interval '30 days'
    AND NOT EXISTS (
        SELECT 1 FROM public.analytics_events ae
        WHERE ae.user_id = sc.user_id 
        AND ae.step_id = sc.step_id
        AND ae.event_name = 'step_completion'
        AND ae.timestamp = sc.completed_at
    );
    
    -- Create some additional visitor events for more heatmap data
    INSERT INTO public.analytics_events (
        event_type,
        event_name,
        user_id,
        city_id,
        step_id,
        properties,
        timestamp
    )
    SELECT 
        'step',
        'step_visited',
        sc.user_id,
        sion_city_id,
        sc.step_id,
        jsonb_build_object(
            'duration_seconds', (30 + random() * 300)::integer,
            'location', jsonb_build_object(
                'latitude', s.latitude,
                'longitude', s.longitude
            )
        ),
        sc.completed_at - (random() * interval '30 minutes') -- Visited slightly before completion
    FROM public.step_completions sc
    JOIN public.steps s ON sc.step_id = s.id
    WHERE s.city_id = sion_city_id
    AND sc.completed_at > now() - interval '30 days'
    AND random() > 0.4 -- Only 60% of completions get a visit event
    LIMIT 100;
    
    -- Final stats
    DECLARE
        completion_count integer;
        active_user_count integer;
        step_coverage integer;
        analytics_count integer;
        recent_completions integer;
    BEGIN
        SELECT COUNT(*) INTO completion_count
        FROM public.step_completions sc
        JOIN public.steps s ON sc.step_id = s.id
        WHERE s.city_id = sion_city_id;
        
        SELECT COUNT(*) INTO recent_completions
        FROM public.step_completions sc
        JOIN public.steps s ON sc.step_id = s.id
        WHERE s.city_id = sion_city_id
        AND sc.completed_at > now() - interval '30 days';
        
        SELECT COUNT(DISTINCT sc.user_id) INTO active_user_count
        FROM public.step_completions sc
        JOIN public.steps s ON sc.step_id = s.id
        WHERE s.city_id = sion_city_id
        AND sc.completed_at > now() - interval '30 days';
        
        SELECT COUNT(DISTINCT sc.step_id) INTO step_coverage
        FROM public.step_completions sc
        JOIN public.steps s ON sc.step_id = s.id
        WHERE s.city_id = sion_city_id;
        
        SELECT COUNT(*) INTO analytics_count
        FROM public.analytics_events
        WHERE city_id = sion_city_id 
        AND timestamp > now() - interval '30 days';
        
        RAISE NOTICE '=== SION HEATMAP DATA CREATED ===';
        RAISE NOTICE 'Total completions (all time): %', completion_count;
        RAISE NOTICE 'Recent completions (30 days): %', recent_completions;
        RAISE NOTICE 'Active users (30 days): %', active_user_count;
        RAISE NOTICE 'Steps with activity: % out of %', step_coverage, step_count;
        RAISE NOTICE 'Analytics events (30 days): %', analytics_count;
        RAISE NOTICE 'Completions created in this run: %', completions_created;
        RAISE NOTICE '';
        RAISE NOTICE 'The heatmap should now show realistic activity patterns with:';
        RAISE NOTICE '- Weekend activity hotspots';
        RAISE NOTICE '- Peak hours during 10am-6pm';
        RAISE NOTICE '- Geographic distribution across Sion steps';
    END;
    
END $$;