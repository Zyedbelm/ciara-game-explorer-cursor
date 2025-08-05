-- Fix RLS policies to ensure admins can see all users including those without city assignment

-- Update the profiles policy to allow super_admin to see ALL profiles
-- and tenant_admin to see users in their city OR users without city (for assignment)
DROP POLICY IF EXISTS "Users can view profiles based on role" ON public.profiles;

CREATE POLICY "Users can view profiles based on role" 
ON public.profiles FOR SELECT
USING (
  CASE
    WHEN (auth.uid() = user_id) THEN true
    WHEN (get_current_user_role() = 'super_admin') THEN true
    WHEN (get_current_user_role() = 'tenant_admin') THEN 
      -- Tenant admin can see users in their city OR users without city assignment
      (city_id = get_user_city_id() OR city_id IS NULL)
    ELSE false
  END
);

-- Allow tenant admins to update user profiles for city assignment
UPDATE public.profiles 
SET city_id = NULL 
WHERE city_id IS NOT NULL AND city_id NOT IN (SELECT id FROM public.cities);

-- Ensure the new user has proper role
UPDATE public.profiles 
SET role = 'visitor'
WHERE email = 'baptiste.e.1985@gmail.com' AND role != 'visitor';