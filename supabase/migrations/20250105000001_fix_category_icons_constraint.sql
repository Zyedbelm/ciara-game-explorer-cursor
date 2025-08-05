-- Supprimer la contrainte existante si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_category_icons' 
        AND table_name = 'journey_categories'
    ) THEN
        ALTER TABLE public.journey_categories DROP CONSTRAINT valid_category_icons;
    END IF;
END $$;

-- Recréer la contrainte avec les bonnes icônes
ALTER TABLE public.journey_categories 
ADD CONSTRAINT valid_category_icons 
CHECK (icon IN ('building', 'utensils', 'mountain', 'camera', 'landmark', 'palette'));

-- Vérifier que la contrainte est bien appliquée
DO $$
BEGIN
    RAISE NOTICE 'Contrainte valid_category_icons mise à jour avec succès';
END $$; 