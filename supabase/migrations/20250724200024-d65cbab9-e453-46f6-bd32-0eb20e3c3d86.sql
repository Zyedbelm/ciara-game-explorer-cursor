-- Correction du problème de sécurité pour la fonction prevent_duplicate_categories
-- =====================================================================

-- Supprimer le trigger existant
DROP TRIGGER IF EXISTS check_category_constraints ON public.journey_categories;

-- Supprimer et recréer la fonction avec un search_path sécurisé
DROP FUNCTION IF EXISTS public.prevent_duplicate_categories();

CREATE OR REPLACE FUNCTION public.prevent_duplicate_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recréer le trigger
CREATE TRIGGER check_category_constraints
    BEFORE INSERT OR UPDATE ON public.journey_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_duplicate_categories();