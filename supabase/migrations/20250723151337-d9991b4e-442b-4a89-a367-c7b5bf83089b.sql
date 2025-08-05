-- Modifier le trigger pour permettre promotion vers tenant_admin sans ville
-- mais empêcher la suppression de ville d'un tenant_admin existant

DROP TRIGGER IF EXISTS validate_tenant_admin_city ON public.profiles;
DROP FUNCTION IF EXISTS public.validate_tenant_admin_city();

CREATE OR REPLACE FUNCTION public.validate_tenant_admin_city()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Empêcher de retirer la ville d'un tenant_admin existant
  IF OLD.role = 'tenant_admin' AND OLD.city_id IS NOT NULL AND NEW.city_id IS NULL THEN
    RAISE EXCEPTION 'Cannot remove city assignment from an existing tenant_admin. Demote to visitor first.'
      USING ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_tenant_admin_city
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_tenant_admin_city();