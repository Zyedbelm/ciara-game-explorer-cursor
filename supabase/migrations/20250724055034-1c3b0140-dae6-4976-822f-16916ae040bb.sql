-- Fix tenant_admin profiles with null city_id and add constraint to prevent this
-- First, let's check and report any tenant_admin profiles without city assignment
DO $$
DECLARE
    affected_count integer;
BEGIN
    SELECT COUNT(*) INTO affected_count
    FROM public.profiles 
    WHERE role = 'tenant_admin' AND city_id IS NULL;
    
    IF affected_count > 0 THEN
        RAISE NOTICE 'Found % tenant_admin profiles with null city_id', affected_count;
        
        -- For now, we'll just log these - in a real scenario, these would need manual assignment
        RAISE NOTICE 'These profiles need manual city assignment before the constraint is added';
    ELSE
        RAISE NOTICE 'All tenant_admin profiles have proper city assignments';
    END IF;
END $$;

-- Add constraint to ensure tenant_admin users always have a city assigned
-- Note: This will fail if there are existing tenant_admin users without city_id
-- In production, those would need to be fixed first

CREATE OR REPLACE FUNCTION validate_tenant_admin_city_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure tenant_admin users always have a city assigned
    IF NEW.role = 'tenant_admin' AND NEW.city_id IS NULL THEN
        RAISE EXCEPTION 'Tenant admin users must have a city assignment'
            USING ERRCODE = 'check_violation';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate tenant_admin city assignments
DROP TRIGGER IF EXISTS validate_tenant_admin_city_assignment_trigger ON public.profiles;
CREATE TRIGGER validate_tenant_admin_city_assignment_trigger
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_tenant_admin_city_assignment();

-- Add helpful index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role_city ON public.profiles(role, city_id);

RAISE NOTICE 'Added constraint to ensure tenant_admin users have city assignments';