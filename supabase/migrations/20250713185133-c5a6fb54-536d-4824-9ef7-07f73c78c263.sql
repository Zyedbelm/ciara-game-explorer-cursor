-- Test user management for admin roles
-- First, let's create a test admin user if it doesn't exist

-- Create a test super admin profile
DO $$
DECLARE
    test_user_id uuid := '00000000-0000-0000-0000-000000000001'; -- Dummy UUID for testing
BEGIN
    -- Create or update a test profile with super_admin role
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
        0,
        1,
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

    -- Also create a tenant admin for testing
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
        '00000000-0000-0000-0000-000000000002',
        'tenant@ciara.app',
        'tenant_admin',
        'Tenant',
        'Admin',
        0,
        1,
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

    RAISE NOTICE 'Test admin profiles created/updated successfully';
END $$;