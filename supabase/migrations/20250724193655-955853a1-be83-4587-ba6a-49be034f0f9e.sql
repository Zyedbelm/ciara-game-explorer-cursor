-- Supprime toutes les catégories des villes françaises
DELETE FROM public.journey_categories WHERE city_id IN (
  SELECT id FROM public.cities WHERE country_id IN (
    SELECT id FROM public.countries WHERE code = 'FR'
  )
);

-- Crée les 5 catégories standards pour chaque ville française
DO $$
DECLARE
    city_record RECORD;
BEGIN
    -- Pour chaque ville française
    FOR city_record IN 
        SELECT id, name FROM public.cities 
        WHERE country_id IN (SELECT id FROM public.countries WHERE code = 'FR')
    LOOP
        -- Insérer les 5 catégories standards
        INSERT INTO public.journey_categories (id, city_id, name, slug, description, type, difficulty, estimated_duration, icon, color) VALUES
        (gen_random_uuid(), city_record.id, 'Patrimoine Culturel', 'patrimoine-culturel', 'Découvrez l''histoire et la culture locale', 'patrimoine-culturel', 'easy', 120, 'building', '#7C3AED'),
        (gen_random_uuid(), city_record.id, 'Gastronomie Locale', 'gastronomie-locale', 'Savourez les spécialités culinaires', 'gastronomie-locale', 'easy', 90, 'utensils', '#DC2626'),
        (gen_random_uuid(), city_record.id, 'Randonnées Nature', 'randonnees-nature', 'Explorez la nature environnante', 'randonnees-nature', 'medium', 180, 'mountain', '#059669'),
        (gen_random_uuid(), city_record.id, 'Vieille Ville', 'vieille-ville', 'Promenade dans les quartiers historiques', 'vieille-ville', 'easy', 60, 'building', '#7C3AED'),
        (gen_random_uuid(), city_record.id, 'Art et Culture', 'art-culture', 'Musées, galeries et sites culturels', 'art-culture', 'easy', 90, 'camera', '#F59E0B');
        
        RAISE NOTICE 'Catégories créées pour la ville: %', city_record.name;
    END LOOP;
END $$;

-- Met à jour les parcours français pour utiliser les nouvelles catégories appropriées
DO $$
DECLARE
    journey_record RECORD;
    new_category_id UUID;
BEGIN
    -- Pour chaque parcours français
    FOR journey_record IN 
        SELECT j.id, j.name, j.city_id, j.description
        FROM public.journeys j
        WHERE j.city_id IN (
            SELECT id FROM public.cities WHERE country_id IN (
                SELECT id FROM public.countries WHERE code = 'FR'
            )
        )
    LOOP
        -- Assigner à la catégorie appropriée selon le nom/description
        IF journey_record.name ILIKE '%maritime%' OR journey_record.name ILIKE '%antique%' OR journey_record.name ILIKE '%médiéval%' OR journey_record.name ILIKE '%cité%' OR journey_record.name ILIKE '%patrimoine%' THEN
            SELECT id INTO new_category_id FROM public.journey_categories 
            WHERE city_id = journey_record.city_id AND slug = 'patrimoine-culturel' LIMIT 1;
        ELSIF journey_record.name ILIKE '%nature%' OR journey_record.name ILIKE '%panorama%' OR journey_record.name ILIKE '%flamant%' OR journey_record.name ILIKE '%authentique%' THEN
            SELECT id INTO new_category_id FROM public.journey_categories 
            WHERE city_id = journey_record.city_id AND slug = 'randonnees-nature' LIMIT 1;
        ELSIF journey_record.name ILIKE '%peintre%' OR journey_record.name ILIKE '%art%' OR journey_record.name ILIKE '%fauvisme%' THEN
            SELECT id INTO new_category_id FROM public.journey_categories 
            WHERE city_id = journey_record.city_id AND slug = 'art-culture' LIMIT 1;
        ELSIF journey_record.name ILIKE '%historique%' OR journey_record.name ILIKE '%centre%' OR journey_record.name ILIKE '%ville%' THEN
            SELECT id INTO new_category_id FROM public.journey_categories 
            WHERE city_id = journey_record.city_id AND slug = 'vieille-ville' LIMIT 1;
        ELSE
            -- Par défaut, assigner à patrimoine culturel
            SELECT id INTO new_category_id FROM public.journey_categories 
            WHERE city_id = journey_record.city_id AND slug = 'patrimoine-culturel' LIMIT 1;
        END IF;
        
        -- Mettre à jour le parcours
        UPDATE public.journeys 
        SET category_id = new_category_id
        WHERE id = journey_record.id;
        
        RAISE NOTICE 'Parcours "%" mis à jour avec nouvelle catégorie', journey_record.name;
    END LOOP;
END $$;