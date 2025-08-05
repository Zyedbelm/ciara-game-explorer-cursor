-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profiles', 'profiles', true),
  ('journeys', 'journeys', true),
  ('steps', 'steps', true);

-- Create storage policies for profile images
CREATE POLICY "Profile images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile image" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile image" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile image" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for journey images
CREATE POLICY "Journey images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'journeys');

CREATE POLICY "Admins can manage journey images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'journeys');

CREATE POLICY "Admins can update journey images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'journeys');

CREATE POLICY "Admins can delete journey images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'journeys');

-- Create storage policies for step images
CREATE POLICY "Step images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'steps');

CREATE POLICY "Admins can manage step images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'steps');

CREATE POLICY "Admins can update step images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'steps');

CREATE POLICY "Admins can delete step images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'steps');

-- Simplify user roles by first removing the default, then updating the enum
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

ALTER TYPE user_role RENAME TO user_role_old;

CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'visitor');

-- Update profiles table to use new role enum
ALTER TABLE profiles 
ALTER COLUMN role TYPE user_role USING 
CASE 
  WHEN role::text = 'super_admin' THEN 'super_admin'::user_role
  WHEN role::text IN ('tenant_admin', 'content_manager', 'analytics_viewer', 'ciara_staff', 'content_creator', 'tech_support', 'partner_admin', 'partner_viewer') THEN 'tenant_admin'::user_role
  ELSE 'visitor'::user_role
END;

-- Set new default
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'visitor'::user_role;

-- Drop old enum
DROP TYPE user_role_old;