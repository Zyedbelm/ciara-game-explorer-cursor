-- Test user management for admin roles with proper city assignment
-- First, let's get or create a test city

DO $$
DECLARE
    test_city_id uuid;
    test_user_id uuid := '00000000-0000-0000-0000-000000000001'; 
BEGIN
    -- Get or create a test city
    SELECT id INTO test_city_id FROM public.cities WHERE slug = 'test-city' LIMIT 1;
    
    IF test_city_id IS NULL THEN
        INSERT INTO public.cities (
            name, 
            slug, 
            country, 
            latitude, 
            longitude,
            description
        ) 
        VALUES (
            'Test City',
            'test-city',
            'Switzerland',
            46.5197,
            6.6323,
            'Test city for admin functionality'
        )
        RETURNING id INTO test_city_id;
    END IF;

    -- Create a test super admin profile (no city restriction)
    INSERT INTO public.profiles (
        user_id, 
        email, 
        role, 
        first_name, 
        last_name,
        total_points, 
        current_level, 
        fitness_level, 
        preferred_languages
    ) 
    VALUES (
        test_user_id,
        'admin@ciara.app',
        'super_admin',
        'Admin',
        'CIARA',
        1000,
        4,
        3,
        ARRAY['fr'::text]
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        updated_at = now();

    -- Create a tenant admin with proper city assignment
    INSERT INTO public.profiles (
        user_id, 
        email, 
        role, 
        first_name, 
        last_name,
        city_id,
        total_points, 
        current_level, 
        fitness_level, 
        preferred_languages
    ) 
    VALUES (
        '00000000-0000-0000-0000-000000000002',
        'tenant@ciara.app',
        'tenant_admin',
        'Tenant',
        'Admin',
        test_city_id,
        500,
        2,
        3,
        ARRAY['fr'::text]
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        city_id = EXCLUDED.city_id,
        updated_at = now();

    RAISE NOTICE 'Test admin profiles and city created/updated successfully. City ID: %', test_city_id;
END $$;