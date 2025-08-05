-- Créer une contrainte pour limiter les types de catégories autorisés
ALTER TABLE public.journey_categories 
ADD CONSTRAINT valid_category_types 
CHECK (type IN ('patrimoine-culturel', 'gastronomie-locale', 'randonnees-nature', 'vieille-ville', 'art-culture'));

-- Créer une contrainte pour limiter les slugs autorisés
ALTER TABLE public.journey_categories 
ADD CONSTRAINT valid_category_slugs 
CHECK (slug IN ('patrimoine-culturel', 'gastronomie-locale', 'randonnees-nature', 'vieille-ville', 'art-culture'));

-- Créer une contrainte pour limiter les icônes autorisées
ALTER TABLE public.journey_categories 
ADD CONSTRAINT valid_category_icons 
CHECK (icon IN ('building', 'utensils', 'mountain', 'camera', 'landmark', 'palette'));

-- Créer une fonction pour empêcher la création de catégories en double par ville
CREATE OR REPLACE FUNCTION prevent_duplicate_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier qu'il n'y a pas déjà cette catégorie pour cette ville
    IF EXISTS (
        SELECT 1 FROM public.journey_categories 
        WHERE city_id = NEW.city_id 
        AND slug = NEW.slug 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
        RAISE EXCEPTION 'Cette catégorie existe déjà pour cette ville';
    END IF;
    
    -- Vérifier qu'il n'y a pas plus de 5 catégories par ville
    IF (SELECT COUNT(*) FROM public.journey_categories WHERE city_id = NEW.city_id) >= 5 
       AND TG_OP = 'INSERT' THEN
        RAISE EXCEPTION 'Maximum 5 catégories autorisées par ville';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS check_category_constraints ON public.journey_categories;
CREATE TRIGGER check_category_constraints
    BEFORE INSERT OR UPDATE ON public.journey_categories
    FOR EACH ROW
    EXECUTE FUNCTION prevent_duplicate_categories();