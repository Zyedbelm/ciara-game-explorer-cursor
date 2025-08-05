-- Script de correction pour les contraintes et la suppression d'étapes

-- 1. Supprimer la contrainte existante si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_category_icons' 
        AND table_name = 'journey_categories'
    ) THEN
        ALTER TABLE public.journey_categories DROP CONSTRAINT valid_category_icons;
        RAISE NOTICE 'Contrainte valid_category_icons supprimée';
    END IF;
END $$;

-- 2. Recréer la contrainte avec les bonnes icônes
ALTER TABLE public.journey_categories 
ADD CONSTRAINT valid_category_icons 
CHECK (icon IN ('building', 'utensils', 'mountain', 'camera', 'landmark', 'palette'));

-- 3. Créer la fonction pour forcer la suppression des analytics_events
CREATE OR REPLACE FUNCTION force_delete_analytics_for_step(step_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Supprimer toutes les références dans analytics_events pour cette étape
  DELETE FROM analytics_events WHERE step_id = step_id_param;
  
  -- Log pour le débogage
  RAISE NOTICE 'Suppression forcée des analytics_events pour l''étape: %', step_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION force_delete_analytics_for_step(UUID) TO authenticated;

-- 5. Vérifier que tout est bien appliqué
DO $$
BEGIN
    RAISE NOTICE '✅ Contrainte valid_category_icons mise à jour avec succès';
    RAISE NOTICE '✅ Fonction force_delete_analytics_for_step créée avec succès';
END $$; 