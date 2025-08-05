-- Update the Lausanne article with proper tags and ensure image URL is correct
UPDATE articles 
SET 
  tags = ARRAY['lausanne', 'vieille-ville', 'histoire', 'cathédrale', 'suisse'],
  featured_image_url = 'https://pohqkspsdvvbqrgzfayl.supabase.co/storage/v1/object/public/blog-images/lausanne-old-town.jpg'
WHERE slug = 'lausanne-old-town-secrets';