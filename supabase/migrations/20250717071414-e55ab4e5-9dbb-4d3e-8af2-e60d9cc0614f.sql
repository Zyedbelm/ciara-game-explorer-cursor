-- Create storage buckets for different types of uploads

-- Create bucket for city images (logos, hero images, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cities', 
  'cities', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for step images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'step-images', 
  'step-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for journey images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'journey-images', 
  'journey-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for partner logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-logos', 
  'partner-logos', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for reward images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reward-images', 
  'reward-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for public access
CREATE POLICY "Cities images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cities');

CREATE POLICY "Authenticated users can upload city images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'cities' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update city images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'cities' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete city images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'cities' 
  AND auth.uid() IS NOT NULL
);

-- Similar policies for other buckets
CREATE POLICY "Step images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'step-images');

CREATE POLICY "Authenticated users can manage step images" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'step-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Journey images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'journey-images');

CREATE POLICY "Authenticated users can manage journey images" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'journey-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Partner logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'partner-logos');

CREATE POLICY "Authenticated users can manage partner logos" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'partner-logos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Reward images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reward-images');

CREATE POLICY "Authenticated users can manage reward images" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'reward-images' 
  AND auth.uid() IS NOT NULL
);