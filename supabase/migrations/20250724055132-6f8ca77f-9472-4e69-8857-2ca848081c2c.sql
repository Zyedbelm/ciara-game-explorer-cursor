-- Fix the security warning about function search path mutable for the new function
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
$$ LANGUAGE plpgsql
SET search_path TO 'public';