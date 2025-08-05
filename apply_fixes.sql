-- Script complet pour appliquer toutes les corrections
-- À exécuter dans Supabase Studio → SQL Editor

-- 1. CORRECTION DE LA CONTRAINTE valid_category_icons
-- Supprimer la contrainte existante si elle existe
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

-- Recréer la contrainte avec les bonnes icônes
ALTER TABLE public.journey_categories 
ADD CONSTRAINT valid_category_icons 
CHECK (icon IN ('building', 'utensils', 'mountain', 'camera', 'landmark', 'palette'));

-- 2. CRÉER LA FONCTION DE SUPPRESSION FORCÉE
CREATE OR REPLACE FUNCTION force_delete_analytics_for_step(step_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Supprimer toutes les références dans analytics_events pour cette étape
  DELETE FROM analytics_events WHERE step_id = step_id_param;
  
  -- Log pour le débogage
  RAISE NOTICE 'Suppression forcée des analytics_events pour l''étape: %', step_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. DONNER LES PERMISSIONS NÉCESSAIRES
GRANT EXECUTE ON FUNCTION force_delete_analytics_for_step(UUID) TO authenticated;

-- 4. VÉRIFIER QUE TOUT EST BIEN APPLIQUÉ
DO $$
BEGIN
    RAISE NOTICE '✅ Contrainte valid_category_icons mise à jour avec succès';
    RAISE NOTICE '✅ Fonction force_delete_analytics_for_step créée avec succès';
    RAISE NOTICE '✅ Permissions accordées avec succès';
END $$;

-- 5. VÉRIFICATION FINALE
SELECT 
    'Contrainte valid_category_icons' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'valid_category_icons' 
            AND table_name = 'journey_categories'
        ) THEN '✅ Existe'
        ELSE '❌ Manquante'
    END as status
UNION ALL
SELECT 
    'Fonction force_delete_analytics_for_step' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'force_delete_analytics_for_step'
        ) THEN '✅ Existe'
        ELSE '❌ Manquante'
    END as status; 