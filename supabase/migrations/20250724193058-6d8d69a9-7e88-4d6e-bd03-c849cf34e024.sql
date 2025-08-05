-- Clear hero_image_url from all cities to use local images instead
UPDATE public.cities SET hero_image_url = NULL;

-- Only keep hero_image_url for cities that have specific uploaded images
-- For now, all cities will use the local images defined in the helper function