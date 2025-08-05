-- Phase 1: Ensure tenant admins are properly associated with cities
-- First, let's add a constraint to ensure tenant admins MUST have a city_id

-- Create a function to validate tenant admin city assignment
CREATE OR REPLACE FUNCTION validate_tenant_admin_city()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is a tenant_admin, they must have a city_id
  IF NEW.role = 'tenant_admin' AND NEW.city_id IS NULL THEN
    RAISE EXCEPTION 'Tenant admins must be assigned to a city';
  END IF;
  
  -- If the user is not a tenant_admin, they shouldn't have a city_id restriction
  -- (super_admin can manage all cities, other roles don't need city assignment)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for the validation
CREATE TRIGGER check_tenant_admin_city
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_tenant_admin_city();

-- Add an index for better performance when filtering by city and role
CREATE INDEX IF NOT EXISTS idx_profiles_role_city ON public.profiles(role, city_id);